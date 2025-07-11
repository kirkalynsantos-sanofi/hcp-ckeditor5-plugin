import { Command } from 'ckeditor5/src/core';
import MgnlLink from './mgnllink';

export class MgnlLinkButtonCommand extends Command {
	static readonly COMMAND_NAME: string = 'openMgnlDialog';
	public override refresh(): void {
		super.refresh();
		const { document, schema } = this.editor.model;

		// check if the selected text has the attribute 'mgnlLink'
		this.value = document.selection.getAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE );

		// check if command is allowed on current selection
		this.isEnabled = schema.checkAttributeInSelection( document.selection, MgnlLink.MGNL_LINK_ATTRIBUTE );
	}

	public override execute( data: string ): void {
		super.execute();
		this.editor.fire( 'mgnlPluginButtonClicked:' + MgnlLink.MGNL_GET_LINK_EVENT, data );
	}
}
