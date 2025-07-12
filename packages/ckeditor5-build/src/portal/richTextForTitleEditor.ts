import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import './../mgnl-css-framework-compatible.css';

const BUILTIN_PLUGINS = [
    Essentials,
	Superscript,
];

const DEFAULT_CONFIG: EditorConfig = {
	toolbar: [
		'superscript',
	]
};

export class RichTextForTitleEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}
