import type {MenuExtension} from './types.js';
import {apiConfigMenuExtension} from './api-config.js';

export const menuExtensions: readonly MenuExtension[] = [
	apiConfigMenuExtension,
];
