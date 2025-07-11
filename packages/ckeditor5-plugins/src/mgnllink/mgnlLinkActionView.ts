import { ButtonView, createLabeledInputText, LabeledFieldView, LabelView, View } from 'ckeditor5/src/ui.js';
import { KeystrokeHandler, type Locale, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { icons } from 'ckeditor5/src/core.js';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/linkactions.css';
import unlinkIcon from '../../theme/icons/unlink.svg';

import type { LinkConfig } from '@ckeditor/ckeditor5-link';

export default class MgnlLinkActionView extends View {
	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	public pluginNameView: LabelView;
	public pathFieldView: LabeledFieldView;

	/**
	 * The unlink button view.
	 */
	public unlinkButtonView: ButtonView;

	/**
	 * The edit link button view.
	 */
	public editButtonView: ButtonView;

	/**
	 * The edit link button view.
	 */
	public propertyButtonView: ButtonView;

	declare public pluginName: string | undefined;
	declare public workspace: string | undefined;
	declare public path: string | undefined;

	declare public t: LocaleTranslate;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const t = locale.t;

		this.set( 'pluginName', undefined );
		this.set( 'workspace', undefined );
		this.set( 'path', undefined );

		this.pluginNameView = this._createLabel();
		this.pathFieldView = this._createPreviewLabeledField( 'Path', 'path' );
		this.unlinkButtonView = this._createButton( t( 'Unlink' ), unlinkIcon, 'unlink' );
		this.editButtonView = this._createButton( t( 'Edit link' ), icons.pencil, 'edit' );
		this.propertyButtonView = this._createButton( t( 'Properties' ), icons.cog, 'properties' );

		const leftColView = new View();
		leftColView.setTemplate( {
			tag: 'div',

			children: [
				this.pluginNameView,
				this.pathFieldView
			],
			attributes: {
				class: [
					'ck',
					'mgnl-link-actions-view',
					'ck-labeled-field-view-parent'
				]
			}
		} );

		const rightColView = new View();
		rightColView.setTemplate( {
			tag: 'div',

			children: [
				this.editButtonView,
				this.propertyButtonView,
				this.unlinkButtonView
			],
			attributes: {
				class: [
					'ck',
					'mgnl-link-actions-view',
					'ck-button-view-parent'
				]
			}
		} );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-link-actions',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: [
				leftColView,
				rightColView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.keystrokes.destroy();
	}

	private _createLabel( ): LabelView {
		const label = new LabelView( this.locale );
		label.bind( 'text' ).to( this, 'pluginName' );
		return label;
	}

	/**
	 * Creates a button view.
	 *
	 * @param label The button label.
	 * @param icon The button icon.
	 * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns The button view instance.
	 */
	private _createButton( label: string, icon: string, eventName?: string ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.delegate( 'execute' ).to( this, eventName );

		return button;
	}

	/**
	 * Creates a labeled that bind to 'workspace' or 'path' of the selected link.
	 *
	 * @returns The button view instance.
	 */
	private _createPreviewLabeledField( label: string, bindTo: 'workspace' | 'path' ): LabeledFieldView {
		const textInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const t = this.t;

		textInput.set( { label: t( label ) } );
		textInput.fieldView.bind( 'value' ).to( this, bindTo, value => {
			return value || t( 'This link has no ' + bindTo );
		} );

		textInput.fieldView.extendTemplate( {
			attributes: {
				readonly: true
			}
		} );

		return textInput;
	}
}

/**
 * Fired when the {@link ~MgnlLinkActionView#editButtonView} is clicked.
 *
 * @eventName ~LinkActionsView#edit
 */
export type EditEvent = {
	name: 'edit';
	args: [];
};

/**
 * Fired when the {@link ~MgnlLinkActionView#unlinkButtonView} is clicked.
 *
 * @eventName ~LinkActionsView#unlink
 */
export type UnlinkEvent = {
	name: 'unlink';
	args: [];
};

