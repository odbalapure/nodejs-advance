import fs from 'fs';
import http from 'http';

const file = 'sample.mp4';

http
    .createServer((_, res) => {
        fs.readFile(file, (error, data) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'video/mp4' });
            res.end(data);
        });
    })
    .listen(3000, () => console.log('Buffered server running at port 3000'));
