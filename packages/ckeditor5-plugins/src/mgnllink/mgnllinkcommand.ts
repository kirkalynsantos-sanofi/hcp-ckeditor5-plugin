import { Command } from 'ckeditor5/src/core';
import MgnlLink from './mgnllink';
import util from './mgnllinkutil';
import { first, toMap } from 'ckeditor5/src/utils.js';

import { findAttributeRange } from 'ckeditor5/src/typing.js';
import type { Range, DocumentSelection, Model, Writer } from 'ckeditor5/src/engine.js';

/**
 * The mgnl link command.
 */
export default class MgnlLinkCommand extends Command {
	static COMMAND_NAME: string = 'createMgnlLink';

	/**
	 * The value of the `'linkHref'` attribute if the start of the selection is located in a node with this attribute.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: string | undefined;


	public override refresh(): void {
		super.refresh();
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedElement = selection.getSelectedElement() || first( selection.getSelectedBlocks() );

		if ( util.isLinkableElement( selectedElement, model.schema ) ) {
			this.value = selectedElement.getAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE ) as string | undefined;
			this.isEnabled = model.schema.checkAttribute( selectedElement, MgnlLink.MGNL_LINK_ATTRIBUTE );
		} else {
			this.value = selection.getAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE ) as string | undefined;
			this.isEnabled = model.schema.checkAttributeInSelection( selection, MgnlLink.MGNL_LINK_ATTRIBUTE );
		}
	}

	public override execute( data: string): void {
		super.execute();
		const model = this.editor.model;
		const selection = model.document.selection;
		const link = JSON.parse( data );
		const href = '${link:{uuid:{' + link.identifier +
			'},repository:{' + link.repository +
			'},path:{' + link.path +
			'}}}';

		model.change( writer => {
			if ( !selection.isCollapsed ) {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where the `linkHref` attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), MgnlLink.MGNL_LINK_ATTRIBUTE );

				// But for the first, check whether the `linkHref` attribute is allowed on selected blocks (e.g. the "image" element).
				const allowedRanges = [];

				for (const element of selection.getSelectedBlocks() ) {
					if (model.schema.checkAttribute( element, 'linkHref' ) ) {
						allowedRanges.push( writer.createRangeOn( element ) );
					}
				}

				// Ranges that accept the `linkHref` attribute. Since we will iterate over `allowedRanges`, let's clone it.
				const rangesToUpdate = allowedRanges.slice();

				// For all selection ranges we want to check whether given range is inside an element that accepts the `linkHref` attribute.
				// If so, we don't want to propagate applying the attribute to its children.
				for (const range of ranges ) {
					if ( this._isRangeToUpdate( range, allowedRanges ) ) {
						rangesToUpdate.push( range );
					}
				}

				for ( const range of rangesToUpdate ) {
					let linkRange = range;
					if ( rangesToUpdate.length === 1) {
						// Current text of the link in the document.
						const linkText = extractTextFromSelection( selection );

						if (selection.getAttribute('linkHref' ) === linkText ) {
							linkRange = this._updateLinkContent( model, writer, range, href );
							writer.setSelection( writer.createSelection(linkRange));
						}
					}
					writer.setAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE, href, linkRange );
					writer.setAttribute( 'linkHref', href, linkRange );

				}
			} else {
				const position = selection.getFirstPosition()!;

				if (selection.hasAttribute('linkHref')) {
					const linkText = extractTextFromSelection( selection );
					// Then update `linkHref` value.
					let range = findAttributeRange( position, 'linkHref', selection.getAttribute( 'linkHref' ), model );

					if ( selection.getAttribute( 'linkHref' ) === linkText ) {
						range = this._updateLinkContent( model, writer, range, href );
					}

					writer.setAttribute( 'linkHref', href, range );
					writer.setAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE, href, range );

					// Put the selection at the end of the updated link.
					writer.setSelection( writer.createPositionAfter( range.end.nodeBefore! ) );
				} else if ( href !== '') {
					const attributes = toMap( selection.getAttributes() );
					attributes.set('linkHref', href );

					const caption = writer.createText( link.caption, {
						mgnlLink: href,
						linkHref: href
					} );
					const {end: positionAfter } = model.insertContent( caption, selection.getFirstPosition() );

					// Put the selection at the end of the inserted link.
					// Using end of range returned from insertContent in case nodes with the same attributes got merged.
					writer.setSelection( positionAfter );
				}

				// Remove the `linkHref` attribute and all link decorators from the selection.
				// It stops adding a new content into the link element.
				[ 'linkHref'].forEach( item => {
					writer.removeSelectionAttribute( item );
				} );
			}
		} );
	}

	/**
	 * Updates selected link with a new value as its content and as its href attribute.
	 *
	 * @param model Model is need to insert content.
	 * @param writer Writer is need to create text element in model.
	 * @param range A range where should be inserted content.
	 * @param href A link value which should be in the href attribute and in the content.
	 */
	private _updateLinkContent( model: Model, writer: Writer, range: Range, href: string ): Range {
		const text = writer.createText( href, { linkHref: href } );

		return model.insertContent( text, range );
	}

	/**
	 * Checks whether specified `range` is inside an element that accepts the `linkHref` attribute.
	 *
	 * @param range A range to check.
	 * @param allowedRanges An array of ranges created on elements where the attribute is accepted.
	 */
	private _isRangeToUpdate( range: Range, allowedRanges: Array<Range> ): boolean {
		for ( const allowedRange of allowedRanges ) {
			// A range is inside an element that will have the `linkHref` attribute. Do not modify its nodes.
			if ( allowedRange.containsRange( range ) ) {
				return false;
			}
		}

		return true;
	}
}

// Returns a text of a link under the collapsed selection or a selection that contains the entire link.
function extractTextFromSelection( selection: DocumentSelection ): string | null {
	if ( selection.isCollapsed ) {
		const firstPosition = selection.getFirstPosition();

		return firstPosition!.textNode && firstPosition!.textNode.data;
	} else {
		const rangeItems = Array.from( selection.getFirstRange()!.getItems() );

		if ( rangeItems.length > 1 ) {
			return null;
		}

		const firstNode = rangeItems[ 0 ];

		if ( firstNode.is( '$text' ) || firstNode.is( '$textProxy' ) ) {
			return firstNode.data;
		}

		return null;
	}
}
