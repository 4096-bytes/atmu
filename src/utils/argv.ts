const passthroughArguments = new Set(['-h', '--help', '-v', '--version']);

export function filterArgv(argv: readonly string[]): string[] {
	if (argv.length <= 2) {
		return [...argv];
	}

	const filtered = argv.slice(0, 2);

	for (const argument of argv.slice(2)) {
		if (passthroughArguments.has(argument)) {
			filtered.push(argument);
		}
	}

	return filtered;
}
