import { promisify } from 'util';
import { writeFile } from 'fs';

// Implementing the `wait` logic with callbacks
const wait = (seconds, callback) => {
    if (seconds < 0 || typeof seconds !== 'number') {
        callback(new Error(`Must be +ve`));
        return;
    }

    setTimeout(
        () => callback(null, `Waited for ${seconds}s`),
        seconds * 1000
    );
};

wait('2', (error, message) => {
    if (error) {
        console.log(error.message);
        return;
    }

    console.log(message);
});

// `promisify` converts callback functions into promisified functions/objects
// Or convert a function that uses a callback pattern into one that returns a Promise
// Calling a promisified function is clean and readable than callbacks 
const promisifiedWait = promisify(wait);
promisifiedWait(1)
    .then(console.log)
    .catch((error) => console.log(error.message));

const promosifieWriteFile = promisify(writeFile);
promosifieWriteFile('promisified-file.txt', 'Using `promisify` on a `writeFile`.')
    .then()
    .catch((error) => console.log(error.message));
