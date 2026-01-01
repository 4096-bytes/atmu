import type {ReactElement} from 'react';

export type MenuExtensionContext = {
	readonly homeDirectory?: string;
	readonly onDone: () => void;
};

export type MenuExtension = {
	readonly id: string;
	readonly label: string;
	readonly render: (context: MenuExtensionContext) => ReactElement;
	readonly getStatusText?: (
		context: Pick<MenuExtensionContext, 'homeDirectory'>,
	) => Promise<string | undefined>;
};
