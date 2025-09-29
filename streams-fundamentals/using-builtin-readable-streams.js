import { createReadStream } from 'fs';

// ** Streaming video using `createReadStream`
const readStream = createReadStream('sample.mp4');

// NOTE: Streams start in 'paused mode' by default
// Attaching 'data' switches the stream to flowing mode
readStream
    .on('data', (chunk) => console.log('🔖 Reading chunk:\n', chunk));
readStream
    .on('end', () => console.log('✅ Stream ended!'));
readStream
    .on('error', (error) => console.log(error.message));

// Creates a non flowing mode stream; it will ask for each chunk of data
readStream.pause();

// NOTE: This will read one chunk, for every input on the STDIN/terminal even for an `ENTER`
process.stdin.on('data', (chunk) => {
    if (chunk.toString().trim() === 'exit') {
        // NOTE: `pause()` stops the stream from emitting 'data' events. It does not buffer endlessly.
        process.stdin.pause();
    }

    if (chunk.toString().trim() === 'resume') {
        readStream.resume();
    }
    readStream.read();
});
