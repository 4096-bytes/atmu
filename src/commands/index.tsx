import {Badge, Spinner} from '@inkjs/ui';
import {Box, Text, useApp} from 'ink';
import {useCallback, useEffect, useState, type ReactElement} from 'react';
import type {MenuId, MenuItem} from '../types/menu.js';
import {menuExtensions} from '../app/menu/index.js';
import {IndexScreen} from '../ui/screens/index.js';
import {ensureCodexConfigTomlExists} from '../utils/codex-config.js';
import {runCommand, type CommandRunner} from '../utils/command.js';
import {checkGlobalPackageStatus, installGlobalPackage} from '../utils/npm.js';
import {createExitMenuItem, formatMenuLabel} from '../utils/menu.js';
import {getPackageMeta} from '../utils/package-meta.js';

type Properties = {
	readonly commandRunner?: CommandRunner;
	readonly homeDirectory?: string;
};

const codexCliPackage = '@openai/codex';

const setupCodexCliMenuItem: MenuItem = {
	id: 'setup-codex-cli',
	label: formatMenuLabel('setup Codex CLI', 'install @openai/codex globally'),
};

const baseMenuItems: readonly MenuItem[] = [
	...menuExtensions.map(extension => ({
		id: extension.id,
		label: extension.label,
	})),
	createExitMenuItem(),
];

const setupMenuItems: readonly MenuItem[] = [
	setupCodexCliMenuItem,
	createExitMenuItem(),
];

type CodexCliEnvironmentState =
	| {readonly status: 'checking'}
	| {readonly status: 'missing'}
	| {
			readonly status: 'installing';
			readonly attempt: number;
			readonly maxAttempts: number;
			readonly previousError?: string;
	  }
	| {readonly status: 'failed'; readonly error: string}
	| {readonly status: 'ok'; readonly version?: string};

