import {Select} from '@inkjs/ui';
import {useCallback, useMemo} from 'react';
import type {MenuId, MenuItem} from '../../types/menu.js';

type Properties = {
	readonly isDisabled?: boolean;
	readonly items: readonly MenuItem[];
	readonly onSelect: (id: MenuId) => void;
};

export function Menu({isDisabled = false, items, onSelect}: Properties) {
	const options = useMemo(
		() => items.map(item => ({label: item.label, value: item.id})),
		[items],
	);

	const handleChange = useCallback(
		(value: MenuId) => {
			onSelect(value);
		},
		[onSelect],
	);

	return (
		<Select
			isDisabled={isDisabled}
			visibleOptionCount={options.length}
			options={options}
			onChange={handleChange}
		/>
	);
}
