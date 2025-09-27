import fs from 'fs';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

fs.readFile(filename, () => {
    setTimeout(() => {
        console.log('setTimeout');
    });
    setImmediate(() => {
        console.log('setImmediate');
    })
});

// NOTE: `process.nextTick()` will run before everything with `cjs` imports
queueMicrotask(() => console.log('⚠️  Microtask callback'));
process.nextTick(() => console.log('⛔️ Process nextTick callback'))
