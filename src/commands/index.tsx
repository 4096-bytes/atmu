import {useApp} from 'ink';
import {useEffect, useState, type ReactElement} from 'react';
import type {MenuId, MenuItem} from '../types/menu.js';
import {menuExtensions} from '../app/menu/index.js';
import {IndexScreen} from '../ui/screens/index.js';
import {createExitMenuItem} from '../utils/menu.js';
import {getPackageMeta} from '../utils/package-meta.js';

type Properties = {
	readonly homeDirectory?: string;
};

const menuItems: readonly MenuItem[] = [
	...menuExtensions.map(extension => ({
		id: extension.id,
		label: extension.label,
	})),
	createExitMenuItem(),
];

export default function Index({homeDirectory}: Properties = {}): ReactElement {
	const app = useApp();
	const {version} = getPackageMeta();
	const [activeExtensionId, setActiveExtensionId] = useState<
		MenuId | undefined
	>(undefined);
	const [statusText, setStatusText] = useState<string | undefined>();

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

	const handleSelectMenu = (id: MenuId) => {
		if (id === 'exit') {
			app.exit();
			return;
		}

		setActiveExtensionId(id);
	};

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

	return (
		<IndexScreen
			version={version}
			menuItems={menuItems}
			statusText={statusText}
			onSelectMenu={handleSelectMenu}
		/>
	);
}
