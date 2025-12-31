import {useApp} from 'ink';
import type {MenuId} from '../types/menu.js';
import {IndexScreen} from '../ui/screens/index-screen.js';
import {getMainMenuItems} from '../utils/menu.js';
import {getPackageMeta} from '../utils/package-meta.js';

export default function Index() {
	const app = useApp();
	const {version} = getPackageMeta();
	const menuItems = getMainMenuItems();

	const handleSelectMenu = (id: MenuId) => {
		switch (id) {
			case 'exit': {
				app.exit();
				break;
			}
		}
	};

	return (
		<IndexScreen
			version={version}
			menuItems={menuItems}
			onSelectMenu={handleSelectMenu}
		/>
	);
}
