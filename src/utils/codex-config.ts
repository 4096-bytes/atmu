import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export type CodexApiConfigSummary = {
	readonly provider: string;
	readonly baseUrl: string;
};

export type CodexApiConfigInput = {
	readonly provider: string;
	readonly baseUrl: string;
	readonly apiKey: string;
};

type Paths = {
	readonly codexDirectory: string;
	readonly configTomlPath: string;
	readonly authJsonPath: string;
};

function getPaths(homeDirectory: string): Paths {
	const codexDirectory = path.join(homeDirectory, '.codex');
	return {
		codexDirectory,
		configTomlPath: path.join(codexDirectory, 'config.toml'),
		authJsonPath: path.join(codexDirectory, 'auth.json'),
	};
}

async function readFileIfExists(filePath: string): Promise<string | undefined> {
	try {
		return await fs.readFile(filePath, 'utf8');
	} catch (error) {
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 'ENOENT'
		) {
			return undefined;
		}

		throw error;
	}
}

function tomlString(value: string): string {
	return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function stripInlineComment(line: string): string {
	const index = line.indexOf('#');
	if (index === -1) {
		return line;
	}

	return line.slice(0, index);
}

function isTomlTableHeaderLine(line: string): boolean {
	const code = stripInlineComment(line).trim();
	if (code === '') {
		return false;
	}

	// Covers `[table]` and `[[table]]`.
	return /^\[\[?.+]]?$/.test(code);
}

function findFirstTableHeaderIndex(lines: readonly string[]): number {
	return lines.findIndex(line => isTomlTableHeaderLine(line));
}

function upsertTopLevelKey(
	lines: string[],
	key: string,
	value: string,
	firstTableHeaderIndex: number,
): void {
	const headerEnd =
		firstTableHeaderIndex === -1 ? lines.length : firstTableHeaderIndex;

	let firstIndex = -1;

	for (let index = 0; index < headerEnd; index++) {
		const line = lines[index];
		if (line === undefined) {
			continue;
		}

		const code = stripInlineComment(line).trimStart();
		if (!code.startsWith(`${key}=`) && !code.startsWith(`${key} =`)) {
			continue;
		}

		if (firstIndex === -1) {
			firstIndex = index;
			const commentMatch = /\s+#.*$/.exec(line);
			const comment = commentMatch?.[0] ?? '';
			lines[index] = `${key} = ${value}${comment}`;
		} else {
			lines.splice(index, 1);
			index--;
		}
	}

	if (firstIndex === -1) {
		const insertAt = headerEnd;
		lines.splice(insertAt, 0, `${key} = ${value}`);
	}
}

function upsertProviderSection(
	lines: string[],
	provider: string,
	baseUrl: string,
): void {
	const sectionHeader = `[model_providers.${provider}]`;
	const sectionLines = [
		sectionHeader,
		`name = ${tomlString(provider)}`,
		`base_url = ${tomlString(baseUrl)}`,
		'wire_api = "responses"',
		`temp_env_key = ${tomlString(`${provider.toUpperCase()}_API_KEY`)}`,
		'requires_openai_auth = true',
	];

	const headerIndex = lines.findIndex(
		line => stripInlineComment(line).trim() === sectionHeader,
	);

	if (headerIndex === -1) {
		if (lines.length > 0 && lines.at(-1)?.trim() !== '') {
			lines.push('');
		}

		lines.push(...sectionLines, '');
		return;
	}

	let endIndex = headerIndex + 1;
	for (; endIndex < lines.length; endIndex++) {
		const line = lines[endIndex];
		if (line !== undefined && isTomlTableHeaderLine(line)) {
			break;
		}
	}

	lines.splice(headerIndex, endIndex - headerIndex, ...sectionLines, '');
}

function normalizeConfigToml(
	existing: string | undefined,
	provider: string,
	baseUrl: string,
): string {
	const lines = (existing ?? '').replaceAll('\r\n', '\n').split('\n');

	const firstTableHeaderIndex = findFirstTableHeaderIndex(lines);
	upsertTopLevelKey(
		lines,
		'disable_response_storage',
		'true',
		firstTableHeaderIndex,
	);
	upsertTopLevelKey(
		lines,
		'model_provider',
		tomlString(provider),
		firstTableHeaderIndex,
	);

	const refreshedFirstTableHeaderIndex = findFirstTableHeaderIndex(lines);
	if (refreshedFirstTableHeaderIndex !== -1) {
		const previousLine = lines[refreshedFirstTableHeaderIndex - 1];
		if (previousLine !== undefined && previousLine.trim() !== '') {
			lines.splice(refreshedFirstTableHeaderIndex, 0, '');
		}
	} else if (lines.length > 0 && lines.at(-1)?.trim() !== '') {
		lines.push('');
	}

	upsertProviderSection(lines, provider, baseUrl);

	return `${lines
		.join('\n')
		.replaceAll(/\n{3,}/g, '\n\n')
		.trimEnd()}\n`;
}

function readTomlStringValue(line: string): string | undefined {
	const code = stripInlineComment(line).trim();
	const index = code.indexOf('=');
	if (index === -1) {
		return undefined;
	}

	const rawValue = code.slice(index + 1).trim();
	if (
		rawValue.startsWith('"') &&
		rawValue.endsWith('"') &&
		rawValue.length >= 2
	) {
		return rawValue
			.slice(1, -1)
			.replaceAll('\\"', '"')
			.replaceAll('\\\\', '\\');
	}

	if (rawValue === '') {
		return undefined;
	}

	return rawValue;
}

export async function readCodexApiConfigSummary({
	homeDirectory = os.homedir(),
}: {readonly homeDirectory?: string} = {}): Promise<
	CodexApiConfigSummary | undefined
> {
	const {configTomlPath} = getPaths(homeDirectory);
	const configToml = await readFileIfExists(configTomlPath);
	if (!configToml) {
		return undefined;
	}

	const lines = configToml.replaceAll('\r\n', '\n').split('\n');

	let provider: string | undefined;
	const firstTableHeaderIndex = findFirstTableHeaderIndex(lines);
	const headerEnd =
		firstTableHeaderIndex === -1 ? lines.length : firstTableHeaderIndex;

	for (let index = 0; index < headerEnd; index++) {
		const line = lines[index];
		if (line === undefined) {
			continue;
		}

		const code = stripInlineComment(line).trimStart();
		if (!code.startsWith('model_provider')) {
			continue;
		}

		provider = readTomlStringValue(line);
		break;
	}

	if (!provider) {
		return undefined;
	}

	const sectionHeader = `[model_providers.${provider}]`;
	const headerIndex = lines.findIndex(
		line => stripInlineComment(line).trim() === sectionHeader,
	);

	if (headerIndex === -1) {
		return undefined;
	}

	let baseUrl: string | undefined;
	for (let index = headerIndex + 1; index < lines.length; index++) {
		const line = lines[index];
		if (line === undefined) {
			continue;
		}

		if (isTomlTableHeaderLine(line)) {
			break;
		}

		const code = stripInlineComment(line).trimStart();
		if (!code.startsWith('base_url')) {
			continue;
		}

		baseUrl = readTomlStringValue(line);
		break;
	}

	if (!baseUrl) {
		return undefined;
	}

	return {provider, baseUrl};
}

export async function writeCodexApiConfigFiles(
	{provider, baseUrl, apiKey}: CodexApiConfigInput,
	{homeDirectory = os.homedir()}: {readonly homeDirectory?: string} = {},
): Promise<void> {
	const paths = getPaths(homeDirectory);
	await fs.mkdir(paths.codexDirectory, {recursive: true});

	const existingConfigToml = await readFileIfExists(paths.configTomlPath);
	const nextConfigToml = normalizeConfigToml(
		existingConfigToml,
		provider,
		baseUrl,
	);
	await fs.writeFile(paths.configTomlPath, nextConfigToml, 'utf8');

	const temporaryEnvKey = `${provider.toUpperCase()}_API_KEY`;
	const existingAuthJson = await readFileIfExists(paths.authJsonPath);
	let authObject: Record<string, unknown> = {};

	if (existingAuthJson) {
		try {
			const parsed = JSON.parse(existingAuthJson) as unknown;
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				authObject = parsed as Record<string, unknown>;
			} else {
				throw new TypeError('auth.json is not an object');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to parse auth.json: ${message}`);
		}
	}

	authObject[temporaryEnvKey] = apiKey;
	const nextAuthJson = `${JSON.stringify(authObject, null, 2)}\n`;
	await fs.writeFile(paths.authJsonPath, nextAuthJson, 'utf8');
}

export async function ensureCodexConfigTomlExists({
	homeDirectory = os.homedir(),
}: {readonly homeDirectory?: string} = {}): Promise<void> {
	const paths = getPaths(homeDirectory);
	await fs.mkdir(paths.codexDirectory, {recursive: true});

	const existingConfigToml = await readFileIfExists(paths.configTomlPath);
	if (existingConfigToml === undefined) {
		await fs.writeFile(paths.configTomlPath, '', 'utf8');
	}
}
