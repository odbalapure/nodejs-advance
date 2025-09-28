import { readdir, writeFile } from 'fs';
import { promisify } from 'util';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const writeFilePromisify = promisify(writeFile);
const readdirPromisify = promisify(readdir);

Promise.all([
    writeFilePromisify('one.txt', 'Writing to one.txt'),
    writeFilePromisify('two.txt', 'Writing to two.txt'),
    writeFilePromisify('three.txt', 'Writing to three.txt'),
])
    // .then(() => readdir(__dirname)) // `__dirname` is NA for `ESModules`
    .then(() => readdirPromisify(dirname(fileURLToPath(import.meta.url))))
    .then(console.log)


const wait = (second) =>
    new Promise((res) => {
        setTimeout(() => res(`Waited for ${second}s.`), 1000 * second);
    });

// NOTE: `race` cares for any one of the `resolved` or `rejected` promise
Promise.all([
    wait(1),
    wait(2),
    wait(3)
])
    .then(console.log); // [ 'Waited for 1s.', 'Waited for 2s.', 'Waited for 3s.' ]

// NOTE: `any` cares for the any one of the `resolved` promise
Promise.any([
    wait(1),
    wait(2),
    wait(3)
])
    .then(console.log);
