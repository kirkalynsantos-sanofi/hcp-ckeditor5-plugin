import { Command } from 'ckeditor5/src/core';
import MgnlLink from './mgnllink';
import util from './mgnllinkutil';
import { Collection, first, toMap } from 'ckeditor5/src/utils.js';
import ManualDecorator from '@ckeditor/ckeditor5-link/src/utils/manualdecorator';

import { findAttributeRange } from 'ckeditor5/src/typing.js';
import type { Range, Model, Writer } from 'ckeditor5/src/engine.js';

/**
 * The mgnl link command.
 */
export class MgnlLinkFormCommand extends Command {
	static readonly COMMAND_NAME: string = 'updateMgnlLinkProperty';

	/**
	 * The value of the `'linkHref'` attribute if the start of the selection is located in a node with this attribute.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: string | undefined;


	/**
	 * A collection of {@link module:link/utils/manualdecorator~ManualDecorator manual decorators}
	 * corresponding to the {@link module:link/linkconfig~LinkConfig#decorators decorator configuration}.
	 *
	 * You can consider it a model with states of manual decorators added to the currently selected link.
	 */
	public readonly manualDecorators = new Collection<ManualDecorator>();

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

		this.restoreManualDecoratorStates();
	}

	/**
	 * Synchronizes the state of {@link #manualDecorators} with the currently present elements in the model.
	 */
	public restoreManualDecoratorStates(): void {
		for ( const manualDecorator of this.manualDecorators ) {
			manualDecorator.value = this._getDecoratorStateFromModel( manualDecorator.id );
		}
	}

	/**
	 * Provides information whether a decorator with a given name is present in the currently processed selection.
	 *
	 * @param decoratorName The name of the manual decorator used in the model
	 * @returns The information whether a given decorator is currently present in the selection.
	 */
	private _getDecoratorStateFromModel( decoratorName: string ): boolean | undefined {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedElement = selection.getSelectedElement();

		// A check for the `LinkImage` plugin. If the selection contains an element, get values from the element.
		// Currently the selection reads attributes from text nodes only. See #7429 and #7465.
		if ( util.isLinkableElement( selectedElement, model.schema ) ) {
			return selectedElement.getAttribute( decoratorName ) as boolean | undefined;
		}

		return selection.getAttribute( decoratorName ) as boolean | undefined;
	}


	public override execute(manualDecoratorIds: Record<string, boolean> = {} ): void {
		super.execute();
		const model = this.editor.model;
		const selection = model.document.selection;

		// Stores information about manual decorators to turn them on/off when command is applied.
		const truthyManualDecorators: Array<string> = [];
		const falsyManualDecorators: Array<string> = [];

		for ( const name in manualDecoratorIds ) {
			if ( manualDecoratorIds[ name ] ) {
				truthyManualDecorators.push( name );
			} else {
				falsyManualDecorators.push( name );
			}
		}

		model.change( writer => {
			if ( !selection.isCollapsed ) {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where the `linkHref` attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), MgnlLink.MGNL_LINK_ATTRIBUTE );

				// But for the first, check whether the `linkHref` attribute is allowed on selected blocks (e.g. the "image" element).
				const allowedRanges = [];

				for (const element of selection.getSelectedBlocks() ) {
					if (model.schema.checkAttribute( element, MgnlLink.MGNL_LINK_ATTRIBUTE ) ) {
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

					truthyManualDecorators.forEach( item => {
						writer.setAttribute( item, true, linkRange );
					} );

					falsyManualDecorators.forEach( item => {
						writer.removeAttribute( item, linkRange );
					} );
				}
			} else {
				const position = selection.getFirstPosition()!;

				if (selection.hasAttribute(MgnlLink.MGNL_LINK_ATTRIBUTE)) {
					let range = findAttributeRange( position, MgnlLink.MGNL_LINK_ATTRIBUTE, selection.getAttribute( MgnlLink.MGNL_LINK_ATTRIBUTE ), model );

					truthyManualDecorators.forEach( item => {
						writer.setAttribute( item, true, range );
					} );

					falsyManualDecorators.forEach( item => {
						writer.removeAttribute( item, range );
					} );

					// Put the selection at the end of the updated link.
					writer.setSelection( writer.createPositionAfter( range.end.nodeBefore! ) );
				} else {
					const attributes = toMap( selection.getAttributes() );
					// attributes.set('linkHref', href );

					truthyManualDecorators.forEach( item => {
						attributes.set( item, true );
					} );
				}

				// Remove the `linkHref` attribute and all link decorators from the selection.
				// It stops adding a new content into the link element.
				[ 'linkHref', ...truthyManualDecorators, ...falsyManualDecorators ].forEach( item => {
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
