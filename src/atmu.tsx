#!/usr/bin/env node
import process from 'node:process';
import Pastel from 'pastel';
import {filterArgv} from './utils/argv.js';

const app = new Pastel({
	importMeta: import.meta,
});

await app.run(filterArgv(process.argv));
