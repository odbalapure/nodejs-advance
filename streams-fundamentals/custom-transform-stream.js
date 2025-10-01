import { Transform } from 'stream';

class ChangeText extends Transform {
    constructor(char) {
        super();
        this.replaceChar = char;
    }

    _transform(chunk, _encoding, callback) {
        const transformedChunk =
            chunk.toString().replace(/[a-z]|[A-Z]|[0-9]/g, this.replaceChar);
        this.push(transformedChunk);
        callback();
    }

    _flush(callback) {
        console.log('More chunk of data is being pushed...');
        callback();
    }
}

const smileStream = new ChangeText('✸');

process.stdin.pipe(smileStream).pipe(process.stdout);
