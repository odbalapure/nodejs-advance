// HTTP module the main server class inherits from EventEmitter too
// So we can also chain `.on()` methods on it
// We can too extend it to make our objects to be an 'event source'

import { EventEmitter } from 'events';
import { readFile } from 'fs';


// Instantiating `EventEmitter` directly, involves composition
// Create observable objects involves inheritance
export class CsvSearcher extends EventEmitter {
    constructor(searchTerm) {
        super();
        this.searchTerm = searchTerm;
        this.files = [];
    }

    addFile(fileName) {
        this.files.push(fileName);
        return this;
    }

    search() {
        for (const file of this.files) {
            readFile(file, 'utf-8', (err, data) => {
                if (err) return this.emit('error', err, file);

                this.emit('fileRead', file);

                const lines = data.trim().split('\n');
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',');
                    const found = row.some((col) => col.includes(this.searchTerm));
                    if (found) {
                        this.emit('recordFound', file, i);
                    }
                }
            });
        }

        return this;
    }
}

// const search = new CsvSearcher('Alice')
//     .addFile('customer.csv')
//     .search();

// search
//     .on('fileRead', (file) => console.log(`File read: ${file}`))
//     .on('recordFound', (file, lineNumber) => console.log(`Record found in ${file} at line ${lineNumber}`))
//     .on('error', (error, file) => console.error(`Error reading ${file}:`, error.message));
