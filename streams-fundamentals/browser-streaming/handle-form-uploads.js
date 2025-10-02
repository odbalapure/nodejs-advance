const { createReadStream, stat, createWriteStream } = require('fs');
const { createServer } = require('http');
const { promisify } = require('util');
const multiparty = require('multiparty');

const filename = '../sample.mp4';
const fileInfo = promisify(stat);

const responseWithVideoStream = async (req, res) => {
    const { size } = await fileInfo(filename);
    console.log('size', size);
    const range = req.headers.range;

    if (range) {
        let [start, end] = range.replace(/bytes=/, '').split('-');
        start = parseInt(start);
        end = end ? parseInt(end) : size - 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'video/mp4',
            'Cache-Control': 'no-cache'
        });

        createReadStream(filename, { start, end }).pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes'
        });

        createReadStream(filename).pipe(res);
    }
}

createServer(async (req, res) => {
    if (req.method === 'POST') {
        // Echo back to client
        // req.pipe(res);
        // Save the file on app server
        // NOTE: This browser sends the file wrapped in `multipart` form-data format, not as raw binary data
        // req.pipe(createWriteStream('uploaded-sample.mp4'));

        // `multiparty` used to extract actual file content
        const form = new multiparty.Form();
        // Give access to inputs and files as part of the form
        // There are 3 encoding types:
        // 1. `application/x-www-form-urlencoded` (default)
        // Used for text data, simple form fields
        //
        // 2. `multipart/form-data`
        // Used for file uploads, binary data format
        //
        // 3. `text/plain`
        // Rarely used, mainly for debugging
        form.on('part', (part) => {
            part.pipe(createWriteStream(`${part.filename}`)).on('close', () => {
                res.writeHead(200, { 'content-type': 'text/html' });
                res.end(`<h1>${part.filename} uploaded ✅</h1>`);
            });
        });
        form.parse(req);
    } else if (req.url === '/video') {
        responseWithVideoStream(req, res);
    } else {
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        res.end(`
            <form enctype='multipart/form-data' method='POST' action='/'>
                <input type='file' name='upload-file' />
                <button>Upload</button>
            </form>
        `);
    }
}).listen(3000, () => {
    console.log('Started listening at port 3000');
});
