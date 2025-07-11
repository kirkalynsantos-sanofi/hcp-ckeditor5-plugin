declare global {
	interface Window {
		editor: ClassicEditor;
	}
}

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Bold, Code, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';

import MgnlLink from '../src/mgnllink/mgnllink';

ClassicEditor
	.create( document.getElementById( 'editor' )!, {
		plugins: [
			MgnlLink,
			Essentials,
			Bold,
			Heading,
			Italic,
			Link,
			List,
			Code
		],
		toolbar: [
			'mgnlAssetsLink',
			'mgnlPagesLink',
			'|',
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'code',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'codeBlock',
			'|',
			'undo',
			'redo'
		],
	} )
	.then( editor => {
		window.editor = editor;
		CKEditorInspector.attach( editor );
		window.console.log( 'CKEditor 5 is ready.', editor );
	} )
	.catch( err => {
		window.console.error( err.stack );
	} );
