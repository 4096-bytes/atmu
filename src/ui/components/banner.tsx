import {Box, Text} from 'ink';

const bannerLines = [
	'  ,---. ,--------.,--.   ,--.,--. ,--. ',
	" /  O  \\'--.  .--'|   `.'   ||  | |  | ",
	"|  .-.  |  |  |   |  |'.'|  ||  | |  | ",
	"|  | |  |  |  |   |  |   |  |'  '-'  ' ",
	"`--' `--'  `--'   `--'   `--' `-----'  ",
];

type Properties = {
	readonly version: string;
	readonly statusText?: string;
};

export function Banner({version, statusText}: Properties) {
	const lines = [
		...bannerLines,
		'',
		`v${version}`,
		'Powered by 4096-bytes',
		...(statusText ? ['', statusText] : []),
	];

	return (
		<Box flexDirection="column">
			<Text>{lines.join('\n')}</Text>
		</Box>
	);
}
