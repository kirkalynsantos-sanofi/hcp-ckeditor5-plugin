# Custom CKEditor 5 editor built for integration with Magnolia

### Installation

In order to rebuild the application you need to install all dependencies first. To do it, open the terminal in the project directory and type:

```
npm install
```

Make sure that you have the `node` and `npm` installed first. If not, then follow the instructions on the [Node.js documentation page](https://nodejs.org/en/).

### Adding or removing plugins

You can add new plugin by two common ways that have the same result:
1. Use `npm install` command, e.g:

	`npm install @ckeditor/ckeditor5-highlight@41.2.1 --save`
2. Or manually add the plugin to the dependencies section of the `packages/ckeditor5-build/package.json`
    ```
   "dependencies": {
      //other dependencies ...
      "@ckeditor/ckeditor5-highlight": "^41.2.1"
   }
    ```
To remove the plugin, simply remove it out of the dependencies section and run `npm install` command

### Importing plugins to the CKEDITOR build
You can import any installed plugins to CKEDITOR build by following steps:
1. Locate the `ckeditor5.ts` under `packages/ckeditor5-build/src`
2. Add import statement to the `ckeditor5.ts`, e.g:
   ```
	  import { Highlight } from '@ckeditor/ckeditor5-highlight';
   ```

### Rebuilding editor

If you have already done the [Installation](#installation) and [Adding or removing plugins](#adding-or-removing-plugins) steps, you're ready to rebuild the editor by running the following command:

```
npm run build
```

This will build the CKEditor 5 to the `build` directory. You can open your browser and you should be able to see the changes you've made in the code. If not, then try to refresh also the browser cache by typing `Ctrl + R` or `Cmd + R` depending on your system.

### Local development

To develop CKEditor5 build and plugins and make them available to use in your Magnolia instance

1. Install and build the package:
   1. `npm install && npm run build`
   2. `npm run start`, now the package is accessible via http://127.0.0.1:9090/ckeditor5.js or http://localhost:9090/ckeditor5.js
2. Inject the build to Magnolia Rich Text Field powered by CkEditor 5
   1. Configure the microprofile property `magnolia.ckeditor5.build` with the url to the running package, e.g: `magnolia.ckeditor5.build=http://localhost:9090/ckeditor5.js`. Note that, any change to your build will be watched and be in time updated.
   2. Run your instance

   The application will be rebuilt on-the-fly after any change.  Please note that `build/ckeditor.js` is only rebuilt when running `npm run build`.

### Customize build
To customize CKEditor5 build and plugins and make it available to use in your Magnolia instance

1. Install and build the package
   1. `npm install && npm run build`
2. Inject the build to Magnolia Rich Text Field powered by CkEditor 5
   1. Find the `ckeditor5.js` file under `packages/ckeditor5-build/build`
   2. Place the `ckeditor5.js` file in your `light-module/websresources`. E.g `light-modules/module-lm/webresources/`
   3. Config the `magnolia.ckeditor5.build` property with the path to the ckeditor5.js. E.g: `-Dmagnolia.ckeditor5.build=light-module/module-lm/webresources/ckeditor5.js`
3. Run your instance

### Debugging
To debug the CKEditor 5 instance on your browser, you need to attach that instance to the ckeditor-inspector.

Prerequisite: ```https://unpkg.com/@ckeditor/ckeditor5-inspector/build/inspector.js``` is attached to the field.

1. In the browser, create a bookmark on the Bookmark bar
2. In the ```Name``` field, fill anything you want, e.g. ```CKEditor Inspector```
3. In the ```Url``` field, copy and paste the code below
```javascript
javascript:(function(){
    let script=document.createElement('script');
    script.src='https://unpkg.com/@ckeditor/ckeditor5-inspector/build/inspector.js';
    script.onload=()=> {
        CKEditorInspector.attachToAll();

        setTimeout(() => {
            const inspectorContainer = document.querySelector('.ck-inspector');
            if (inspectorContainer) {
                inspectorContainer.style.zIndex = '10000';
            }
        }, 1000);
    };
    document.head.appendChild(script);
})()
```
4. Then click ```Save```
5. Open the form, which contains ckeditor5 fields, then click to the saved bookmark, let's says ```CKEditor Inspector```, et voila, you will notice there is a small toolbar at the bottom of the page.


