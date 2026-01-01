import {mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import process from 'node:process';
import test from 'ava';
import {render} from 'ink-testing-library';
import {jsx as _jsx} from 'react/jsx-runtime';
import Index from '../../dist/commands/index.js';
import {waitForText} from '../helpers/wait-for-text.js';

test('render main UI', async t => {
	const temporaryHomeRoot = join(process.cwd(), 'test', '.tmp');
	mkdirSync(temporaryHomeRoot, {recursive: true});
	const temporaryDirectory = mkdtempSync(join(temporaryHomeRoot, 'home-'));
	t.teardown(() => {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	});

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

	const {cleanup, lastFrame, unmount} = render(
		_jsx(Index, {
			options: {},
			args: [],
			commandRunner,
			homeDirectory: temporaryDirectory,
		}),
	);
	t.teardown(() => {
		unmount();
		cleanup();
	});

	const output = await waitForText(lastFrame, 'Codex CLI is installed.');
	t.true(output.includes('╭'));
	t.true(output.includes('╯'));
	t.true(output.includes(',---. ,--------.,--.'));
	t.true(output.includes('v0.0.1'));
	t.true(output.includes('Powered by 4096-bytes'));
	t.true(output.includes('Codex CLI is installed.'));
	t.true(output.includes('Installed: 1.0.0'));
	t.true(
		output.includes(
			'configure API provider - use a custom provider for Codex CLI',
		),
	);
	t.true(output.includes('exit - quit atmu'));
});
