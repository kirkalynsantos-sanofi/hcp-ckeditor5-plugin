import { icons, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, CollapsibleView, DropdownButtonView, type FocusableView } from 'ckeditor5/src/ui.js';

import { ImageInsertUI } from '@ckeditor/ckeditor5-image';
import type { InsertImageCommand, ReplaceImageSourceCommand } from '@ckeditor/ckeditor5-image/';
import MgnlImageInsertUrlView, {
	type ImageInsertUrlViewBrowseEvent,
	type ImageInsertUrlViewCancelEvent,
	type ImageInsertUrlViewSubmitEvent
} from './mgnlimageinserturlview';

/**
 * The image insert via URL plugin (UI part).
 *
 * For a detailed overview, check the {@glink features/images/images-inserting
 * Insert images via source URL} documentation.
 *
 * This plugin registers the {@link ImageInsertUI} integration for `mgnlurl`.
 */
export default class MgnlImageInsertViaUrlUI extends Plugin {
	private _imageInsertUI!: ImageInsertUI;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MgnlImageInsertViaUrlUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageInsertUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._imageInsertUI = this.editor.plugins.get( 'ImageInsertUI' );

		this._imageInsertUI.registerIntegration( {
			name: 'mgnlurl',
			observable: () => this.editor.commands.get( 'insertImage' )!,
			requiresForm: true,
			buttonViewCreator: isOnlyOne => this._createInsertUrlButton( isOnlyOne ),
			formViewCreator: isOnlyOne => this._createInsertUrlView( isOnlyOne )
		} );

		this.editor.listenTo( this.editor.editing.view.document, 'dblclick', ( evt, data ) => {
			let clickedElement = data.domTarget;
			if ( clickedElement.tagName.toLowerCase() != 'img' ) {
				clickedElement = clickedElement.closest( 'img' );
			}
			if ( !clickedElement ) {
				return;
			}
			this._imageInsertUI.dropdownView!.isOpen = true;
		}, { priority: 'highest' }
		);
	}

	/**
	 * Creates the view displayed in the dropdown.
	 */
	private _createInsertUrlView( isOnlyOne: boolean ): FocusableView {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;

		const replaceImageSourceCommand: ReplaceImageSourceCommand = editor.commands.get( 'replaceImageSource' )!;
		const insertImageCommand: InsertImageCommand = editor.commands.get( 'insertImage' )!;

		const imageInsertUrlView = new MgnlImageInsertUrlView( locale );
		const collapsibleView = isOnlyOne ? null : new CollapsibleView( locale, [ imageInsertUrlView ] );

		imageInsertUrlView.bind( 'isImageSelected' ).to( this._imageInsertUI );
		imageInsertUrlView.bind( 'isEnabled' ).toMany( [ insertImageCommand, replaceImageSourceCommand ], 'isEnabled', ( ...isEnabled ) => (
			isEnabled.some( isCommandEnabled => isCommandEnabled )
		) );

		// Set initial value because integrations are created on first dropdown open.
		imageInsertUrlView.imageURLInputValue = replaceImageSourceCommand.value || '';

		this._imageInsertUI.dropdownView!.on( 'change:isOpen', () => {
			if ( this._imageInsertUI.dropdownView!.isOpen ) {
				// Make sure that each time the panel shows up, the URL field remains in sync with the value of
				// the command. If the user typed in the input, then canceled and re-opened it without changing
				// the value of the media command (e.g. because they didn't change the selection), they would see
				// the old value instead of the actual value of the command.
				imageInsertUrlView.imageURLInputValue = replaceImageSourceCommand.value || '';

				if ( collapsibleView ) {
					collapsibleView.isCollapsed = true;
				}
			}

			// Note: Use the low priority to make sure the following listener starts working after the
			// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
			// invisible form/input cannot be focused/selected.
		}, { priority: 'low' } );

		imageInsertUrlView.on<ImageInsertUrlViewBrowseEvent>( 'browse', () => {
			let path = '/';
			// if the field contains value, send it to the server will preselect the item (if it exists) in dialog,
			// otherwise nothing will be preselected.
			if ( imageInsertUrlView.imageURLInputValue ) {
				path = imageInsertUrlView.imageURLInputValue;
			}
			this.editor.fire( 'mgnlPluginButtonClicked:chooseAsset', path );
		} );

		imageInsertUrlView.on<ImageInsertUrlViewSubmitEvent>( 'submit', () => {
			if ( replaceImageSourceCommand.isEnabled ) {
				editor.execute( 'replaceImageSource', { source: imageInsertUrlView.imageURLInputValue } );
			} else {
				editor.execute( 'insertImage', { source: imageInsertUrlView.imageURLInputValue } );
			}

			this._closePanel();
		} );

		imageInsertUrlView.on<ImageInsertUrlViewCancelEvent>( 'cancel', () => this._closePanel() );

		if ( collapsibleView ) {
			collapsibleView.set( {
				isCollapsed: true
			} );

			collapsibleView.bind( 'label' ).to( this._imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
				t( 'Update image URL' ) :
				t( 'Insert image via URL' )
			);

			return collapsibleView;
		}

		this.editor.on( 'assetChosen', ( evt, data ) => {
			this._imageInsertUI.dropdownView!.isOpen = true;
			// imageInsertUrlView.imageURLInputValue = data;
			const link = JSON.parse( data );
			imageInsertUrlView.imageURLInputValue = link.url;
		} );

		return imageInsertUrlView;
	}

	/**
	 * Creates the toolbar button.
	 */
	private _createInsertUrlButton( isOnlyOne: boolean ): ButtonView {
		const ButtonClass = isOnlyOne ? DropdownButtonView : ButtonView;

		const editor = this.editor;
		const button = new ButtonClass( editor.locale );
		const t = editor.locale.t;

		button.set( {
			icon: icons.imageUrl,
			tooltip: true
		} );

		button.bind( 'label' ).to( this._imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
			t( 'Update image URL' ) :
			t( 'Insert image via URL' )
		);

		return button;
	}

	/**
	 * Closes the dropdown.
	 */
	private _closePanel(): void {
		this.editor.editing.view.focus();
		this._imageInsertUI.dropdownView!.isOpen = false;
	}
}
