import test from 'ava';
import {render} from 'ink-testing-library';
import {jsx as _jsx} from 'react/jsx-runtime';
import Index from '../../dist/commands/index.js';

test('render main UI', t => {
	const {lastFrame} = render(_jsx(Index, {options: {}, args: []}));

	const output = lastFrame() ?? '';
	t.true(output.includes('╭'));
	t.true(output.includes('╯'));
	t.true(output.includes(',---. ,--------.,--.'));
	t.true(output.includes('v0.0.1'));
	t.true(output.includes('Powered by 4096-bytes'));
	t.true(output.includes('exit - quit atmu'));
});
