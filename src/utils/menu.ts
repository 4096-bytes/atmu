import type {MenuItem} from '../types/menu.js';

export function formatMenuLabel(action: string, description: string): string {
	return `${action} - ${description}`;
}

export function createExitMenuItem(): MenuItem {
	return {id: 'exit', label: formatMenuLabel('exit', 'quit atmu')};
}
