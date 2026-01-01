import {spawn} from 'node:child_process';

export type CommandResult = {
	readonly stdout: string;
	readonly stderr: string;
	readonly exitCode: number;
};

export type RunCommandOptions = {
	readonly allowNonZeroExitCode?: boolean;
	readonly cwd?: string;
	readonly env?: NodeJS.ProcessEnv;
	readonly timeoutMs?: number;
};

export type CommandRunner = (
	command: string,
	arguments_: readonly string[],
	options?: RunCommandOptions,
) => Promise<CommandResult>;

function summarizeOutput(value: string, maxLength = 240): string {
	const singleLine = value.replaceAll('\r\n', '\n').split('\n')[0]?.trim();
	if (!singleLine) {
		return '';
	}

	return singleLine.length > maxLength
		? `${singleLine.slice(0, maxLength - 1)}…`
		: singleLine;
}

export const runCommand: CommandRunner = async (
	command,
	arguments_,
	{allowNonZeroExitCode = false, cwd, env, timeoutMs}: RunCommandOptions = {},
): Promise<CommandResult> =>
	new Promise<CommandResult>((resolve, reject) => {
		const child = spawn(command, [...arguments_], {
			cwd,
			env,
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true,
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.setEncoding('utf8');
		child.stderr?.setEncoding('utf8');

		child.stdout?.on('data', (chunk: string) => {
			stdout += chunk;
		});

		child.stderr?.on('data', (chunk: string) => {
			stderr += chunk;
		});

		let timeoutId: NodeJS.Timeout | undefined;
		let didTimeout = false;

		const clearTimeoutIfSet = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};

		if (typeof timeoutMs === 'number' && timeoutMs > 0) {
			timeoutId = setTimeout(() => {
				didTimeout = true;
				child.kill();
			}, timeoutMs);
		}

		child.once('error', error => {
			clearTimeoutIfSet();
			reject(error);
		});

		child.once('close', exitCode => {
			clearTimeoutIfSet();

			const resolvedExitCode = typeof exitCode === 'number' ? exitCode : 1;

			if (didTimeout) {
				reject(new Error('Timeout'));
				return;
			}

			if (!allowNonZeroExitCode && resolvedExitCode !== 0) {
				const stderrSummary = summarizeOutput(stderr);
				const stdoutSummary = summarizeOutput(stdout);
				const detail = stderrSummary || stdoutSummary;
				reject(
					new Error(
						detail
							? `Command failed (exit ${resolvedExitCode}): ${detail}`
							: `Command failed (exit ${resolvedExitCode})`,
					),
				);
				return;
			}

			resolve({stdout, stderr, exitCode: resolvedExitCode});
		});
	});
