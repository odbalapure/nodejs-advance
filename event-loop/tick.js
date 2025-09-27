import fs from 'fs';
import { fileURLToPath } from 'url';

function printFileSize(fileName, cb) {
    if (typeof fileName !== 'string') {
        // return cb(new TypeError('fileName must be of type string'));
        return process.nextTick(cb, new TypeError('fileName must be of type string'))
    }

    fs.stat(fileName, (err, stats) => {
        if (err) return cb(err);

        cb(null, stats.size);
    });
}

const fileName = fileURLToPath(import.meta.url);
printFileSize(fileName, (err, size) => {
    if (err) throw err;

    console.log(`File size: ${size}KB`);
});

// This line runs first if everything goes well
// But if the `typeof` validation fails, this line won't run
// Use a `nextTick` and pass the callback and error to it.
// This way the flow of execution won't break
console.log('👋 Bye');
