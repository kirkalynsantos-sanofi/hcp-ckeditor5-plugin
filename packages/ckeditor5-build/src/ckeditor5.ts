import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { AutoLink, Link } from '@ckeditor/ckeditor5-link';
import { Table, TableToolbar, TableColumnResize, TableUtils, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { MgnlImageInsert, MgnlLink } from '@magnolia/ckeditor5-plugins';

import './mgnl-css-framework-compatible.css';

const BUILTIN_PLUGINS = [
	Essentials,
	Heading,
	Bold,
	Italic,
	Underline,
	Superscript,
	List,
	AutoLink, Link,
	MgnlLink, MgnlImageInsert,
	Table,
	TableToolbar,
	TableColumnResize,
	TableUtils,
	TableProperties,
	TableCellProperties,
	PasteFromOffice
];

const DEFAULT_CONFIG: EditorConfig = {
	toolbar: [
		'bold',
		'italic',
		'superscript',
		'underline',
		'|',
		'heading',
		'|',
		'numberedList',
		'bulletedList',
		'insertTable',
		'|',
		'link',
		'mgnlAssetsLink',
		'mgnlPagesLink',
		'|',
		'clipboard',
		'|',
		'undo',
		'redo'
	],
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		]
	},
	mgnllink: {
		decorators: {
			openInNewTab: {
				mode: 'manual',
				label: 'Open link in new tab',
				attributes: {
					rel: 'noopener noreferrer',
					target: '_blank'
				}
			}
		}
	}
};

class ClassicEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}

export default { ClassicEditor };
