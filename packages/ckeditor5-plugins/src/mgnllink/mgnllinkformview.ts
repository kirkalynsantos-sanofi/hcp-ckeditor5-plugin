import {
	ButtonView,
		FocusCycler,
		SwitchButtonView,
		View,
		ViewCollection,
		submitHandler,
		type FocusableView
} from 'ckeditor5/src/ui';
import {
	FocusTracker,
	KeystrokeHandler,
	type Collection,
	type Locale
} from 'ckeditor5/src/utils.js';
import { icons } from 'ckeditor5/src/core';

import type { MgnlLinkFormCommand } from './mgnllinkformcommand';
import ManualDecorator from '@ckeditor/ckeditor5-link/src/utils/manualdecorator';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '@ckeditor/ckeditor5-link/theme/linkform.css';
export default class MgnlLinkFormView extends View {
	/**
	 * Tracks information about DOM focus in the form.
	 */
	public readonly focusTracker = new FocusTracker();

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	/**
	 * The Save button view.
	 */
	public saveButtonView: ButtonView;

	/**
	 * The Cancel button view.
	 */
	public cancelButtonView: ButtonView;

	/**
	 * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
	 * which corresponds to {@link module:mgnllink/mgnllinkcommand~MgnlLinkCommand#manualDecorators manual decorators}
	 * configured in the editor.
	 */
	private readonly _manualDecoratorSwitches: ViewCollection<SwitchButtonView>;

	/**
	 * A collection of child views in the form.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:mgnllink/linkformview~LinkFormView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param linkFormCommand Reference to {@link module:mgnllink/linkformcommand~LinkFormCommand}.
	 */
	constructor( locale: Locale, linkFormCommand: MgnlLinkFormCommand ) {
		super( locale );

		const t = locale.t;

		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );
		this._manualDecoratorSwitches = this._createManualDecoratorSwitches( linkFormCommand );
		this.children = this._createFormChildren( linkFormCommand.manualDecorators );

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		const classList = [ 'ck', 'ck-link-form', 'ck-responsive-form' ];

		if ( linkFormCommand.manualDecorators.length ) {
			classList.push( 'ck-link-form_layout-vertical', 'ck-vertical-form' );
		}

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: classList,

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: this.children
		} );
	}

	/**
	 * Obtains the state of the {@link module:ui/button/switchbuttonview~SwitchButtonView switch buttons} representing
	 * {@link module:link/linkcommand~LinkCommand#manualDecorators manual link decorators}
	 * in the {@link module:mgnllink/mgnllinkformview~MgnlLinkFormView}.
	 *
	 * @returns Key-value pairs, where the key is the name of the decorator and the value is its state.
	 */
	public getDecoratorSwitchesState(): Record<string, boolean> {
		return Array
			.from( this._manualDecoratorSwitches as Iterable<SwitchButtonView & { name: string }> )
			.reduce( ( accumulator, switchButton ) => {
				accumulator[ switchButton.name ] = switchButton.isOn;
				return accumulator;
			}, {} as Record<string, boolean> );
	}
	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler( {
			view: this
		} );

		const childViews = [
			...this._manualDecoratorSwitches,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates a button view.
	 *
	 * @param label The button label.
	 * @param icon The button icon.
	 * @param className The additional button CSS class name.
	 * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns The button view instance.
	 */
	private _createButton( label: string, icon: string, className: string, eventName?: string ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}

	/**
	 * Populates {@link module:ui/viewcollection~ViewCollection} of {@link module:ui/button/switchbuttonview~SwitchButtonView}
	 * made based on {@link module:mgnllink/mgnllinkcommand~MgnlLinkCommand#manualDecorators}.
	 *
	 * @param mgnllinkCommand A reference to the link form command.
	 * @returns ViewCollection of switch buttons.
	 */
	private _createManualDecoratorSwitches(linkFormCommand: MgnlLinkFormCommand ): ViewCollection<SwitchButtonView> {
		const switches = this.createCollection<SwitchButtonView>();

		for ( const manualDecorator of linkFormCommand.manualDecorators ) {
			const switchButton: SwitchButtonView & { name?: string } = new SwitchButtonView( this.locale );

			switchButton.set( {
				name: manualDecorator.id,
				label: manualDecorator.label,
				withText: true
			} );

			switchButton.bind( 'isOn' ).toMany( [ manualDecorator, linkFormCommand ], 'value', (decoratorValue, commandValue ) => {
				return commandValue === undefined && decoratorValue === undefined ? !!manualDecorator.defaultValue : !!decoratorValue;
			} );

			switchButton.on( 'execute', () => {
				manualDecorator.set( 'value', !switchButton.isOn );
			} );

			switches.add( switchButton );
		}

		return switches;
	}

	/**
	 * Populates the {@link #children} collection of the form.
	 *
	 * If {@link module:mgnllink/mgnllinkformcommand~MgnlLinkFormCommand#manualDecorators manual decorators} are configured in the editor, it creates an
	 * additional `View` wrapping all {@link #_manualDecoratorSwitches} switch buttons corresponding
	 * to these decorators.
	 *
	 * @param manualDecorators A reference to
	 * the collection of manual decorators stored in the link form command.
	 * @returns The children of link form view.
	 */
	private _createFormChildren( manualDecorators: Collection<ManualDecorator> ): ViewCollection {
		const children = this.createCollection();

		if ( manualDecorators.length ) {
			const additionalButtonsView = new View();

			additionalButtonsView.setTemplate( {
				tag: 'ul',
				children: this._manualDecoratorSwitches.map( switchButton => ( {
					tag: 'li',
					children: [ switchButton ],
					attributes: {
						class: [
							'ck',
							'ck-list__item'
						]
					}
				} ) ),
				attributes: {
					class: [
						'ck',
						'ck-reset',
						'ck-list'
					]
				}
			} );
			children.add( additionalButtonsView );
		}

		children.add( this.saveButtonView );
		children.add( this.cancelButtonView );

		return children;
	}
}

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * for example with a click on {@link ~MgnlLinkFormView#saveButtonView}.
 *
 * @eventName ~MgnlLinkFormView#submit
 */
export type SubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled, for example with a click on {@link ~MgnlLinkFormView#cancelButtonView}.
 *
 * @eventName ~MgnlLinkFormView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
