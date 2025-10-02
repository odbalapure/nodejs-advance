// `fork` does not gurantee that our server instances run on each CPU core
// Hence its better to use the `cluster` module
// Master process (CPU core)
// \_ Worker process (CPU Core)
// \_ Worker process (CPU Core)
// \_ Worker process (CPU Core)

// `cluster` is group of node instances that work together
// talk to each other via a maste process
// the main process contorls the worker processes

const cpus = require('os').cpus();
// [
//   {
//     model: 'Apple M2',
//     speed: 2400,
//     times: { user: 5793760, nice: 0, sys: 3450610, idle: 39981020, irq: 0 }
//   },
//   {
//     model: 'Apple M2',
//     speed: 2400,
//     times: { user: 5413310, nice: 0, sys: 2916000, idle: 40919720, irq: 0 }
//   },
//   ... Rest of the cores
// ]
// console.log(cpus.length);
const cluster = require('cluster');
const { createServer } = require('http');

if (cluster.isMaster) {
    console.log(`Running on master process ${process.pid} 👑`,);
    for (let i = 0; i < cpus.length; i++) {
        cluster.fork();
    }
} else {
    createServer((_, res) => {
        console.log(`This is a worker process ${process.pid} 🧑🏻‍🔧`);

        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(`This is a worker process ${process.pid} 🧑🏻‍🔧`);
    }).listen(3000, () => {
        console.log('Started at port 3000');
    });
}
