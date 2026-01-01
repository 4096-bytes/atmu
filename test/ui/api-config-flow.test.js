import {mkdtempSync, mkdirSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import process from 'node:process';
import test from 'ava';
import {render} from 'ink-testing-library';
import {jsx as _jsx} from 'react/jsx-runtime';
import {waitForText} from '../helpers/wait-for-text.js';

test.serial(
	'api config flow writes ~/.codex/config.toml and ~/.codex/auth.json',
	async t => {
		const originalForceColor = process.env.FORCE_COLOR;
		const originalNoColor = process.env.NO_COLOR;
		const originalTerm = process.env.TERM;
		const temporaryHomeRoot = join(process.cwd(), 'test', '.tmp');
		mkdirSync(temporaryHomeRoot, {recursive: true});
		const temporaryHome = mkdtempSync(join(temporaryHomeRoot, 'home-'));
		process.env.FORCE_COLOR = '0';
		process.env.NO_COLOR = '1';
		process.env.TERM = 'dumb';

		const {default: Index} = await import('../../dist/commands/index.js');
		const commandRunner = async (_command, arguments_) => {
			if (arguments_[0] === 'list') {
				return {
					stdout: JSON.stringify({
						dependencies: {'@openai/codex': {version: '1.0.0'}},
					}),
					stderr: '',
					exitCode: 0,
				};
			}

			throw new Error(`Unexpected command: ${arguments_.join(' ')}`);
		};

		t.teardown(() => {
			if (originalForceColor === undefined) {
				delete process.env.FORCE_COLOR;
			} else {
				process.env.FORCE_COLOR = originalForceColor;
			}

			if (originalNoColor === undefined) {
				delete process.env.NO_COLOR;
			} else {
				process.env.NO_COLOR = originalNoColor;
			}

			if (originalTerm === undefined) {
				delete process.env.TERM;
			} else {
				process.env.TERM = originalTerm;
			}

			rmSync(temporaryHome, {recursive: true, force: true});
		});

		const {cleanup, lastFrame, stdin, unmount} = render(
			_jsx(Index, {
				options: {},
				args: [],
				commandRunner,
				homeDirectory: temporaryHome,
			}),
		);
		t.teardown(() => {
			unmount();
			cleanup();
		});

		await waitForText(lastFrame, 'Codex CLI is installed.');

		// Select "configure API provider" (first menu item).
		stdin.write('\r');

		await waitForText(lastFrame, '> Provider');
		await new Promise(resolve => {
			setTimeout(resolve, 50);
		});

		stdin.write('openai');
		await waitForText(lastFrame, 'openai');
		stdin.write('\r');

		await waitForText(lastFrame, '> Base URL');
		await new Promise(resolve => {
			setTimeout(resolve, 50);
		});

		stdin.write('https://api.example.com/v1');
		await waitForText(lastFrame, 'https://api.example.com/v1');
		stdin.write('\r');

		await waitForText(lastFrame, '> API Key');
		await new Promise(resolve => {
			setTimeout(resolve, 50);
		});

		stdin.write('sk-test');
		await waitForText(lastFrame, '*');
		stdin.write('\r');

		const savedOutput = await waitForText(
			lastFrame,
			'Configuration saved. Restart your terminal or open a new window',
		);

		t.false(savedOutput.includes('sk-test'));

		// Return to main menu.
		await new Promise(resolve => {
			setTimeout(resolve, 50);
		});
		stdin.write('\r');

		await waitForText(lastFrame, 'exit - quit atmu');
		const mainOutput = await waitForText(lastFrame, 'Provider: openai');

		t.true(mainOutput.includes('Base URL:'));
		t.true(mainOutput.includes('https://api.example.com/v1'));

		const configTomlPath = join(temporaryHome, '.codex', 'config.toml');
		const authJsonPath = join(temporaryHome, '.codex', 'auth.json');

		const configToml = readFileSync(configTomlPath, 'utf8');
		t.true(configToml.includes('model_provider = "openai"'));
		t.true(configToml.includes('disable_response_storage = true'));
		t.true(configToml.includes('[model_providers.openai]'));
		t.true(configToml.includes('base_url = "https://api.example.com/v1"'));
		t.true(configToml.includes('wire_api = "responses"'));
		t.true(configToml.includes('temp_env_key = "OPENAI_API_KEY"'));
		t.true(configToml.includes('requires_openai_auth = true'));

		const authJson = JSON.parse(readFileSync(authJsonPath, 'utf8'));
		t.is(authJson.OPENAI_API_KEY, 'sk-test');
	},
);

test.serial('api config validation uses badge and blocks progress', async t => {
	const originalForceColor = process.env.FORCE_COLOR;
	const originalNoColor = process.env.NO_COLOR;
	const originalTerm = process.env.TERM;
	const temporaryHomeRoot = join(process.cwd(), 'test', '.tmp');
	mkdirSync(temporaryHomeRoot, {recursive: true});
	const temporaryHome = mkdtempSync(join(temporaryHomeRoot, 'home-'));
	process.env.FORCE_COLOR = '0';
	process.env.NO_COLOR = '1';
	process.env.TERM = 'dumb';

	const {default: Index} = await import('../../dist/commands/index.js');
	const commandRunner = async (_command, arguments_) => {
		if (arguments_[0] === 'list') {
			return {
				stdout: JSON.stringify({
					dependencies: {'@openai/codex': {version: '1.0.0'}},
				}),
				stderr: '',
				exitCode: 0,
			};
		}

		throw new Error(`Unexpected command: ${arguments_.join(' ')}`);
	};

	t.teardown(() => {
		if (originalForceColor === undefined) {
			delete process.env.FORCE_COLOR;
		} else {
			process.env.FORCE_COLOR = originalForceColor;
		}

		if (originalNoColor === undefined) {
			delete process.env.NO_COLOR;
		} else {
			process.env.NO_COLOR = originalNoColor;
		}

		if (originalTerm === undefined) {
			delete process.env.TERM;
		} else {
			process.env.TERM = originalTerm;
		}

		rmSync(temporaryHome, {recursive: true, force: true});
	});

	const {cleanup, lastFrame, stdin, unmount} = render(
		_jsx(Index, {
			options: {},
			args: [],
			commandRunner,
			homeDirectory: temporaryHome,
		}),
	);
	t.teardown(() => {
		unmount();
		cleanup();
	});

	await waitForText(lastFrame, 'Codex CLI is installed.');

	// Select "configure API provider" (first menu item).
	stdin.write('\r');

	await waitForText(lastFrame, '> Provider');
	await new Promise(resolve => {
		setTimeout(resolve, 50);
	});

	// Submit empty provider.
	stdin.write('\r');

	const output = await waitForText(lastFrame, 'Provider is required.');
	t.true(output.includes('ERROR'));
	t.true(output.includes('Provider is required.'));
});
