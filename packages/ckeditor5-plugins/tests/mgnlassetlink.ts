import { expect } from 'chai';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import MgnlLink from '../src/mgnllink/mgnllink';

describe( 'MgnlAssetLink', () => {
	it( 'should be named', () => {
		expect( MgnlLink.pluginName ).to.equal( 'MgnlAssetLink' );
	} );

	describe( 'init()', () => {
		let domElement: HTMLElement, editor: ClassicEditor;

		beforeEach( async () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					MgnlLink
				],
				toolbar: [
					'mgnlAssetsLinkButton'
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load MgnlLink', () => {
			const myPlugin = editor.plugins.get( 'MgnlLink' );

			expect( myPlugin ).to.be.an.instanceof( MgnlLink );
		} );

		it( 'should add an icon to the toolbar', () => {
			expect( editor.ui.componentFactory.has( 'mgnlAssetsLinkButton' ) ).to.equal( true );
		} );

		it( 'should add a text into the editor after clicking the icon', () => {
			const icon = editor.ui.componentFactory.create( 'mgnlAssetsLinkButton' );

			expect( editor.getData() ).to.equal( '' );

			icon.fire( 'execute' );

			expect( editor.getData() ).to.equal( '<p>Hello CKEditor 5!</p>' );
		} );
	} );
} );
