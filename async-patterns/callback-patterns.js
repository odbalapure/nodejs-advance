import { readFile } from 'fs';

// 1. Callback is always the last arugment
// 2. Error always comes first
function readConfig(filePath, options, callback) {
    readFile(filePath, 'utf-8', (err, data) => {
        if (err) return callback(err);
        callback(null, data.trim());
    });
}

// 3. Propogating errors in CPS
// In synchronous code we generally throw errors, eg: `throw new Error('Something went wrong');`
// But with async code its recommended to propogate or pass the error to callbacks instead of throwing it
function parseJsonFile(filename, callback) {
    readFile(filename, 'utf-8', (err, content) => {
        if (err) {
            // pass the error forward, do nothing else
            return callback(err);
        }

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (parseError) {
            return callback(parseError);
        }

        // no errors; so pass `null`
        callback(null, parsed);
    });
}

// 4. Uncaught exceptions in async code
// This can throw `SyntaxError: Unexpected token at JSON.parse`
function parseJonsLater(filename, callback) {
    readFile(filename, 'utf-8', (err, text) => {
        if (err) return callback(err);
        // We didn't wrap the JSON.prase in try/catch
        callback(null, JSON.parse(text));
    });
}

// We can execute some code when an 'uncaughtException' is encounterd
process.on('uncaughtException', (err) => {
    console.log('Caught exception before exit:', err);
    // non zero code to indicate failure
    process.exit(1);
});
