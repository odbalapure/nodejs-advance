import { createReadStream, createWriteStream } from 'fs';

// ** Concise version of 'back-pressure-writeable-stream'
const readStream = createReadStream('sample.mp4');
const writeStream = createWriteStream('sample-copy.mp4');

readStream
    .pipe(writeStream)
    .on('error', console.error)
    .on('finish', () => console.log('Copy complete!'));

// ** Piping terminal input to a text file
// const writeStreamStdin = createWriteStream('stdin.txt');
// process.stdin.pipe(writeStreamStdin);
