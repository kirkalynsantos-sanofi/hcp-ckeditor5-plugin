/**
 * @license Copyright (c) 2014-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const TerserWebpackPlugin = require( 'terser-webpack-plugin' );

module.exports = {
	devtool: 'source-map',
	performance: { hints: false },

	//For development purpose
	devServer: {
		port: 9090
	},

	entry: path.resolve( __dirname, 'src', 'ckeditor5.ts' ),

	output: {
		// The name under which the editor will be exported.
		library: 'CKEDITOR5',

		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor5.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},

	optimization: {
		minimizer: [
			new TerserWebpackPlugin( {
				sourceMap: true,
				terserOptions: {
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			} )
		]
	},

	resolve: {
		extensions: [ '.ts', '.js', '.json' ]
	},

	module: {
		rules: [ {
			test: /\.svg$/,
			use: [ 'raw-loader' ]
		}, {
			test: /\.ts$/,
			use: 'ts-loader'
		}, {
			test: /\.css$/,
			use: [ {
				loader: 'style-loader',
				options: {
					injectType: 'singletonStyleTag',
					attributes: {
						'data-cke': true
					}
				}
			}, {
				loader: 'css-loader'
			}, {
				loader: 'postcss-loader',
				options: {
					postcssOptions: styles.getPostCssConfig( {
						themeImporter: {
							themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
						},
						minify: true
					} )
				}
			} ]
		} ]
	}
};
