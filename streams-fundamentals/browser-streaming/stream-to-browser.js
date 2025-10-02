import { stat, createReadStream } from 'fs';
import { createServer } from 'http';
import { promisify } from 'util';

const fileName = 'sample.mp4';
const fileInfo = promisify(stat);

// ** Simple HTTP server that does not use streams
// createServer((_, res) => {
//     fs.readFile(file, (error, data) => {
//         if (error) {
//             res.writeHead(500, { 'Content-Type': 'text/plain' });
//             res.end('Internal server error');
//             return;
//         }

//         res.writeHead(200, { 'Content-Type': 'video/mp4' });
//         res.end(data);
//     });
// }).listen(3000, () => console.log('Buffered server running at port 3000'));

// ** Streaming a video
// NOTE: Loading a video w/o controls or preload="auto" so it does not initate range rqeuest immediately
// The browser may not send range request initially and just download the entire video
createServer(async (req, res) => {
    // We need to use `promisify` as `stats` uses callback style and needs to be converted to a promise
    // Like other Node.js functions for R/W file, start server etc.
    const { size } = await fileInfo(fileName);
    const range = req.headers.range;

    if (range) {
        let [start, end] = range.replace(/bytes=/, "").split("-");
        start = parseInt(start);
        end = end ? parseInt(end) : size - 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'video/mp4',
        });
        createReadStream(fileName, { start, end }).pipe(res);
    } else {
        console.log('No range', range);
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': "video/mp4"
        });
        createReadStream(fileName).pipe(res);
    }
}).listen(3000, () => console.log("server is running on 3000"));
