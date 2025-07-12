import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Superscript } from '@ckeditor/ckeditor5-basic-styles';

import './../mgnl-css-framework-compatible.css';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

const BUILTIN_PLUGINS = [
	Essentials,
	Heading,
	Superscript,
    SourceEditing
];

const DEFAULT_CONFIG: EditorConfig = {
	toolbar: [
		'heading2',
		'heading3',
		'superscript',
		'|',
		'heading',
		'|',
		'sourceEditing',
	],
	heading: {
		options: [
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'headingLegal', view: { name: 'p', classes: 'legal-text' }, title: 'Legal', class: 'ck-heading_legal' },
			{ model: 'headingSmall', view: { name: 'p', classes: 'small-text' }, title: 'Small', class: 'ck-heading_small' }
		]
	}
};

export class RichTextWithHeadingEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}
