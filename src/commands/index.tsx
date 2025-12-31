import {Text} from 'ink';
import zod from 'zod';

export const options = zod.object({
	name: zod.string().default('Stranger').describe('Name'),
});

type Properties = {
	readonly options: zod.infer<typeof options>;
};

export default function Index({options}: Properties) {
	return (
		<Text>
			Hello, <Text color="green">{options.name}</Text>
		</Text>
	);
}
