import {Box, type BoxProps} from 'ink';
import type {ReactNode} from 'react';
import {
	panelBorderStyle,
	panelPaddingX,
	panelPaddingY,
} from '../theme/tokens.js';

type Properties = Omit<BoxProps, 'borderStyle' | 'paddingX' | 'paddingY'> & {
	readonly children: ReactNode;
};

export function Panel({children, ...boxProperties}: Properties) {
	return (
		<Box
			borderStyle={panelBorderStyle}
			paddingX={panelPaddingX}
			paddingY={panelPaddingY}
			{...boxProperties}
		>
			{children}
		</Box>
	);
}
