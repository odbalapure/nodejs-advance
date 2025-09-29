import fs from 'fs';
import http from 'http';

const fileName = 'sample.mp4';

http
    .createServer((_, res) => {
        res.writeHead(200, { 'content-type': 'video/mp4' });
        fs.createReadStream(fileName).pipe(res).on('error', console.error);
    })
    .listen(3000, () => {
        console.log('Stream server started at port 3000');
    });
