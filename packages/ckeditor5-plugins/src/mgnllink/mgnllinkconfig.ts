import type { ArrayOrItem } from 'ckeditor5/src/utils.js';
/**
 * The configuration of the {@link module:mgnllink/mgnllink~MgnlLink link feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		mgnllink:  ... // Link feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface MgnlLinkConfig {

	decorators?: Record<string, MgnlLinkDecoratorDefinition>;

}

export type MgnlLinkDecoratorDefinition = MgnlLinkDecoratorManualDefinition;

/**
 * Describes a manual {@link module:link/linkconfig~LinkConfig#decorators link decorator}. This decorator type is represented in
 * the link feature's {@link module:link/linkui user interface} as a switch that the user can use to control the presence
 * of a predefined set of attributes.
 *
 * For instance, to allow the users to manually control the presence of the `target="_blank"` and
 * `rel="noopener noreferrer"` attributes on specific links, the decorator could look as follows:
 *
 * ```ts
 * {
 * 	mode: 'manual',
 * 	label: 'Open in a new tab',
 * 	defaultValue: true,
 * 	attributes: {
 * 		target: '_blank',
 * 		rel: 'noopener noreferrer'
 * 	}
 * }
 * ```
 */
export interface MgnlLinkDecoratorManualDefinition {
	/**
	 * Link decorator type. It is `'manual'` for all manual decorators.
	 */
	mode: 'manual';
	/**
	 * The label of the UI button that the user can use to control the presence of link attributes.
	 */
	label: string;
	/**
	 * Key-value pairs used as link attributes added to the output during the
	 * {@glink framework/architecture/editing-engine#conversion downcasting}.
	 * Attributes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
	 */
	attributes?: Record<string, string>;
	/**
	 * Key-value pairs used as link styles added to the output during the
	 * {@glink framework/architecture/editing-engine#conversion downcasting}.
	 * Styles should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
	 */
	styles?: Record<string, string>;
	/**
	 * Class names used as link classes added to the output during the
	 * {@glink framework/architecture/editing-engine#conversion downcasting}.
	 * Classes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
	 */
	classes?: ArrayOrItem<string>;
	/**
	 * Controls whether the decorator is "on" by default.
	 */
	defaultValue?: boolean;
}
