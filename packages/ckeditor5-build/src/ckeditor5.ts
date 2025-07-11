import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import {
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar
} from '@ckeditor/ckeditor5-image';
import { Font } from '@ckeditor/ckeditor5-font';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Table, TableToolbar, TableColumnResize, TableUtils, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { MgnlImageInsert, MgnlLink } from '@magnolia/ckeditor5-plugins';

import './mgnl-css-framework-compatible.css'

const BUILTIN_PLUGINS = [
	Essentials,
	Heading,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	List,
	SpecialCharacters,
	SpecialCharactersEssentials,
	AutoLink, Link,
	Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage, ImageInsert, ImageTextAlternative,
	MgnlLink, MgnlImageInsert,
	Font,
	Alignment,
	SourceEditing,
	Table,
	TableToolbar,
	TableColumnResize,
	TableUtils,
	TableProperties,
	TableCellProperties,
	PasteFromOffice,
	GeneralHtmlSupport
];

const DEFAULT_CONFIG : EditorConfig = {
	toolbar: [
		'bold',
		'italic',
		'underline',
		'strikethrough',
		'subscript',
		'superscript',
		'specialCharacters',
		'|',
		'numberedList', 'bulletedList',
		'alignment',
		'insertTable',
		'|',
		'link',
		'mgnlAssetsLink',
		'mgnlPagesLink',
		'insertImage',
		'|',
		'fontFamily',
		'fontSize',
		'|',
		'sourceEditing',
		'|',
		'undo', 'redo'
	],
	fontFamily: {
		options: [
			'default',
			'Ubuntu, Arial, sans-serif',
			'Ubuntu Mono, Courier New, Courier, monospace'
		]
	},
	fontSize: {
		options: [
			9,
			11,
			13,
			'default',
			17,
			19,
			21
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
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative',
			'|',
			'resizeImage'
		],
		insert: {
			type: 'auto',
			integrations: [ 'mgnlurl' ]
		}
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
};

// Export the editor for CKEditor 5 to use in your project.
// The exported editors could be retrieved by CKEDITOR5["ClassicEditor"] or CKEDITOR5["InlineEditor"] respectively.
export default { ClassicEditor };
