// A promise is an object, that represents the eventual completion of async task/operations
// Another way of dealing with async code instead of just callbacks

// Both are unary functions, take 'one param' of any type; for `reject` an `Error` is preffered
// We can pass more but they will be ignored
// Call resolve(value) -> the promise is fulfilled
// Call reject(value) -> the promise is rejected
// NOTE: Success/failure is not about arguments, its entirely about whethe we call resolve/reject

const wait = (seconds) => new Promise((resolve, reject) => {
    if (seconds < 0 || typeof seconds !== 'number') {
        reject(new Error('Seconds must be +ve'));
        return;
    }

    setTimeout(() => resolve(`Waited for ${seconds}s`), seconds);
});

wait(2)
    .then(console.log)
    .catch((error) => console.log(error.message));

wait(-2)
    .then(console.log)
    .catch((error) => console.log(error.message));

const waitClearTimer = (seconds) => {
    if (seconds < 0 || typeof seconds !== 'number') {
        // Immediately returns `rejected` promise
        // No async logic is run; rejected right away
        return Promise.reject(new Error('Seconds must be +ve'));
    }

    let timerId;
    const promise = new Promise((resolve) => {
        timerId = setTimeout(() => resolve(`Waited for ${seconds}s`), seconds * 1000);
    });

    return {
        promise,
        cancel: () => clearTimeout(timerId)
    }
}

const timer = waitClearTimer(2);
timer.promise.then(console.log).catch(console.error);
// timer.cancel();
