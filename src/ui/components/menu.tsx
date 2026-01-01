import {Select} from '@inkjs/ui';
import type {MenuId, MenuItem} from '../../types/menu.js';

type Properties = {
	readonly isDisabled?: boolean;
	readonly items: readonly MenuItem[];
	readonly onSelect: (id: MenuId) => void;
};

export function Menu({isDisabled = false, items, onSelect}: Properties) {
	const options = items.map(item => ({label: item.label, value: item.id}));

	return (
		<Select
			isDisabled={isDisabled}
			visibleOptionCount={options.length}
			options={options}
			onChange={value => {
				onSelect(value);
			}}
		/>
	);
}