function formatErrorSummary(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

async function loadCodexCliEnvironmentState(
	commandRunner: CommandRunner,
): Promise<CodexCliEnvironmentState> {
	try {
		const status = await checkGlobalPackageStatus(codexCliPackage, {
			runner: commandRunner,
		});

		if (status.status === 'missing') {
			return {status: 'missing'};
		}

		return {status: 'ok', version: status.version};
	} catch {
		return {status: 'missing'};
	}
}

function CodexCliEnvironmentStatus({
	state,
}: {
	readonly state: CodexCliEnvironmentState;
}) {
	if (state.status === 'checking') {
		return <Spinner label="Checking environment..." />;
	}

	if (state.status === 'installing') {
		return (
			<Box flexDirection="column" gap={0}>
				<Spinner
					label={`Installing Codex CLI... (attempt ${state.attempt}/${state.maxAttempts})`}
				/>
				{state.previousError && (
					<Text
						dimColor
					>{`Previous attempt failed: ${state.previousError}`}</Text>
				)}
			</Box>
		);
	}

	if (state.status === 'missing') {
		return (
			<Box flexDirection="column" gap={0}>
				<Box gap={1}>
					<Badge color="yellow">Warning</Badge>
					<Text>Codex CLI is not installed.</Text>
				</Box>
				<Text dimColor>
					Select &quot;setup Codex CLI&quot; to install it globally.
				</Text>
			</Box>
		);
	}

	if (state.status === 'failed') {
		return (
			<Box flexDirection="column" gap={0}>
				<Box gap={1}>
					<Badge color="red">Error</Badge>
					<Text>Setup failed.</Text>
				</Box>
				<Text dimColor>{state.error}</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={0}>
			<Box gap={1}>
				<Badge color="green">Ready</Badge>
				<Text>Codex CLI is installed.</Text>
			</Box>
			{state.version && <Text dimColor>{`Installed: ${state.version}`}</Text>}
		</Box>
	);
}

export default function Index({
	commandRunner = runCommand,
	homeDirectory,
}: Properties = {}): ReactElement {
	const app = useApp();
	const {version} = getPackageMeta();
	const [activeExtensionId, setActiveExtensionId] = useState<
		MenuId | undefined
	>(undefined);
	const [statusText, setStatusText] = useState<string | undefined>();
	const [codexCliEnv, setCodexCliEnv] = useState<CodexCliEnvironmentState>({
		status: 'checking',
	});
	const [menuRevision, setMenuRevision] = useState(0);

	useEffect(() => {
		if (activeExtensionId) {
			return;
		}

		let isCancelled = false;

		(async () => {
			const statusParts = await Promise.all(
				menuExtensions.map(async extension => {
					if (!extension.getStatusText) {
						return undefined;
					}

					return extension.getStatusText({homeDirectory});
				}),
			);

			if (isCancelled) {
				return;
			}

			const statusText = statusParts.filter(Boolean).join('\n');

			setStatusText(statusText === '' ? undefined : statusText);
		})();

		return () => {
			isCancelled = true;
		};
	}, [activeExtensionId, homeDirectory]);

	useEffect(() => {
		if (activeExtensionId) {
			return;
		}

		let isCancelled = false;

		(async () => {
			setCodexCliEnv({status: 'checking'});
			const next = await loadCodexCliEnvironmentState(commandRunner);
			if (!isCancelled) {
				setCodexCliEnv(next);
			}
		})();

		return () => {
			isCancelled = true;
		};
	}, [activeExtensionId, commandRunner]);

	const refreshCodexCliEnv = useCallback(async () => {
		setCodexCliEnv({status: 'checking'});
		setCodexCliEnv(await loadCodexCliEnvironmentState(commandRunner));
	}, [commandRunner]);

	const setupCodexCli = useCallback(async () => {
		const installTimeoutMs = 5 * 60_000;
		const maxAttempts = 3;

		setCodexCliEnv({
			status: 'installing',
			attempt: 1,
			maxAttempts,
		});

		try {
			await ensureCodexConfigTomlExists({homeDirectory});
		} catch (error) {
			setCodexCliEnv({
				status: 'failed',
				error: `Failed to initialize ~/.codex/config.toml: ${formatErrorSummary(error)}`,
			});
			return;
		}

		const attemptInstall = async (
			attempt: number,
			previousError?: string,
		): Promise<void> => {
			setCodexCliEnv({
				status: 'installing',
				attempt,
				maxAttempts,
				previousError,
			});

			try {
				await installGlobalPackage(codexCliPackage, {
					runner: commandRunner,
					timeoutMs: installTimeoutMs,
				});
				await refreshCodexCliEnv();
			} catch (error) {
				const errorMessage = formatErrorSummary(error);
				if (attempt >= maxAttempts) {
					setCodexCliEnv({
						status: 'failed',
						error: `Failed to install: ${errorMessage}`,
					});
					return;
				}

				await attemptInstall(attempt + 1, errorMessage);
			}
		};

		await attemptInstall(1);
	}, [commandRunner, homeDirectory, refreshCodexCliEnv]);

	const handleSelectMenu = useCallback(
		(id: MenuId) => {
			if (id === 'exit') {
				app.exit();
				return;
			}

			if (id === setupCodexCliMenuItem.id) {
				setMenuRevision(previous => previous + 1);
				void setupCodexCli();
				return;
			}

			setActiveExtensionId(id);
		},
		[app, setupCodexCli],
	);

	const activeExtension = activeExtensionId
		? menuExtensions.find(extension => extension.id === activeExtensionId)
		: undefined;

	useEffect(() => {
		if (!activeExtensionId) {
			return;
		}

		if (activeExtension) {
			return;
		}

		setActiveExtensionId(undefined);
	}, [activeExtension, activeExtensionId]);

	if (activeExtensionId && activeExtension) {
		return activeExtension.render({
			homeDirectory,
			onDone() {
				setActiveExtensionId(undefined);
			},
		});
	}

	const isMenuDisabled =
		codexCliEnv.status === 'checking' || codexCliEnv.status === 'installing';

	const menuItems =
		codexCliEnv.status === 'ok' || codexCliEnv.status === 'checking'
			? baseMenuItems
			: setupMenuItems;

	return (
		<IndexScreen
			version={version}
			environmentStatus={<CodexCliEnvironmentStatus state={codexCliEnv} />}
			isMenuDisabled={isMenuDisabled}
			menuKey={`${codexCliEnv.status}-${menuRevision}`}
			menuItems={menuItems}
			statusText={statusText}
			onSelectMenu={handleSelectMenu}
		/>
	);
}
