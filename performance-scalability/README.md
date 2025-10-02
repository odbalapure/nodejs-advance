# Performance

## Scaling strategies

1. Horizontal duplication - creating replicas of the server
2. Functional decomposition - scaling the app on Y axis - breaks into smaller components/services based on functionality
split into different services; eg: payments, inventory, user services.
3. Data partition - partition data or users across servers.

## Forking

Creating multiple instances of the same app/server.
One simple way is - to start the server on different ports.

```javascript
const { fork } = require('child_process');

const process = [
    forK('joke-server', ['3001']),
    forK('joke-server', ['3002']),
    forK('joke-server', ['3003']),
];
```

`fork` does not gurantee that our server instances run on each CPU core. So we must use the `cluster` module

```javascript
const cpus = require('os').cpus();
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
```

> This will start multiple instances of the node server `on the same port 3000` on different CPU cores.

### Load test

Install the `loadtest` npm package to load test our cluster.

```sh
ombalapure@Oms-MacBook-Air ~ % loadtest -n 400 http://localhost:3000
(node:60277) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60280) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60281) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60279) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60278) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

Target URL:          http://localhost:3000
Max requests:        400
Concurrent clients:  40
Running on cores:    4
Agent:               none

Completed requests:  400
Total errors:        0
Total time:          0.133 s
Mean latency:        10 ms
Effective rps:       3008

Percentage of requests served within a certain time
  50%      6 ms
  90%      27 ms
  95%      30 ms
  99%      51 ms
 100%      54 ms (longest request)
```
