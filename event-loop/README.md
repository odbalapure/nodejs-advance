# Event loop

### Call stack

* It’s a **stack data structure** that keeps track of active function execution contexts.
* Functions are **pushed** onto the stack when called, and **popped** when they return.

### Event loop

* The **event loop** monitors the call stack and the queues (callback/microtask/etc).
* When the call stack is empty, the event loop takes the next callback from the appropriate queue and pushes it onto the stack for execution.
* This is how async callbacks eventually run after their delay or I/O finishes.

### Node.js & the event loop

* The event loop itself is part of **libuv** (a C library), not Node.js directly.
* Node.js provides APIs (`setTimeout`, `fs.readFile`, `http`, etc.) that register tasks with libuv.
* Once those tasks finish, libuv pushes their callbacks into the appropriate queue, where the event loop picks them up.

### Blocking vs async

* Heavy synchronous code (CPU-bound loops, big JSON parsing, crypto, etc.) blocks the call stack. → The event loop cannot push new work in → app freezes.
* Lots of async work (timers, I/O, promises) doesn’t block the stack, but it can **flood the queues**. → This causes **latency/backpressure** (callbacks wait longer), but the event loop still processes them one by one.

---

### Micro and macro task queue

Microtask callbacks are given higher priority. And `queueMicrotask()` has the highest priority.

**NOTE**: `process.nextTick()` also has high priority amongst the microtask operations but there's a catch - for CJS `process.nextTick() > queueMicrotask()` and for ES syntax its the opposite.

#### Examples of microtask operations:

- `Promise.then()`, `Promise.catch()`, `Promise.finally()`
- `process.nextTick()` (Node.js only)
- `queueMicrotask()`
- `MutationObserver` callbacks (Browser only)
- `async/await` continuation (the code after the `await` is scheduled as a microtask)

#### Examples of macrotask operations:

- `setTimeout()`
- `setInterval()`
- `setImmediate()`
- `fetch()` - callbacks after the the response if received (Browser/Node.js)
- `requestAnimationFrame()` (Browser only)
- `fs.readFile()` (Node.js only)

#### Example #1

```js
setTimeout(() => console.log("timeout"), 0);

fetch("https://example.com")
  .then(() => console.log("fetch then"));

console.log("end");
```

**Possible output:**

```
end
fetch then
timeout
```

⚠️ Caveat:
The `fetch` won’t hit the microtask queue **until the network finishes**. If the timeout fires before the network returns, the timeout callback can actually run first.

So the **general priority** is:

* Microtasks always win over macro-tasks,
* **But only once they’re scheduled.**

#### Example #2

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

**Output:**

```
A
D
C
B
```

* `"A"` → sync, runs immediately.
* `"D"` → sync, runs immediately.
* Promise `.then` → goes to micro-task queue.
* `setTimeout` callback → goes to macro-task queue.
* After stack is empty:
  * Event loop drains micro-task queue → `"C"`.
  * Then picks macro-task → `"B"`.

### Execution flow

Consider the following example to understand the event loop

```javascript
const slowTask = (a, b) => {
    setTimeout(() => {
        console.log(a + b);
    }, 1000);
}

slowTask(3 , 3);
slowTask(4 , 4);
```

1. **`slowTask(3, 3)` is called**

   * This goes on the call stack.
   * Inside, `setTimeout` is encountered.
   * The `setTimeout` schedules the callback `() => console.log(3+3)` with a timer of 1000ms.
   * Node’s timer API keeps track of this callback in the **timer phase**, not directly the callback queue yet.
   * `slowTask(3, 3)` finishes → popped from the call stack.

2. **`slowTask(4, 4)` is called**

   * Same as above: schedules a callback `() => console.log(8)` for 1000ms.
   * `slowTask(4, 4)` finishes → popped from the call stack.

3. **Call stack is now empty.**

   * Event loop runs.
   * ~1000ms later, the timer phase completes and both scheduled callbacks (`cb1` and `cb2`) get pushed into the **callback queue**.

4. **Event loop checks the queue**

   * Call stack is empty, so it pushes `cb1` first.
   * `console.log(6)` runs, stack clears.
   * Then pushes `cb2`.
   * `console.log(8)` runs.
   * Order is guaranteed here: since both had the same delay, the one scheduled first (`cb1`) fires first.

5. **No more work**

   * Nothing left on the stack or in queues.
   * Program exits.

---

### setTimeout, setImmediate and process.nextTick()

`setImmediate` is a `setTimeout` with _0 ms_ delay but will run before it.

> Recommended to use `setImmediate` to run something on the next tick of the event loop. Its specific to **Node.js**.

`nextTick` is not part of the event loop.

> Be careful using it in a recursion code.

Node.js maintains a separate queue called nextTick queue.

#### What setImmediate is

* `setImmediate` is a Node.js-specific API (not standard in browsers).
* It schedules a callback to run on the “check” phase of Node’s event loop — i.e., after the current poll phase completes.
* It is a macro-task, like setTimeout, but it’s specifically tied to the "check phase".
    - Check phase runs after the poll phase completes.
    - If the poll queue is empty or all I/O callbacks are processed, Node moves to the check phase and executes any `setImmediate` callbacks.
    - If the poll phase has more I/O to process, the check phase may be deferred until the next loop iteration.

> So, `setImmediate` is best used when you want a macro-task that executes immediately after I/O, rather than after a fixed timer.

#### Phases

Node.js uses `libuv`, which implements the event loop with **mulitple phases**. Each phase handles a different type of callback.

| Phase                 | What happens                                                                          | Example callbacks                     |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------- |
| **timers**            | Executes callbacks scheduled by `setTimeout` and `setInterval` whose time has expired | `setTimeout(() => {})`                |
| **pending callbacks** | Executes I/O callbacks that were deferred from the previous loop iteration            | Some TCP errors, certain system calls |
| **idle, prepare**     | Internal phase used by libuv                                                          | N/A                                   |
| **poll**              | Retrieves new I/O events and executes I/O callbacks                                   | `fs.readFile()`, network events       |
| **check**             | Executes callbacks scheduled by `setImmediate()`                                      | `setImmediate(() => {})`              |
| **close callbacks**   | Executes `close` event callbacks                                                      | `socket.on('close', ...)`             |
