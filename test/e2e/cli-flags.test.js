import test from 'ava';
import {runCli} from '../helpers/run-cli.js';

test('cli -h shows interactive guidance', t => {
	const {code, stdout} = runCli(['-h']);

	t.is(code, 0);
	t.true(stdout.includes('Run `atmu`'));
	t.true(stdout.includes('atmu'));
});

test('cli -v prints version', t => {
	const {code, stdout} = runCli(['-v']);

	t.is(code, 0);
	t.true(stdout.includes('0.0.1'));
});
