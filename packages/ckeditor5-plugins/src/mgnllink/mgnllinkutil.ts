import MgnlLink from './mgnllink';
import { findAttributeRange } from 'ckeditor5/src/typing';
import { upperFirst } from 'lodash-es';
import type { Model, ViewDocumentFragment, ViewNode, Schema, Element } from 'ckeditor5/src/engine';
import type {
	MgnlLinkDecoratorDefinition,
	MgnlLinkDecoratorManualDefinition
} from './mgnllinkconfig';
import type { LocaleTranslate } from 'ckeditor5/src/utils.js';

/**
 * The Magnolia link plugin utility.
 */
export default class MgnlLinkUtil {
	public static findMgnlLinkAttributeValuesOnSelection( model: Model ): { workspace: string | undefined; path: string | undefined } {
		const selection = model.document.selection;
		// Check if the link is already selected and link contains MgnlLink.MGNL_LINK_ATTRIBUTE attribute.
		let workspace: string | undefined = undefined;
		let path: string | undefined = undefined;
		if ( selection.hasAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE ) ) {
			const selected = selection.getAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE );
			if ( selected && typeof selected === 'string' ) {
				// reset target workspace and path if the link is already selected.
				workspace = MgnlLinkUtil.getMgnlLinkRepository( selected );
				path = MgnlLinkUtil.getMgnlLinkPath( selected );

				const position = selection.getFirstPosition()!;
				const linkRange = findAttributeRange( position, MgnlLink.MGNL_LINK_ATTRIBUTE, selected, model );

				// change current selection to the link range.
				model.change( writer => {
					writer.setSelection( linkRange );
				} );
			}
		}
		return { workspace, path };
	}

	/**
	 * Check if the link contains the workspace same as the given workspace name
	 * @param href link to check
	 * @param workspaceToCheck workspace name to check
	 */
	public static isContainsMgnlWorkspace( href: string, workspaceToCheck: string ): boolean {
		return workspaceToCheck === MgnlLinkUtil.getMgnlLinkRepository( href );
	}

	/**
	 * Retrieves the repository from the Magnolia link.
	 * @param href Magnolia link.
	 * @private
	 */
	public static getMgnlLinkRepository( href: string ): string | undefined {
		return MgnlLinkUtil.getMgnlLinkParam( href, 'repository' );
	}

	/**
	 * Retrieves the path from the Magnolia link.
	 * @param href Magnolia link.
	 * @private
	 */
	public static getMgnlLinkPath( href: string ): string | undefined {
		return MgnlLinkUtil.getMgnlLinkParam( href, 'path' );
	}

	/**
	 * Retrieves the param value from the Magnolia link by given param name.
	 * @param href Magnolia link.
	 * @param paramName
	 * @private
	 */
	private static getMgnlLinkParam( href: string, paramName: string ): string | undefined {
		if ( !this.isMgnlLink( href ) ) {
			return undefined;
		}
		const regexp = new RegExp( `${ paramName }:{([^}]*)}` );
		const param = href.match( regexp );

		if ( param ) {
			return param[ 1 ];
		} else {
			return undefined;
		}
	}

	/**
	 * Returns `true` if the provided `ViewNode` is a mgnl link.
	 * @param node
	 */
	public static isMgnlLinkElement( node: ViewNode | ViewDocumentFragment ): boolean {
		return node.is( 'attributeElement' ) && !!node.getCustomProperty( 'link' ) &&
			this.isMgnlLink( node.getAttribute( 'href' ) as string );
	}

	/**
     * Checks if the given Magnolia link is valid.
     * @param href Magnolia link.
     * @private
     */
	public static isMgnlLink( href: string ): boolean {
		if ( href ) {
			const regexp = '^\\${link:.+';
			const match = href!.match( regexp );
			return !!match;
		}
		return false;
	}

	/**
	 * Returns `true` if the specified `element` can be linked (the element allows the `linkHref` attribute).
	 */
	public static isLinkableElement( element: Element | null, schema: Schema ): element is Element {
		if ( !element ) {
			return false;
		}

		return schema.checkAttribute( element.name, 'linkHref' );
	}

	/**
	 * Returns the {@link module:mgnllink/mgnllinkconfig~MgnlLinkConfig#decorators `config.mgnllink.decorators`} configuration processed
	 * to respect the locale of the editor, i.e. to display the {@link module:mgnllink/mgnllinkconfig~MgnlLinkDecoratorManualDefinition label}
	 * in the correct language.
	 *
	 * **Note**: Only the few most commonly used labels are translated automatically. Other labels should be manually
	 * translated in the {@link module:mgnllink/mgnllinkconfig~MgnlLinkConfig#decorators `config.mgnllink.decorators`} configuration.
	 *
	 * @param t Shorthand for {@link module:utils/locale~Locale#t Locale#t}.
	 * @param decorators The decorator reference where the label values should be localized.
	 */
	public static getLocalizedDecorators(
		t: LocaleTranslate,
		decorators: Array<MgnlNormalizedLinkDecoratorDefinition>
	): Array<MgnlNormalizedLinkDecoratorDefinition> {
		const localizedDecoratorsLabels: Record<string, string> = {
			'Open in a new tab': t( 'Open in a new tab' ),
			'Downloadable': t( 'Downloadable' )
		};

		decorators.forEach( decorator => {
			if ( 'label' in decorator && localizedDecoratorsLabels[ decorator.label ] ) {
				decorator.label = localizedDecoratorsLabels[ decorator.label ];
			}

			return decorator;
		} );

		return decorators;
	}

	/**
	 * Converts an object with defined decorators to a normalized array of decorators. The `id` key is added for each decorator and
	 * is used as the attribute's name in the model.
	 */
	public static normalizeDecorators( decorators?: Record<string, MgnlLinkDecoratorDefinition> ): Array<MgnlNormalizedLinkDecoratorDefinition> {
		const retArray: Array<MgnlNormalizedLinkDecoratorDefinition> = [];

		if ( decorators ) {
			for ( const [ key, value ] of Object.entries( decorators ) ) {
				const decorator = Object.assign(
					{},
					value,
					{ id: `link${ upperFirst( key ) }` }
				);

				retArray.push( decorator );
			}
		}

		return retArray;
	}
}

// export type MgnlNormalizedLinkDecoratorAutomaticDefinition = MgnlLinkDecoratorAutomaticDefinition & { id: string };
export type MgnlNormalizedLinkDecoratorManualDefinition = MgnlLinkDecoratorManualDefinition & { id: string };
export type MgnlNormalizedLinkDecoratorDefinition = MgnlNormalizedLinkDecoratorManualDefinition;

