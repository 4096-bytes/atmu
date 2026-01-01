export const waitForText = async (lastFrame, text, {timeoutMs = 2000} = {}) => {
	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		const output = lastFrame() ?? '';
		if (output.includes(text)) {
			return output;
		}

		// Allow Ink to flush updates.
		// eslint-disable-next-line no-await-in-loop
		await new Promise(resolve => {
			setTimeout(resolve, 10);
		});
	}

	const output = lastFrame() ?? '';
	throw new Error(`Timed out waiting for "${text}". Last frame:\n\n${output}`);
};
