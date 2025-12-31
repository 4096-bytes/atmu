import {Box} from 'ink';
import type {MenuId, MenuItem} from '../../types/menu.js';
import {Panel} from '../layout/panel.js';
import {Banner} from '../components/banner.js';
import {Menu} from '../components/menu.js';

type Properties = {
	readonly isMenuDisabled?: boolean;
	readonly menuItems: readonly MenuItem[];
	readonly onSelectMenu: (id: MenuId) => void;
	readonly statusText?: string;
	readonly version: string;
};

export function IndexScreen({
	isMenuDisabled = false,
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
			<Menu
				isDisabled={isMenuDisabled}
				items={menuItems}
				onSelect={onSelectMenu}
			/>
		</Box>
	);
}
