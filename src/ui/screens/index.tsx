import {Box} from 'ink';
import type {ReactNode} from 'react';
import type {MenuId, MenuItem} from '../../types/menu.js';
import {Panel} from '../layout/panel.js';
import {Banner} from '../components/banner.js';
import {Menu} from '../components/menu.js';

type Properties = {
	readonly environmentStatus?: ReactNode;
	readonly isMenuDisabled?: boolean;
	readonly menuKey?: string;
	readonly menuItems: readonly MenuItem[];
	readonly onSelectMenu: (id: MenuId) => void;
	readonly statusText?: string;
	readonly version: string;
};

export function IndexScreen({
	environmentStatus,
	isMenuDisabled = false,
	menuKey,
	menuItems,
	onSelectMenu,
	statusText,
	version,
}: Properties) {
	return (
		<Box flexDirection="column" gap={1}>
			<Panel alignSelf="flex-start">
				<Banner version={version} statusText={statusText} />
			</Panel>
			{environmentStatus}
			<Menu
				key={menuKey}
				isDisabled={isMenuDisabled}
				items={menuItems}
				onSelect={onSelectMenu}
			/>
		</Box>
	);
}
