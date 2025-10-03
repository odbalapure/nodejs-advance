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

## PM2

Node.js cluster module allows us to utilize multiple CPU cores; PM2 is a production process manager that builds on top of that and provides more features like -- mointoring, auto restarts, zero downtime deployments, log management.

Its a popular production process manager for Node. It provides features for mangaging, monitoring, keeping applications alive forever with zero downtime reloads.

### What cluster does?

`cluster` module allows to create child processes/workers that share the same server port. This helps scale single Node.js app across multiple CPU cores, which is crucial since Node.js is single threaded by default.

Pros:
- Simple built in API to fork workers
- Shared port binding for load balancing
- Full control over how workers are spawned and managed

Cons:
- Write logic for restarting dead workers, logging, monitoring
- No process monitoring, no logs handling, no CPU/memory tracking
- No ecosystem tools -- graceful reloads or zero downtime deploys

### What PM2 does

PM2 is a production process manager but adds more functionality.

| Feature                    | Cluster Module  | PM2 |
| -------------------------- | --------------  | --- |
| Multi-core load balancing  | ✅              | ✅   |
| Auto-restart on crash      | ❌ (manual)     | ✅   |
| CPU/memory monitoring      | ❌              | ✅   |
| Process logs management    | ❌              | ✅   |
| Graceful reload            | ❌              | ✅   |
| Zero-downtime deploys      | ❌              | ✅   |
| CLI and Dashboard          | ❌              | ✅   |
| JSON process config        | ❌              | ✅   |
| Built-in cluster mode      | ✅              | ✅   |
| Docker & ecosystem support | ❌              | ✅   |

### When to use **cluster**

- Want full low level control and building a custom process manager
- The deploy env. already manages process monitoring (eg: k8)

### When to use **PM2**

- Tested solution for production
- Use monitoring, restrating, scaling
- Easily deploy, reload, debug app in production

> `cluster` is powerful but `PM2` is practical. `cluster` is like an engine, PM2 is a full car.

#### Create instances

```sh
ombalapure@Oms-MacBook-Air performance-scalability % pm2 process-pool.js ;5B-i 3
ombalapure@Oms-MacBook-Air performance-scalability % pm2 start process-pool.js -i 3
[PM2] Starting /Users/ombalapure/Desktop/VSCode/advance-nodejs/performance-scalability/process-pool.js in cluster_mode (3 instances)
[PM2] Done.
┌────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ process-pool    │ default     │ 1.0.0   │ cluster │ 76054    │ 0s     │ 0    │ online    │ 0%       │ 54.8mb   │ omb… │ disabled │
│ 1  │ process-pool    │ default     │ 1.0.0   │ cluster │ 76055    │ 0s     │ 0    │ online    │ 0%       │ 54.3mb   │ omb… │ disabled │
│ 2  │ process-pool    │ default     │ 1.0.0   │ cluster │ 76056    │ 0s     │ 0    │ online    │ 0%       │ 46.3mb   │ omb… │ disabled │
└────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

- `-i` flag stands for instances; used to specify the no. of instances to start the app.
- `max` to use all the available CPU cores.

#### Stop all instances

```sh
ombalapure@Oms-MacBook-Air performance-scalability % pm2 stop all                 
[PM2] Applying action stopProcessId on app [all](ids: [ 0, 1, 2, 3 ])
[PM2] [process-pool](0) ✓
[PM2] [process-pool](1) ✓
[PM2] [process-pool](2) ✓
[PM2] [joke-server](3) ✓
┌────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 3  │ joke-server     │ default     │ 1.0.0   │ fork    │ 0        │ 0      │ 30   │ stopped   │ 0%       │ 0b       │ omb… │ disabled │
│ 0  │ process-pool    │ default     │ 1.0.0   │ cluster │ 0        │ 0      │ 5    │ stopped   │ 0%       │ 0b       │ omb… │ disabled │
│ 1  │ process-pool    │ default     │ 1.0.0   │ cluster │ 0        │ 0      │ 5    │ stopped   │ 0%       │ 0b       │ omb… │ disabled │
│ 2  │ process-pool    │ default     │ 1.0.0   │ cluster │ 0        │ 0      │ 4    │ stopped   │ 0%       │ 0b       │ omb… │ disabled │
└────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

#### List all instances

```sh
ombalapure@Oms-MacBook-Air performance-scalability % pm2 list
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 3  │ joke-server        │ fork     │ 30   │ online    │ 0%       │ 56.1mb   │
│ 0  │ process-pool       │ cluster  │ 5    │ stopped   │ 0%       │ 0b       │
│ 1  │ process-pool       │ cluster  │ 5    │ stopped   │ 0%       │ 0b       │
│ 2  │ process-pool       │ cluster  │ 4    │ stopped   │ 0%       │ 0b       │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

#### Mointor process

```sh
pm2 monit
```

This will list the process list, server logs, custom metrics (heap size, heap usage, event loop latency etc.), metadata (app name, restarts, script path, uptime etc.)

#### Apply updates to already running instances

```sh
pm2 reload app-name
```

This will apply the changes without stopping the instances. The changes will be applied gradually to all the instances. 