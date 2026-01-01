import {mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import process from 'node:process';
import test from 'ava';
import {render} from 'ink-testing-library';
import {jsx as _jsx} from 'react/jsx-runtime';
import Index from '../../dist/commands/index.js';

test('render main UI', t => {
	const temporaryHomeRoot = join(process.cwd(), 'test', '.tmp');
	mkdirSync(temporaryHomeRoot, {recursive: true});
	const temporaryDirectory = mkdtempSync(join(temporaryHomeRoot, 'home-'));
	t.teardown(() => {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	});

	const {lastFrame} = render(
		_jsx(Index, {options: {}, args: [], homeDirectory: temporaryDirectory}),
	);

	const output = lastFrame() ?? '';
	t.true(output.includes('╭'));
	t.true(output.includes('╯'));
	t.true(output.includes(',---. ,--------.,--.'));
	t.true(output.includes('v0.0.1'));
	t.true(output.includes('Powered by 4096-bytes'));
	t.true(
		output.includes(
			'configure API provider - use a custom provider for Codex CLI',
		),
	);
	t.true(output.includes('exit - quit atmu'));
});
