import { Plugin } from 'ckeditor5/src/core';
import MgnlLinkCommand from './mgnllinkcommand';
import { MgnlLinkFormCommand } from './mgnllinkformcommand';
import MgnlUnlinkCommand  from './mgnlunlinkcommand';
import util from './mgnllinkutil';
import { MgnlLinkButtonCommand } from './mgnllinkbuttoncommand';
import MgnlLinkUI from './mgnllinkui';
import ManualDecorator from '@ckeditor/ckeditor5-link/src/utils/manualdecorator';
import type { MgnlNormalizedLinkDecoratorManualDefinition } from './mgnllinkutil';


const DECORATOR_MANUAL = 'manual';

export default class MgnlLink extends Plugin {
	public static get pluginName() {
		return 'MgnlLink' as const;
	}

	public static MGNL_GET_LINK_EVENT = 'mgnlGetLink';
	public MGNL_RESOURCE_SELECTED_EVENT = 'mgnlLinkSelected';
	public static MGNL_LINK_ATTRIBUTE = 'mgnlLink';

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MgnlLinkUI ] as const;
	}

	public init(): void {
		const editor = this.editor;
		this._defineSchema();
		this._defineConverters();
		this._defineCommands();
		this._defineEventListenerCallback();

		const linkDecorators = util.getLocalizedDecorators( editor.t, util.normalizeDecorators( editor.config.get( 'mgnllink.decorators' ) ) );

		this._enableManualDecorators( linkDecorators
			.filter( ( item ): item is MgnlNormalizedLinkDecoratorManualDefinition => item.mode === DECORATOR_MANUAL ) );
	}

	private _defineSchema() {
		// extend the schema with a new attribute 'MgnlLink.MGNL_LINK_ATTRIBUTE'.
		// the selected text that has this attribute will be linked to mgnl selected resource.
		this.editor.model.schema.extend( '$text', {
			allowAttributes: MgnlLink.MGNL_LINK_ATTRIBUTE
		} );
	}

	private _defineConverters() {
		// Convert html <a> tag to the $text node which has the model attribute 'MgnlLink.MGNL_LINK_ATTRIBUTE'.
		this.editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: 'a',
			model: {
				key: MgnlLink.MGNL_LINK_ATTRIBUTE,
				value: ( viewElement: any ) => {
					const href = viewElement.getAttribute( 'href' );
					if ( href ) {
						if ( util.isMgnlLink( href ) ) {
							return href;
						}
					}
				}
			},
			converterPriority: 'high'
		} );
	}

	private _defineCommands() {
		this.editor.commands.add( MgnlLinkButtonCommand.COMMAND_NAME, new MgnlLinkButtonCommand( this.editor ) );
		this.editor.commands.add( MgnlLinkCommand.COMMAND_NAME, new MgnlLinkCommand( this.editor ) );
		this.editor.commands.add( MgnlLinkFormCommand.COMMAND_NAME, new MgnlLinkFormCommand( this.editor ) );
		this.editor.commands.add( MgnlUnlinkCommand.COMMAND_NAME, new MgnlUnlinkCommand( this.editor ) );
	}

	private _defineEventListenerCallback( ) {
		const editor = this.editor;
		// listen to the mgnlLinkSelected event. Create a link to the selected resource
		editor.on( this.MGNL_RESOURCE_SELECTED_EVENT, ( evt, data ) => {
			// insert event data to the editor
			editor.execute( MgnlLinkCommand.COMMAND_NAME, data );
			editor.editing.view.focus();
		} );
	}

	/**
	 * Processes an array of configured {@link module:link/linkconfig~LinkDecoratorManualDefinition manual decorators},
	 * transforms them into {@link module:link/utils/manualdecorator~ManualDecorator} instances and stores them in the
	 * {@link module:link/linkcommand~LinkCommand#manualDecorators} collection (a model for manual decorators state).
	 *
	 * Also registers an {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement attribute-to-element}
	 * converter for each manual decorator and extends the {@link module:engine/model/schema~Schema model's schema}
	 * with adequate model attributes.
	 */
	private _enableManualDecorators( manualDecoratorDefinitions: Array<MgnlNormalizedLinkDecoratorManualDefinition> ): void {
		if ( !manualDecoratorDefinitions.length ) {
			return;
		}

		const editor = this.editor;
		const command = editor.commands.get( MgnlLinkFormCommand.COMMAND_NAME )! as MgnlLinkFormCommand;
		const manualDecorators = command.manualDecorators;

		manualDecoratorDefinitions.forEach( decoratorDefinition => {
			editor.model.schema.extend( '$text', { allowAttributes: decoratorDefinition.id } );

			// Keeps reference to manual decorator to decode its name to attributes during downcast.
			const decorator = new ManualDecorator( decoratorDefinition );

			manualDecorators.add( decorator );

			editor.conversion.for( 'downcast' ).attributeToElement( {
				model: decorator.id,
				view: ( manualDecoratorValue, { writer, schema }, { item } ) => {
					// Manual decorators for block links are handled e.g. in LinkImageEditing.
					if ( !( item.is( 'selection' ) || schema.isInline( item ) ) ) {
						return;
					}

					if ( manualDecoratorValue ) {
						const element = writer.createAttributeElement( 'a', decorator.attributes, { priority: 5 } );

						if ( decorator.classes ) {
							writer.addClass( decorator.classes, element );
						}

						for ( const key in decorator.styles ) {
							writer.setStyle( key, decorator.styles[ key ], element );
						}

						writer.setCustomProperty( 'link', true, element );

						return element;
					}
				}
			} );

			editor.conversion.for( 'upcast' ).elementToAttribute( {
				view: {
					name: 'a',
					...decorator._createPattern()
				},
				model: {
					key: decorator.id
				}
			} );
		} );
	}
}
