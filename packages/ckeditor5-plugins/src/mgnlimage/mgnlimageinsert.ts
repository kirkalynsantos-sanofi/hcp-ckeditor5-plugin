import { Plugin } from 'ckeditor5/src/core.js';
import MgnlImageInsertViaUrlUI from './mgnlimageinsertviaurl';

export default class MgnlImageInsert extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MgnlImageInsert' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MgnlImageInsertViaUrlUI ] as const;
	}
}
