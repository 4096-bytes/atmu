import {mkdtempSync, mkdirSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import process from 'node:process';
import test from 'ava';
import {render} from 'ink-testing-library';
import {jsx as _jsx} from 'react/jsx-runtime';
import {waitForText} from '../helpers/wait-for-text.js';

const createTemporaryHome = t => {
	const temporaryHomeRoot = join(process.cwd(), 'test', '.tmp');
	mkdirSync(temporaryHomeRoot, {recursive: true});
	const temporaryHome = mkdtempSync(join(temporaryHomeRoot, 'home-'));
	t.teardown(() => {
		rmSync(temporaryHome, {recursive: true, force: true});
	});

	return temporaryHome;
};

const withDumbTerminal = t => {
	const originalForceColor = process.env.FORCE_COLOR;
	const originalNoColor = process.env.NO_COLOR;
	const originalTerm = process.env.TERM;

	process.env.FORCE_COLOR = '0';
	process.env.NO_COLOR = '1';
	process.env.TERM = 'dumb';

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
	});
};

test.serial('missing state shows warning and setup-only menu', async t => {
	withDumbTerminal(t);
	const temporaryHome = createTemporaryHome(t);

	const {default: Index} = await import('../../dist/commands/index.js');
	const commandRunner = async (_command, arguments_) => {
		if (arguments_[0] === 'list') {
			return {
				stdout: JSON.stringify({dependencies: {}}),
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
			homeDirectory: temporaryHome,
		}),
	);
	t.teardown(() => {
		unmount();
		cleanup();
	});

	const output = await waitForText(lastFrame, 'Codex CLI is not installed.');
	t.true(output.includes('setup Codex CLI - install @openai/codex globally'));
	t.true(output.includes('exit - quit atmu'));
	t.false(
		output.includes(
			'configure API provider - use a custom provider for Codex CLI',
		),
	);
});

test.serial(
	'setup creates ~/.codex/config.toml and transitions to ok',
	async t => {
		withDumbTerminal(t);
		const temporaryHome = createTemporaryHome(t);

		const {default: Index} = await import('../../dist/commands/index.js');

		let isInstalled = false;
		let installCalls = 0;
		let resolveInstall;

		const commandRunner = async (_command, arguments_) => {
			if (arguments_[0] === 'list') {
				return {
					stdout: JSON.stringify({
						dependencies: isInstalled
							? {'@openai/codex': {version: '1.2.3'}}
							: {},
					}),
					stderr: '',
					exitCode: 0,
				};
			}

			if (arguments_[0] === 'install') {
				installCalls++;
				return new Promise(resolve => {
					resolveInstall = () => {
						isInstalled = true;
						resolve({stdout: '', stderr: '', exitCode: 0});
					};
				});
			}

			throw new Error(`Unexpected command: ${arguments_.join(' ')}`);
		};

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

		await waitForText(lastFrame, 'Codex CLI is not installed.');

		// Trigger setup (default selected menu item).
		stdin.write('\r');

		await waitForText(lastFrame, 'Installing Codex CLI... (attempt 1/3)');

		await new Promise(resolve => {
			setTimeout(resolve, 50);
		});
		t.is(installCalls, 1);

		// Menu is disabled during installation; repeated enter should not retrigger.
		stdin.write('\r');
		await new Promise(resolve => {
			setTimeout(resolve, 25);
		});
		t.is(installCalls, 1);

		resolveInstall();

		const output = await waitForText(lastFrame, 'Codex CLI is installed.');
		t.true(output.includes('Installed: 1.2.3'));
		t.true(
			output.includes(
				'configure API provider - use a custom provider for Codex CLI',
			),
		);

		const configTomlPath = join(temporaryHome, '.codex', 'config.toml');
		t.is(readFileSync(configTomlPath, 'utf8'), '');
	},
);

test.serial(
	'setup retries on timeout and surfaces the previous error',
	async t => {
		withDumbTerminal(t);
		const temporaryHome = createTemporaryHome(t);

		const {default: Index} = await import('../../dist/commands/index.js');

		let isInstalled = false;
		let installCalls = 0;

		const commandRunner = async (_command, arguments_) => {
			if (arguments_[0] === 'list') {
				return {
					stdout: JSON.stringify({
						dependencies: isInstalled
							? {'@openai/codex': {version: '1.2.3'}}
							: {},
					}),
					stderr: '',
					exitCode: 0,
				};
			}

			if (arguments_[0] === 'install') {
				installCalls++;
				if (installCalls === 1) {
					throw new Error('Timeout');
				}

				isInstalled = true;
				return {stdout: '', stderr: '', exitCode: 0};
			}

			throw new Error(`Unexpected command: ${arguments_.join(' ')}`);
		};

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

		await waitForText(lastFrame, 'Codex CLI is not installed.');
		stdin.write('\r');

		const output = await waitForText(lastFrame, 'Codex CLI is installed.');
		t.true(output.includes('Installed: 1.2.3'));
		t.is(installCalls, 2);
	},
);

test.serial('setup fails after max retries and stays actionable', async t => {
	withDumbTerminal(t);
	const temporaryHome = createTemporaryHome(t);

	const {default: Index} = await import('../../dist/commands/index.js');

	let isInstalled = false;
	let installCalls = 0;

	const commandRunner = async (_command, arguments_) => {
		if (arguments_[0] === 'list') {
			return {
				stdout: JSON.stringify({
					dependencies: isInstalled
						? {'@openai/codex': {version: '1.2.3'}}
						: {},
				}),
				stderr: '',
				exitCode: 0,
			};
		}

		if (arguments_[0] === 'install') {
			installCalls++;
			if (installCalls <= 3) {
				throw new Error('Network error');
			}

			isInstalled = true;
			return {stdout: '', stderr: '', exitCode: 0};
		}

		throw new Error(`Unexpected command: ${arguments_.join(' ')}`);
	};

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

	await waitForText(lastFrame, 'Codex CLI is not installed.');
	stdin.write('\r');

	const output = await waitForText(lastFrame, 'Setup failed.');
	t.true(output.includes('Failed to install: Network error'));
	t.true(output.includes('setup Codex CLI - install @openai/codex globally'));
	t.false(
		output.includes(
			'configure API provider - use a custom provider for Codex CLI',
		),
	);
	t.is(installCalls, 3);

	// Reset selection after failure so setup is actionable again.
	stdin.write('\r');

	const successOutput = await waitForText(lastFrame, 'Codex CLI is installed.');
	t.true(successOutput.includes('Installed: 1.2.3'));
	t.true(
		successOutput.includes(
			'configure API provider - use a custom provider for Codex CLI',
		),
	);
	t.is(installCalls, 4);
});
