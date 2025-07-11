import { Plugin } from 'ckeditor5/src/core';
import { ButtonView,
	ContextualBalloon,
	clickOutsideHandler,
	CssTransitionDisablerMixin,
	type ViewWithCssTransitionDisabler } from 'ckeditor5/src/ui';
import MgnlLinkActionView from './mgnlLinkActionView';
import MgnlLinkFormView from './mgnllinkformview';
import MgnlLinkCommand from './mgnllinkcommand';
import { MgnlLinkFormCommand } from './mgnllinkformcommand';
import MgnlUnlinkCommand from './mgnlunlinkcommand';
import util from './mgnllinkutil';
import type { Locale, PositionOptions } from 'ckeditor5/src/utils';
import {
	ClickObserver,
	type ViewAttributeElement,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewNode,
	type ViewPosition
} from 'ckeditor5/src/engine';
import { isWidget } from 'ckeditor5/src/widget';
import { MgnlLinkButtonCommand } from './mgnllinkbuttoncommand';
import { MgnlLinkButtonDefinition } from './mgnllinkbuttondefinition';
import iconPages from '../../theme/icons/link-pages.svg';
import iconAssets from '../../theme/icons/link-assets.svg';
import { MgnlLink } from '../index';

const VISUAL_SELECTION_MARKER_NAME = 'link-ui';
export default class MgnlLinkUI extends Plugin {
	public static get pluginName() {
		return 'MgnlLinkUI' as const;
	}

	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon!: ContextualBalloon;

	private workspaceLabelMap = new Map<string, string>( [
		[ 'website', 'Link to pages' ],
		[ 'dam', 'Link to assets' ]
	] );

	/**
	 * The actions view displayed inside of the balloon.
	 */
	public actionsView: MgnlLinkActionView | null = null;

	/**
	 * The form view displayed inside the balloon.
	 */
	public formView: MgnlLinkFormView & ViewWithCssTransitionDisabler | null = null;


	public init(): void {
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.editor.editing.view.addObserver( ClickObserver );
		this._enableBalloonActivators();
		this._definePluginButtons();
		this._handleSelectionChanges();
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} should be displayed.
	 */
	private _enableBalloonActivators(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		// Handle click on view document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
		this.listenTo( viewDocument, 'click', ( evt, data ) => {
			const parentLink = this._getSelectedLinkElement();

			if ( parentLink ) {
				// prevent default action from link plugin.
				evt.stop();
				data.preventDefault();
				// Then show panel but keep focus inside editor editable.
				this._showUI();
			}
		}, { priority: 'highest' } );
	}

	/**
	 * Shows the correct UI type. It is either {@link #formView} or {@link #actionsView}.
	 *
	 * @internal
	 */
	public _showUI( forceVisible: boolean = false ): void {
		if ( !this.formView ) {
			this._createViews();
		}

		// When there's no link under the selection, go straight to the editing UI.
		if ( !this._getSelectedLinkElement() ) {
			// Show visual selection on a text without a link when the contextual balloon is displayed.
			// See https://github.com/ckeditor/ckeditor5/issues/4721.
			this._showFakeVisualSelection();

			this._addActionsView();

			// Be sure panel with link is visible.
			if ( forceVisible ) {
				this._balloon.showStack( 'main' );
			}

			this._addFormView();
		}

		// If there's a link under the selection...
		else {
			// Go to the editing UI if actions are already visible.
			if ( this._areActionsVisible ) {
				this._addFormView();
			}
			// Otherwise display just the actions UI.
			else {
				this._addActionsView();
			}

			// Be sure panel with link is visible.
			if ( forceVisible ) {
				this._balloon.showStack( 'main' );
			}
		}

		// Begin responding to ui#update once the UI is added.
		this._startUpdatingUI();
	}

