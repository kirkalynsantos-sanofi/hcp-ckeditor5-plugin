import type { MgnlLink, MgnlImageInsert } from './index';
import type { MgnlLinkConfig } from './index'

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ MgnlLink.pluginName ]: MgnlLink;
		[ MgnlImageInsert.pluginName]: MgnlImageInsert;
	}

	interface EditorConfig {
		/**
		 * The configuration of the {@link module:mgnllink/mgnllink~MgnlLink} feature.
		 *
		 * Read more in {@link module:mgnllink/mgnllinkconfig~MgnlLinkConfig}.
		 */
		mgnllink?: MgnlLinkConfig;
	}
}
