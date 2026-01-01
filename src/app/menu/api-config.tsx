import {ApiConfigScreen} from '../../ui/screens/api-config.js';
import {readCodexApiConfigSummary} from '../../utils/codex-config.js';
import {formatMenuLabel} from '../../utils/menu.js';
import type {MenuExtension} from './types.js';

export const apiConfigMenuExtension: MenuExtension = {
	id: 'configure-api-advanced',
	label: formatMenuLabel(
		'configure API provider',
		'use a custom provider for Codex CLI',
	),
	async getStatusText({homeDirectory}) {
		const summary = await readCodexApiConfigSummary({homeDirectory});
		if (!summary) {
			return undefined;
		}

		return `Provider: ${summary.provider}\nBase URL: ${summary.baseUrl}`;
	},
	render({homeDirectory, onDone}) {
		return <ApiConfigScreen homeDirectory={homeDirectory} onDone={onDone} />;
	},
};
