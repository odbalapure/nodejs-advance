// The observer pattern in classic OOP needs interfaces, classes and heirarchy.
// `EventEmitter` does that for in Node.js where we can attach multiple listeners to an event.
// In other words its like Node's pub-sub system

import { EventEmitter } from 'events';
import { readFile } from 'fs';

function searchRecordInCsv(files, searchTerm) {
    const emitter = new EventEmitter();

    for (const file of files) {
        readFile(file, 'utf-8', (err, data) => {
            // Emit an 'error' event
            if (err) return emitter.emit('error', err, file);

            // Let listeners know CSV file reading is finished
            emitter.emit('fileRead', file);

            // Split into lines
            const lines = data.trim().split('\n');

            // Check record against `searchTerm`
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',');
                const found = row.some((col) => col.includes(searchTerm));
                if (found) {
                    emitter.emit('recordFound', file, i);
                }
            }
        });
    }

    return emitter;
}

searchRecordInCsv(['customer.csv'], 'Alice')
    .on('fileRead', (fileName) => {
        console.log(`Completed reading ${fileName}`);
    })
    .on('recordFound', (fileName, row) => {
        console.log(`Record was found inside ${fileName} on row #${row}`);
    })
    .on('error', (error, fileName) => {
        console.log(`Something went wrong while reading ${fileName}`, error);
    });
