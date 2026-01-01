import process from 'node:process';
import {runCommand, type CommandRunner} from './command.js';

export type GlobalPackageStatus =
	| {readonly status: 'ok'; readonly version?: string}
	| {readonly status: 'missing'};

function getNpmCommand(): string {
	return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	return value as Record<string, unknown>;
}

export async function checkGlobalPackageStatus(
	packageName: string,
	{runner = runCommand}: {readonly runner?: CommandRunner} = {},
): Promise<GlobalPackageStatus> {
	const {stdout} = await runner(
		getNpmCommand(),
		['list', '-g', '--depth=0', '--json'],
		{allowNonZeroExitCode: true},
	);

	const parsed = JSON.parse(stdout) as unknown;
	const root = readRecord(parsed);
	const dependencies = root ? readRecord(root['dependencies']) : undefined;

	const dependency = dependencies
		? readRecord(dependencies[packageName])
		: undefined;
	if (!dependency) {
		return {status: 'missing'};
	}

	const version =
		typeof dependency['version'] === 'string'
			? dependency['version']
			: undefined;
	return {status: 'ok', version};
}

export async function installGlobalPackage(
	packageName: string,
	{
		runner = runCommand,
		timeoutMs,
	}: {readonly runner?: CommandRunner; readonly timeoutMs: number},
): Promise<void> {
	await runner(getNpmCommand(), ['install', '-g', packageName], {timeoutMs});
}
