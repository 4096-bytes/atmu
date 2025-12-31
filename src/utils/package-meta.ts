import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export type PackageMeta = {
	readonly name: string;
	readonly version: string;
};

let cached: PackageMeta | undefined;

export function getPackageMeta(): PackageMeta {
	if (cached) {
		return cached;
	}

	const packageJsonPath = fileURLToPath(
		new URL('../../package.json', import.meta.url),
	);
	const raw = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
		name?: unknown;
		version?: unknown;
	};

	cached = {
		name:
			typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : 'atmu',
		version:
			typeof raw.version === 'string' && raw.version.length > 0
				? raw.version
				: '0.0.0',
	};

	return cached;
}
