import { Command } from 'ckeditor5/src/core.js';
import { findAttributeRange } from 'ckeditor5/src/typing.js';
import MgnlLink from './mgnllink';

import { MgnlLinkFormCommand } from './mgnllinkformcommand';
import util from './mgnllinkutil';
/**
 * The unlink command. It is used by the {@link module:mgnllink/mgnllink~MgnlLink link plugin}.
 */
export default class MgnlUnlinkCommand extends Command {
	static readonly COMMAND_NAME: string = 'mgnlunlink';
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedElement = selection.getSelectedElement();

		// A check for any integration that allows linking elements (e.g. `LinkImage`).
		// Currently the selection reads attributes from text nodes only. See #7429 and #7465.
		if ( util.isLinkableElement( selectedElement, model.schema ) ) {
			this.isEnabled = model.schema.checkAttribute( selectedElement, MgnlLink.MGNL_LINK_ATTRIBUTE );
		} else {
			this.isEnabled = model.schema.checkAttributeInSelection( selection, MgnlLink.MGNL_LINK_ATTRIBUTE );
		}
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is collapsed, it removes the `linkHref` and `mgnlLink` attributes from each node with the same `linkHref` and `mgnlLink` attribute value.
	 * When the selection is non-collapsed, it removes the `linkHref` and `mgnlLink` attributes from each node in selected ranges.
	 *
	 * # Decorators
	 *
	 * If {@link module:mgnllink/mgnllinkconfig~MgnlLinkConfig#decorators `config.mgnllink.decorators`} is specified,
	 * all configured decorators are removed together with the `linkHref` and `mgnlLink` attributes.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = this.editor.model;
		const selection = model.document.selection;
		const linkFormCommand: MgnlLinkFormCommand = editor.commands.get( MgnlLinkFormCommand.COMMAND_NAME )! as MgnlLinkFormCommand;

		model.change( writer => {
			// Get ranges to unlink.
			const rangesToUnlink = selection.isCollapsed ?
				[ findAttributeRange(
					selection.getFirstPosition()!,
					'linkHref',
					selection.getAttribute( 'linkHref' ),
					model
				) ] :
				model.schema.getValidRanges( selection.getRanges(), 'linkHref' );

			// Remove `linkHref` and `mgnlLink` attributes from specified ranges.
			for ( const range of rangesToUnlink ) {
				writer.removeAttribute( 'linkHref', range );
				writer.removeAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE, range );
				// If there are registered custom attributes, then remove them during unlink.
				if ( linkFormCommand ) {
					for ( const manualDecorator of linkFormCommand.manualDecorators ) {
						writer.removeAttribute( manualDecorator.id, range );
					}
				}
			}
		} );
	}
}
