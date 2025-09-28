import { Readable } from 'stream';

const rivers = [
    'Amazon',
    'Nile',
    'Mississipi',
    'Ganga',
    'Danube',
    'Mekong'
];

// Readable stream: reads data from a source and feeds it into the pipe of the stream bit-by-bit.
// `Streams` implement the `EvenEmitter`, so we can listen to events on a read stream.
// This is stream class that implements Readalbe stream that feeds it to anyone who is listening to it, chunk by chunk.
class ArrayStream extends Readable {
    constructor(array) {
        // The chunks are by default in the binary mode
        // To read it as string use `super({encoding: 'utf-8'})`
        // super({ encoding: 'utf-8' })
        // To pass objects into the stream use super({objectEncoding: true})
        // NOTE: An ex
        super({ objectMode: true })
        this.array = array;
        this.index = 0;
    }

    _read() {
        if (this.index <= this.array.length) {
            // const chunk = this.array[this.index];
            const chunk = {
                data: this.array[this.index],
                index: this.index
            };
            this.push(chunk);
            this.index += 1;
        } else {
            this.push(null);
        }
    }
}

const riverStream = new ArrayStream(rivers);

riverStream
    .on('data', (chunk) => console.log(chunk));

riverStream
    .on('end', () => console.log('Stream ended!'));
