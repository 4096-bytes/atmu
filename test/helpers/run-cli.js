import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import process from 'node:process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const runCli = cliArguments => {
	const projectRoot = dirname(fileURLToPath(import.meta.url));
	const cliPath = join(projectRoot, '..', '..', 'dist', 'atmu.js');

	const temporaryDirectory = mkdtempSync(join(tmpdir(), 'atmu-test-'));
	const stdoutPath = join(temporaryDirectory, 'stdout.txt');
	const stderrPath = join(temporaryDirectory, 'stderr.txt');

	const env = {
		...process.env,
		FORCE_COLOR: '0',
		NO_COLOR: '1',
		TERM: 'dumb',
	};

	const command = [process.execPath, cliPath, ...cliArguments]
		.map(argument => JSON.stringify(argument))
		.join(' ');

	const result = spawnSync(
		'bash',
		[
			'-lc',
			`${command} > ${JSON.stringify(stdoutPath)} 2> ${JSON.stringify(stderrPath)}`,
		],
		{
			cwd: projectRoot,
			env,
			timeout: 5000,
		},
	);

	const stdout = readFileSync(stdoutPath, 'utf8');
	const stderr = readFileSync(stderrPath, 'utf8');

	rmSync(temporaryDirectory, {recursive: true, force: true});

	return {code: result.status ?? 0, stdout, stderr};
};