	/**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
	 */
	private _showFakeVisualSelection(): void {
		const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange()!;

			if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
				writer.updateMarker( VISUAL_SELECTION_MARKER_NAME, { range } );
			} else {
				if ( range.start.isAtEnd ) {
					const startPosition = range.start.getLastMatchingPosition(
						( { item } ) => !model.schema.isContent( item ),
						{ boundaries: range }
					);

					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range: writer.createRange( startPosition, range.end )
					} );
				} else {
					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range
					} );
				}
			}
		} );
	}

	/**
	 * Adds the {@link #actionsView} to the {@link #_balloon}.
	 *
	 * @internal
	 */
	private _addActionsView(): void {
		if ( !this.actionsView ) {
			this.actionsView = this._createActionsView();
		}

		if ( this._areActionsInPanel ) {
			return;
		}

		this._balloon.add( {
			view: this.actionsView!,
			position: this._getBalloonPositionData()
		} );

		// Attach lifecycle actions to the balloon.
		this._enableUserBalloonInteractions();
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	private _addFormView(): void {
		if ( !this.formView ) {
			this._createViews();
		}

		if ( this._isFormInPanel ) {
			return;
		}

		const editor = this.editor;

		this.formView!.disableCssTransitions();

		this._balloon.add( {
			view: this.formView!,
			position: this._getBalloonPositionData()
		} );

		this.formView!.enableCssTransitions();
	}

	/**
	 * Creates views.
	 */
	private _createViews() {
		this.actionsView = this._createActionsView();
		this.formView = this._createFormView();

		// Attach lifecycle actions to the the balloon.
		this._enableUserBalloonInteractions();
	}

	private _createActionsView() {
		const editor = this.editor;
		const actionsView = new MgnlLinkActionView( editor.locale);
		const linkCommand = editor.commands.get( MgnlLinkCommand.COMMAND_NAME )!;
		const unlinkCommand: MgnlUnlinkCommand = editor.commands.get( MgnlUnlinkCommand.COMMAND_NAME )!;

		actionsView.bind( 'path' ).to( linkCommand, 'value', value => util.getMgnlLinkPath( value as string ) );
		actionsView.bind( 'pluginName' ).to( linkCommand, 'value',
			value => this.workspaceLabelMap.get( util.getMgnlLinkRepository( value as string )! ) );
		actionsView.editButtonView.bind( 'isEnabled' ).to( linkCommand );
		actionsView.unlinkButtonView.bind( 'isEnabled' ).to( unlinkCommand );

		// Execute {@link MgnlLinkButtonCommand.COMMAND_NAME} command after clicking on the "Edit" button.
		this.listenTo( actionsView, 'edit', () => {
			editor.model.change( () => {
				const mgnlLinkAttributeValues = util.findMgnlLinkAttributeValuesOnSelection( editor.model );
				if ( mgnlLinkAttributeValues.workspace && mgnlLinkAttributeValues.path ) {
					const workspace = mgnlLinkAttributeValues.workspace;
					const path = mgnlLinkAttributeValues.path;
					editor.execute( MgnlLinkButtonCommand.COMMAND_NAME, { workspace, path } );
				}
			} );
		} );

		this.listenTo( actionsView, 'properties', () => {
			this._addFormView();
		})

		// Execute unlink command after clicking on the "Unlink" button.
		this.listenTo( actionsView, 'unlink', () => {
			editor.execute( MgnlUnlinkCommand.COMMAND_NAME );
			this._hideUI();
		} );

		// Close the panel on esc key press when the **actions have focus**.
		actionsView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		return actionsView;
	}

	/**
	 * Creates the {@link module:mgnllink/ui/mgnllinkformview~MgnlLinkFormView} instance.
	 */
	private _createFormView(): MgnlLinkFormView & ViewWithCssTransitionDisabler {
		const editor = this.editor;
		const linkFormCommand = editor.commands.get( MgnlLinkFormCommand.COMMAND_NAME )! as MgnlLinkFormCommand;

		const formView = new ( CssTransitionDisablerMixin( MgnlLinkFormView ) )( editor.locale, linkFormCommand );

		// Execute link command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			editor.execute( MgnlLinkFormCommand.COMMAND_NAME, formView.getDecoratorSwitchesState() );
			this._closeFormView();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._closeFormView();
		} );

		// Close the panel on esc key press when the **form has focus**.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._closeFormView();
			cancel();
		} );

		return formView;
	}

	/**
	 * Closes the form view. Decides whether the balloon should be hidden completely or if the action view should be shown. This is
	 * decided upon the link command value (which has a value if the document selection is in the link).
	 *
	 * Additionally, if any {@link module:mgnllink/mgnllinkconfig~MgnlLinkConfig#decorators} are defined in the editor configuration, the state of
	 * switch buttons responsible for manual decorator handling is restored.
	 */
	private _closeFormView(): void {
		const linkFormCommand = this.editor.commands.get( MgnlLinkFormCommand.COMMAND_NAME )! as MgnlLinkFormCommand;
		const linkCommand = this.editor.commands.get( MgnlLinkCommand.COMMAND_NAME )! as MgnlLinkCommand;

		// Restore manual decorator states to represent the current model state. This case is important to reset the switch buttons
		// when the user cancels the editing form.
		linkFormCommand.restoreManualDecoratorStates();

		if ( linkCommand.value !== undefined ) {
			this._removeFormView();
		} else {
			this._hideUI();
		}
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */
	private _removeFormView(): void {
		if ( this._isFormInPanel ) {
			// Blur the input element before removing it from DOM to prevent issues in some browsers.
			// See https://github.com/ckeditor/ckeditor5/issues/1501.
			this.formView!.saveButtonView.focus();

			this._balloon.remove( this.formView! );

			// Because the form has an input which has focus, the focus must be brought back
			// to the editor. Otherwise, it would be lost.
			this.editor.editing.view.focus();

			this._hideFakeVisualSelection();
		}
	}

	/**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isFormInPanel(): boolean {
		return !!this.formView && this._balloon.hasView( this.formView );
	}

	/**
	 * Returns `true` when {@link #actionsView} is in the {@link #_balloon}.
	 */
	private get _areActionsInPanel(): boolean {
		return !!this.actionsView && this._balloon.hasView( this.actionsView );
	}

	private _getBalloonPositionData() {
		const view = this.editor.editing.view;
		const model = this.editor.model;
		const viewDocument = view.document;
		let target: PositionOptions[ 'target' ];

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			// There are cases when we highlight selection using a marker (#7705, #4721).
			const markerViewElements = Array.from( this.editor.editing.mapper.markerNameToElements( VISUAL_SELECTION_MARKER_NAME )! );
			const newRange = view.createRange(
				view.createPositionBefore( markerViewElements[ 0 ] ),
				view.createPositionAfter( markerViewElements[ markerViewElements.length - 1 ] )
			);

			target = view.domConverter.viewRangeToDom( newRange );
		} else {
			// Make sure the target is calculated on demand at the last moment because a cached DOM range
			// (which is very fragile) can desynchronize with the state of the editing view if there was
			// any rendering done in the meantime. This can happen, for instance, when an inline widget
			// gets unlinked.
			target = () => {
				const targetLink = this._getSelectedLinkElement();

				return targetLink ?
					// When selection is inside link element, then attach panel to this element.
					view.domConverter.mapViewToDom( targetLink )! :
					// Otherwise attach panel to the selection.
					view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange()! );
			};
		}

		return { target };
	}

	/**
	 * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
	 * the {@link module:engine/view/document~Document editing view's} selection or `null`
	 * if there is none.
	 *
	 * **Note**: For a non–collapsed selection, the link element is returned when **fully**
	 * selected and the **only** element within the selection boundaries, or when
	 * a linked widget is selected.
	 */
	private _getSelectedLinkElement(): ViewAttributeElement | null {
		const view = this.editor.editing.view;
		const selection = view.document.selection;
		const selectedElement = selection.getSelectedElement();

		// The selection is collapsed or some widget is selected (especially inline widget).
		if ( selection.isCollapsed || selectedElement && isWidget( selectedElement ) ) {
			return findMgnlLinkElementAncestor( selection.getFirstPosition()! );
		} else {
			// The range for fully selected link is usually anchored in adjacent text nodes.
			// Trim it to get closer to the actual link element.
			const range = selection.getFirstRange()!.getTrimmed();
			const startLink = findMgnlLinkElementAncestor( range.start );
			const endLink = findMgnlLinkElementAncestor( range.end );

			if ( !startLink || startLink != endLink ) {
				return null;
			}

			// Check if the link element is fully selected.
			if ( view.createRangeIn( startLink ).getTrimmed().isEqual( range ) ) {
				return startLink;
			} else {
				return null;
			}
		}

		/**
		 * Returns a mgnl link element if there's one among the ancestors of the provided `Position`.
		 *
		 * @param View position to analyze.
		 * @returns Link element at the position or null.
		 */
		function findMgnlLinkElementAncestor( position: ViewPosition ): ViewAttributeElement | null {
			return position.getAncestors().find( ( ancestor ): ancestor is ViewAttributeElement => isMgnlLinkElement( ancestor ) ) || null;
		}

		/**
		 * Returns `true` if the provided `ViewNode` is a mgnl link.
		 * @param node
		 */
		function isMgnlLinkElement( node: ViewNode | ViewDocumentFragment ): boolean {
			return node.is( 'attributeElement' ) && !!node.getCustomProperty( 'link' ) &&
				util.isMgnlLink( node.getAttribute( 'href' ) as string );
		}
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_addFormView}, {@link #_addActionsView}.
	 */
	private _hideUI(): void {
		if ( !this._isUIInPanel ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );
		this.stopListening( this._balloon, 'change:visibleView' );

		// Make sure the focus always gets back to the editable _before_ removing the focused form view.
		// Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
		editor.editing.view.focus();

		// Remove form first because it's on top of the stack.
		this._removeFormView();


		// Then remove the actions view because it's beneath the form.
		this._balloon.remove( this.actionsView! );

		this._hideFakeVisualSelection();
	}

	/**
	 * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
	 */
	private _hideFakeVisualSelection(): void {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}

	/**
	 * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor UI should be refreshed.
	 *
	 * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
	 */
	private _startUpdatingUI(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		let prevSelectedLink = this._getSelectedLinkElement();
		let prevSelectionParent = getSelectionParent();

		const update = () => {
			const selectedLink = this._getSelectedLinkElement();
			const selectionParent = getSelectionParent();

			// Hide the panel if:
			//
			// * the selection went out of the EXISTING link element. E.g. user moved the caret out
			//   of the link,
			// * the selection went to a different parent when creating a NEW link. E.g. someone
			//   else modified the document.
			// * the selection has expanded (e.g. displaying link actions then pressing SHIFT+Right arrow).
			//
			// Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
			// when fully selected.
			if ( ( prevSelectedLink && !selectedLink ) ||
				( !prevSelectedLink && selectionParent !== prevSelectionParent ) ) {
				this._hideUI();
			}
			// Update the position of the panel when:
			//  * link panel is in the visible stack
			//  * the selection remains in the original link element,
			//  * there was no link element in the first place, i.e. creating a new link
			else if ( this._isUIVisible ) {
				// If still in a link element, simply update the position of the balloon.
				// If there was no link (e.g. inserting one), the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				this._balloon.updatePosition( this._getBalloonPositionData() );
			}

			prevSelectedLink = selectedLink;
			prevSelectionParent = selectionParent;
		};

		function getSelectionParent() {
			return viewDocument.selection.focus!.getAncestors()
				.reverse()
				.find( ( node ): node is ViewElement => node.is( 'element' ) );
		}

		this.listenTo( editor.ui, 'update', update );
		this.listenTo( this._balloon, 'change:visibleView', update );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 */
	private _enableUserBalloonInteractions(): void {
		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isUIVisible ) {
				this._hideUI();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView!,
			activator: () => this._isUIInPanel,
			contextElements: () => [ this._balloon.view.element! ],
			callback: () => this._hideUI()
		} );
	}

	/**
	 * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isUIInPanel(): boolean {
		return this._isFormInPanel || this._areActionsInPanel;
	}

	/**
	 * Returns `true` when {@link #actionsView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _areActionsVisible(): boolean {
		return !!this.actionsView && this._balloon.visibleView === this.actionsView;
	}

	/**
	 * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _isUIVisible(): boolean {
		return this._areActionsVisible;
	}

	private _definePluginButtons() {
		this.editor.ui.componentFactory.add( 'mgnlPagesLink', locale => {
			const buttonDefinition = new MgnlLinkButtonDefinition( this.workspaceLabelMap.get( 'website' )!, iconPages, 'website', '/' );
			return this.createMgnlLinkPluginButton( buttonDefinition, locale );
		} );
		this.editor.ui.componentFactory.add( 'mgnlAssetsLink', locale => {
			const buttonDefinition = new MgnlLinkButtonDefinition( this.workspaceLabelMap.get( 'dam' )!, iconAssets, 'dam', '/' );
			return this.createMgnlLinkPluginButton( buttonDefinition, locale
			);
		} );
	}

	private createMgnlLinkPluginButton( definition: MgnlLinkButtonDefinition, locale: Locale ): ButtonView {
		const editor = this.editor;
		const model = editor.model;
		const buttonView = new ButtonView( locale );

		buttonView.set( {
			label: editor.t( definition.getLabel() ),
			icon: definition.getIcon(),
			tooltip: true
		} );

		// Listen to the execute event of the button.
		this.listenTo( buttonView, 'execute', () => {
			model.change( () => {
				let workspace = definition.getWorkspace();
				let path = definition.getPath();

				const mgnlLinkAttributeValues = util.findMgnlLinkAttributeValuesOnSelection( model );
				if ( mgnlLinkAttributeValues.workspace && mgnlLinkAttributeValues.path ) {
					workspace = mgnlLinkAttributeValues.workspace;
					path = mgnlLinkAttributeValues.path;
				}

				editor.execute( MgnlLinkButtonCommand.COMMAND_NAME, { workspace, path } );
			} );
		} );

		// Binding button states (isOn, isEnabled) to command states.
		const command = editor.commands.get( MgnlLinkButtonCommand.COMMAND_NAME );
		if ( command ) {
			buttonView.bind( 'isEnabled' ).to( command, 'isEnabled', command, 'value', ( isEnabled, value ) => {
				if ( value && typeof value === 'string' ) {
					return util.isContainsMgnlWorkspace( value, definition.getWorkspace() );
				}
				return isEnabled;
			} );
			buttonView.bind( 'isOn' ).to( command, 'value', value => {
				if ( value && typeof value === 'string' ) {
					return util.isContainsMgnlWorkspace( value, definition.getWorkspace() );
				}
				return false;
			} );
		}

		return buttonView;
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		if ( this.formView ) {
			this.formView.destroy();
		}

		if ( this.actionsView ) {
			this.actionsView.destroy();
		}
	}

	private _handleSelectionChanges() {
		// Prevent the Link button being enabled when a Mgnl Link is selected.
		this.editor.model.document.on( 'change', ( evt, data ) => {
			const linkCommand = this.editor.commands.get( 'link' )!;
			if ( this.editor.model.document.selection.hasAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE ) ) {
				// disable the 'link' command, so the 'Link' button will not be enabled
				linkCommand.forceDisabled( 'randomId' );
				linkCommand.value = '';
			} else {
				linkCommand.clearForceDisabled( 'randomId' );
			}
		} );
	}
}
