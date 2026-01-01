import {Alert, Badge, PasswordInput, Spinner, TextInput} from '@inkjs/ui';
import {Box, Text, useInput} from 'ink';
import {useMemo, useState} from 'react';
import {writeCodexApiConfigFiles} from '../../utils/codex-config.js';
import {ActionScreen} from '../layout/action.js';

type Properties = {
	readonly homeDirectory?: string;
	readonly onDone: () => void;
};

type Field = 'provider' | 'baseUrl' | 'apiKey';

type FieldErrors = {
	readonly provider?: string;
	readonly baseUrl?: string;
	readonly apiKey?: string;
};

function validateProvider(provider: string): string | undefined {
	if (provider.trim() === '') {
		return 'Provider is required.';
	}

	if (!/^[\w-]+$/.test(provider)) {
		return 'Provider must use letters, numbers, underscores, or dashes.';
	}

	return undefined;
}

function validateBaseUrl(baseUrl: string): string | undefined {
	const trimmed = baseUrl.trim();
	if (trimmed === '') {
		return 'Base URL is required.';
	}

	try {
		const url = new URL(trimmed);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return 'Base URL must start with http:// or https://.';
		}
	} catch {
		return 'Base URL must be a valid URL (including protocol).';
	}

	return undefined;
}

function validateApiKey(apiKey: string): string | undefined {
	if (apiKey.trim() === '') {
		return 'API Key is required.';
	}

	return undefined;
}

export function ApiConfigScreen({homeDirectory, onDone}: Properties) {
	const [activeField, setActiveField] = useState<Field>('provider');
	const [provider, setProvider] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const [apiKey, setApiKey] = useState('');
	const [errors, setErrors] = useState<FieldErrors>({});
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | undefined>();
	const [isSaved, setIsSaved] = useState(false);

	const errorEntries = useMemo(() => {
		const next: Array<{readonly id: string; readonly message: string}> = [];

		if (errors.provider) {
			next.push({id: 'provider', message: errors.provider});
		}

		if (errors.baseUrl) {
			next.push({id: 'baseUrl', message: errors.baseUrl});
		}

		if (errors.apiKey) {
			next.push({id: 'apiKey', message: errors.apiKey});
		}

		if (saveError) {
			next.push({id: 'save', message: saveError});
		}

		return next;
	}, [errors, saveError]);

	useInput((_input, key) => {
		if (isSaving) {
			return;
		}

		if (isSaved) {
			if (key.escape || key.return) {
				onDone();
			}

			return;
		}

		if (key.escape) {
			onDone();
		}
	});

	const submit = async ({
		apiKeyValue,
	}: {readonly apiKeyValue?: string} = {}) => {
		const resolvedApiKey = apiKeyValue ?? apiKey;
		const nextErrors = {
			provider: validateProvider(provider),
			baseUrl: validateBaseUrl(baseUrl),
			apiKey: validateApiKey(resolvedApiKey),
		};

		setErrors(nextErrors);
		setSaveError(undefined);

		if (nextErrors.provider ?? nextErrors.baseUrl ?? nextErrors.apiKey) {
			if (nextErrors.provider) {
				setActiveField('provider');
				return;
			}

			if (nextErrors.baseUrl) {
				setActiveField('baseUrl');
				return;
			}

			setActiveField('apiKey');
			return;
		}

		setIsSaving(true);

		try {
			await writeCodexApiConfigFiles(
				{provider, baseUrl, apiKey: resolvedApiKey},
				{homeDirectory},
			);
			setIsSaved(true);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setSaveError(`Failed to save configuration: ${message}`);
		} finally {
			setIsSaving(false);
		}
	};

	if (isSaved) {
		return (
			<ActionScreen
				title="configure API provider"
				actions={[
					{key: 'enter', label: 'to return'},
					{key: 'esc', label: 'to return'},
					{key: 'ctrl+c', label: 'to quit'},
				]}
			>
				<Alert variant="success">
					Configuration saved. Restart your terminal or open a new window so
					Codex CLI can load the updated configuration.
				</Alert>
			</ActionScreen>
		);
	}

	return (
		<ActionScreen
			title="configure API provider"
			actions={[
				{key: 'esc', label: 'to go back'},
				{key: 'enter', label: 'to continue / save'},
				{key: 'ctrl+c', label: 'to quit'},
			]}
		>
			<Box flexDirection="column" gap={1}>
				{errorEntries.length > 0 && (
					<Box flexDirection="column" gap={0}>
						{errorEntries.map(entry => (
							<Box key={entry.id} gap={1}>
								<Badge color="red">Error</Badge>
								<Text>{entry.message}</Text>
							</Box>
						))}
					</Box>
				)}

				<Box flexDirection="column" gap={1}>
					<Box flexDirection="column">
						<Text>{activeField === 'provider' ? '>' : ' '} Provider</Text>
						<TextInput
							isDisabled={isSaving || activeField !== 'provider'}
							placeholder="Enter provider..."
							onChange={setProvider}
							onSubmit={value => {
								setProvider(value);
								const providerError = validateProvider(value);
								setErrors(previous => ({
									...previous,
									provider: providerError,
								}));
								if (!providerError) {
									setActiveField('baseUrl');
								}
							}}
						/>
					</Box>

					<Box flexDirection="column">
						<Text>{activeField === 'baseUrl' ? '>' : ' '} Base URL</Text>
						<TextInput
							isDisabled={isSaving || activeField !== 'baseUrl'}
							placeholder="Enter base URL..."
							onChange={setBaseUrl}
							onSubmit={value => {
								setBaseUrl(value);
								const baseUrlError = validateBaseUrl(value);
								setErrors(previous => ({
									...previous,
									baseUrl: baseUrlError,
								}));
								if (!baseUrlError) {
									setActiveField('apiKey');
								}
							}}
						/>
					</Box>

					<Box flexDirection="column">
						<Text>{activeField === 'apiKey' ? '>' : ' '} API Key</Text>
						<PasswordInput
							isDisabled={isSaving || activeField !== 'apiKey'}
							placeholder="Enter API key..."
							onChange={setApiKey}
							onSubmit={value => {
								setApiKey(value);
								void submit({apiKeyValue: value});
							}}
						/>
					</Box>
				</Box>

				{isSaving && <Spinner label="Saving configuration..." />}
			</Box>
		</ActionScreen>
	);
}
