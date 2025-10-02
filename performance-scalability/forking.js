const { fork } = require('child_process');

// `fork` creates a new process
// OS decides which process to run the server based on its own scheudling
// It may/not run on different CPU cores depending on how OS schedules them
// NOTE: Its better to use the `cluster` module for creating the multiple instances
const process = [
    fork('joke-server', ['3001']),
    fork('joke-server', ['3002']),
    fork('joke-server', ['3003']),
];

console.log(`Forked ${process.length} processes`);
