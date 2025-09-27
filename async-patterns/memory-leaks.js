import { CsvSearcher } from './observable-objects.js';

const search = new CsvSearcher('Alice')
    .addFile('customer.csv')
    .search();

const fileReadListener = (file) => console.log(`File read: ${file}`);
const recordFoundListener = (file, lineNumber) =>
    console.log(`Record found in ${file} at line ${lineNumber}`);
const errorListener = (error, file) =>
    console.error(`Error reading ${file}:`, error.message);

// Unused listener uses up memory
// If the listener is alive the large objects and data structures inside it are not garbage collected.
// A leak happens when a memory no longer needed, isn't freed
// The app can run out of memory or crash
search
    .on('fileRead', fileReadListener)
    .on('recordFound', recordFoundListener)
    .on('error', errorListener);

// Remove listeners after some time to allow async operations to complete
// We can either use a timer or use `readFileSync`
const timer = setTimeout(() => {
    console.log('🧹 Cleaning up listeners...');
    search.off('fileRead', fileReadListener);
    search.off('recordFound', recordFoundListener);
    search.off('error', errorListener);
}, 1000);

clearInterval(timer);
