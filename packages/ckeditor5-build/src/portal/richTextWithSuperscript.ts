import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { Table, TableToolbar, TableColumnResize, TableUtils, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { WordCount } from '@ckeditor/ckeditor5-word-count'

import './../mgnl-css-framework-compatible.css';

const BUILTIN_PLUGINS = [
	Essentials,
	Heading,
	Superscript,
	Table,
	TableToolbar,
	TableColumnResize,
	TableUtils,
	TableProperties,
	TableCellProperties,
    WordCount
];

const DEFAULT_CONFIG: EditorConfig = {
	toolbar: [
		'superscript',
		'|',
		'heading',
		'|',
		'insertTable'
	],
	heading: {
		options: [
			{ model: 'headingLegal', view: { name: 'p', classes: 'legal-text' }, title: 'Legal', class: 'ck-heading_legal' },
			{ model: 'headingSmall', view: { name: 'p', classes: 'small-text' }, title: 'Small', class: 'ck-heading_small' }
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		]
	},
    wordCount: {
        onUpdate: stats => {
            // Prints the current content statistics.
            console.log( `Characters: ${ stats.characters }\nWords: ${ stats.words }` );
        }
    }
};

export class RichTextWithSuperscriptEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}
