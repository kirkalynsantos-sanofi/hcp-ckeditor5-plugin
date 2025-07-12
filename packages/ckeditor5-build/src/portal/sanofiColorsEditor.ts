import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { Table, TableToolbar, TableColumnResize, TableUtils, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { MgnlImageInsert, MgnlLink } from '@magnolia/ckeditor5-plugins';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { FontColor } from '@ckeditor/ckeditor5-font';
import {
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar
} from '@ckeditor/ckeditor5-image';
import { WordCount } from '@ckeditor/ckeditor5-word-count'

import './../mgnl-css-framework-compatible.css';

const BUILTIN_PLUGINS = [
	Essentials,
	Heading,
	Bold,
	Italic,
	Underline,
	Superscript,
	List,
	AutoLink, Link,
    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage, ImageInsert, ImageTextAlternative,
	MgnlLink, MgnlImageInsert,
	Table,
	TableToolbar,
	TableColumnResize,
	TableUtils,
	TableProperties,
	TableCellProperties,
	Clipboard,
	PasteFromOffice,
    Image,
    FontColor,
    WordCount
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
        'insertImage',
		'insertTable',
		'|',
		'link',
		'mgnlAssetsLink',
		'mgnlPagesLink',
		'|',
        'fontColor',
        '|',
		'clipboard',
		'pastetools',
		'pastetext',
		'pastefromword',
		'|',
		'undo',
		'redo',
		'|',
		'fullscreen'
	],
	heading: {
		options: [
			{ model: 'paragraph', title: 'Normal', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
			{ model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
			{ model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
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
	},
    wordCount: {
        onUpdate: stats => {
            // Prints the current content statistics.
            console.log( `Characters: ${ stats.characters }\nWords: ${ stats.words }` );
        }
    }
};

export class SanofiColorsEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}
