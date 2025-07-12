import { ClassicEditor as CkEditor5ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EditorConfig } from 'ckeditor5/src/core';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { AutoLink, Link } from '@ckeditor/ckeditor5-link';

import './../mgnl-css-framework-compatible.css';
import { MgnlImageInsert, MgnlLink } from '@magnolia/ckeditor5-plugins';

const BUILTIN_PLUGINS = [
	Essentials,
	Bold,
	List,
	AutoLink, Link,
    MgnlLink, MgnlImageInsert,
];

const DEFAULT_CONFIG: EditorConfig = {
	toolbar: [
		'bold',
		'|',
		'numberedList',
		'bulletedList',
		'|',
		'link',
		'mgnlAssetsLink',
		'mgnlPagesLink',
		'|',
		'undo',
		'redo'
	],
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

export class SanofiLegalEditor extends CkEditor5ClassicEditor {
	public static override builtinPlugins = BUILTIN_PLUGINS;
	public static override defaultConfig = DEFAULT_CONFIG;
}
