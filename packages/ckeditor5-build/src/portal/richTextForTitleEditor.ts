import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { WordCount } from '@ckeditor/ckeditor5-word-count'

import './../mgnl-css-framework-compatible.css';

const BUILTIN_PLUGINS = [
    Essentials,
	Superscript,
    WordCount
];

const DEFAULT_CONFIG: EditorConfig = {
	toolbar: [
		'superscript',
	],
    wordCount: {
        onUpdate: stats => {
            // Prints the current content statistics.
            console.log( `Characters: ${ stats.characters }\nWords: ${ stats.words }` );
        }
    }
};

export class RichTextForTitleEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}
