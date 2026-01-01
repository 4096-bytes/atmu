import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'ava';
import {writeCodexApiConfigFiles} from '../../dist/utils/codex-config.js';

test('writeCodexApiConfigFiles updates existing provider and preserves unrelated content', async t => {
	const temporaryHome = mkdtempSync(join(tmpdir(), 'atmu-test-home-'));
	const codexDirectory = join(temporaryHome, '.codex');
	mkdirSync(codexDirectory, {recursive: true});

	t.teardown(() => {
		rmSync(temporaryHome, {recursive: true, force: true});
	});

	const configTomlPath = join(codexDirectory, 'config.toml');
	const authJsonPath = join(codexDirectory, 'auth.json');

	writeFileSync(
		configTomlPath,
		[
			'# Existing settings',
			'some_other_key = 123',
			'',
			'[other]',
			'foo = "bar"',
			'',
			'[model_providers.openai]',
			'name = "openai"',
			'base_url = "https://old.example.com/v1"',
			'wire_api = "responses"',
			'temp_env_key = "OPENAI_API_KEY"',
			'requires_openai_auth = true',
			'',
		].join('\n'),
		'utf8',
	);

	writeFileSync(
		authJsonPath,
		`${JSON.stringify({OPENAI_API_KEY: 'old-key', OTHER: 'keep'}, null, 2)}\n`,
		'utf8',
	);

	await writeCodexApiConfigFiles(
		{
			provider: 'openai',
			baseUrl: 'https://new.example.com/v1',
			apiKey: 'new-key',
		},
		{homeDirectory: temporaryHome},
	);

	const configToml = readFileSync(configTomlPath, 'utf8');
	t.true(configToml.includes('# Existing settings'));
	t.true(configToml.includes('some_other_key = 123'));
	t.true(configToml.includes('[other]'));
	t.true(configToml.includes('foo = "bar"'));
	t.true(configToml.includes('model_provider = "openai"'));
	t.true(configToml.includes('disable_response_storage = true'));
	t.true(configToml.includes('[model_providers.openai]'));
	t.true(configToml.includes('base_url = "https://new.example.com/v1"'));
	t.false(configToml.includes('base_url = "https://old.example.com/v1"'));

	const authJson = JSON.parse(readFileSync(authJsonPath, 'utf8'));
	t.is(authJson.OPENAI_API_KEY, 'new-key');
	t.is(authJson.OTHER, 'keep');
});
