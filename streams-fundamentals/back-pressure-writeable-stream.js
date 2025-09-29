import { createReadStream, createWriteStream } from 'fs';

// We have streamed an MP4 file, what if we wish to create a copy of it
// This is where we could use `createWriteStream`

const readStream = createReadStream('sample.mp4');
// `highWaterMarke` is the threshold that tells Node.js:
// - Keep writing data to internal buffer until thismany bytes are stores
// - After that stop and wait for the buffer to drain before resuming

// Eg: If we set it as 16 * 1024 (16KB), the stream will buffer upto 16KB before it says - wait, let me flush this befor you give me more
// This means the write stream will buffer ~16KB before applying backpressure

// Why care?
// Too small: Get frequent pauses, more `drain` events, less efficient writes
// Too large: Uses more memory per stream, but can reduce overhead if we're moving big files around
// Default to `16KB` for strings and `64KB` for buffers
const writeStream = createWriteStream('sample-copy.mp4', { highWaterMark: 64 });

readStream.on('data', (chunk) => {
    // Returns a `boolean`; `false` singals that the destination buffer 
    // has hit the `highWaterMark` and can't safely take more without risking memory bloat
    const res = writeStream.write(chunk);
    if (!res) {
        console.log('🔙 Backpressue');
        readStream.pause();
    }
});

readStream.on('error', (error) => console.log(error.message));

readStream.on('end', () => writeStream.end());

// 'drain' event fires when the destination has flushed enough buffered data and is ready to accept more
// We can sfaely call `resume()` and let more chunks flow
writeStream.on('drain', () => {
    console.log('🫗 Drained');
    readStream.resume();
});

// TL;DR
// Backpressure = writeable stream's buffer is full, stop feeding it.
// Drain = writeable has emptied enough buffer, resume feeding.
// **NOTE**: We can only use `readStream.pipe(writeStream)`; pause/resume will be handled under the hood.
writeStream.on('close', () => process.stdout.write('File copied successfully!'));


// NOTE:
// Read and write stream both maintain their own internal buffer.