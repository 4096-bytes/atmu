import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import {jsx as _jsx} from 'react/jsx-runtime';
import Index from './dist/commands/index.js';

test('greet user', t => {
	const {lastFrame} = render(_jsx(Index, {options: {name: 'Jane'}}));

	t.is(lastFrame(), `Hello, ${chalk.green('Jane')}`);
});
