import { createReadStream, createWriteStream } from 'fs';
// `PassThrough` is a duplex stream
// EventEmitter
//    ↑
// Stream (abstract)
//    ↑
// Readable
//    ↑
// Duplex
//    ↑
// Transform
//    ↑
// PassThrough
import { PassThrough, Duplex } from 'stream';

const readStream = createReadStream('sample.mp4');
const writeStream = createWriteStream('sample-copy.mp4');

// Do some processing before sending from R -> W
// It has both R and W sides
// It does not modify the data
// It implements both the `readable` and `writable` interfaces
// readStream -> reportStream -> writeStream
const report = new PassThrough();

class Throttle extends Duplex {
    constructor(ms) {
        super();
        this.delay = ms;
    }

    _write(chunk, _enconding, callback) {
        //  Throttle
        //     ↓ extends
        // Duplex 
        //     ↓ extends  
        // Transform
        //     ↓ extends
        // Readable (this is where push() is defined!)
        //     ↓ extends
        // Stream
        //     ↓ extends
        // EventEmitter
        this.push(chunk);
        setTimeout(callback, this.delay);
    }

    // Does not need to actively read because data is being fed to it -> `readStream.pipe(throttle)`
    _read() { }

    // No incoming chunks, read stream is done; clear write stream
    _final() {
        this.push(null);
    }
}

const throttle = new Throttle(200);

let size = 0;
report.on('data', (chunk) => {
    size += chunk.length;
    console.log(`Bytes of data: ${size}`);
});

readStream.pipe(throttle).pipe(report).pipe(writeStream);
