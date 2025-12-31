import type {MenuItem} from '../types/menu.js';

function formatMenuLabel(action: string, description: string): string {
	return `${action} - ${description}`;
}

export function getMainMenuItems(): MenuItem[] {
	return [{id: 'exit', label: formatMenuLabel('exit', 'quit atmu')}];
}
