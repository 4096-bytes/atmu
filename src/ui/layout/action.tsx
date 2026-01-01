import {Box, Text, useStdout} from 'ink';
import type {ReactNode} from 'react';

export type Action = {
	readonly key: string;
	readonly label: string;
};

type Properties = {
	readonly title: string;
	readonly children: ReactNode;
	readonly actions?: readonly Action[];
};

function ActionBar({actions}: {readonly actions: readonly Action[]}) {
	return (
		<Box gap={3}>
			{actions.map(action => (
				<Box key={`${action.key}-${action.label}`} gap={1}>
					<Text inverse>{` ${action.key} `}</Text>
					<Text dimColor>{action.label}</Text>
				</Box>
			))}
		</Box>
	);
}

export function ActionScreen({title, children, actions = []}: Properties) {
	const {stdout} = useStdout();
	const reservedRows = 1;
	const screenHeight =
		typeof stdout.rows === 'number' && stdout.rows > reservedRows
			? stdout.rows - reservedRows
			: undefined;

	return (
		<Box flexDirection="column" height={screenHeight} paddingX={2} paddingY={1}>
			<Text bold>{title}</Text>
			<Box flexGrow={1} flexDirection="column" marginTop={1}>
				{children}
			</Box>
			{actions.length > 0 && (
				<Box marginTop={1}>
					<ActionBar actions={actions} />
				</Box>
			)}
		</Box>
	);
}
