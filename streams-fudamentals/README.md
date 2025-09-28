# Streams basic

## Buffer VS Streams

Buffer:
- Data is loaded entirely in memory
- Suitable for small files

Stream:
- Data is processed in chunks
- Suitable for large files
- Efficient and uses less memory

Consider serving a video file - this is how we would stream a video [using a buffer](./buffer-transfer.js).

### Garbage collection

Run the server using the `--trace_gc` flag. This tells V8 to log every garbage collection event to `stdout`.

We will notice such output in the stdout/terminals:

```sh
[9682:0xb94800000]       58 ms: Scavenge 5.2 (5.8) -> 4.8 (6.8) MB, pooled: 0 MB, 0.92 / 0.00 ms  (average mu = 1.000, current mu = 1.000) allocation failure; 
[9682:0xb94800000]       66 ms: Scavenge 5.6 (7.3) -> 5.4 (8.1) MB, pooled: 0 MB, 0.38 / 0.00 ms  (average mu = 1.000, current mu = 1.000) allocation failure; 
Stream server started at port 3000
[9682:0xb94800000]     1290 ms: Scavenge 6.6 (8.3) -> 6.3 (10.8) MB, pooled: 0 MB, 1.04 / 0.00 ms  (average mu = 1.000, current mu = 1.000) task; 
[9682:0xb94800000]     8188 ms: Mark-Compact (reduce) 6.7 (10.8) -> 6.0 (7.8) MB, pooled: 0 MB, 3.96 / 0.00 ms  (+ 3.7 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 10 ms) (average mu = 0.999, current mu = 0.999) finalize incremental marking via task; GC in old space requested
[9682:0xb94800000]     8791 ms: Mark-Compact (reduce) 6.1 (7.8) -> 6.0 (7.6) MB, pooled: 0 MB, 1.46 / 0.00 ms  (+ 1.3 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 3 ms) (average mu = 0.999, current mu = 0.996) finalize incremental marking via task; GC in old space requested
```

#### 1. Mark sweep
- Its a full garbage collection. It walks the entire heap, marking reachable objects, then sweeping away the rest.
- It pauses Javasript execution as it runs on the main thread.
- We see it more in long lived allocations or memory heavy workloads like the [buffer-transfer.js](./buffer-transfer.js).
- Since buffers can hang out in memory for a while, we should expect full GCs more often.

#### 2. Scavenge
- Its a minor GC that only runs on the young generation (newly allocated objects) in the V8 heap.
- Its cheaper and faster than mark-sweep - most JS objects die young.
- We notice it more in worklaods that create lots of short lived object eg: [stream-transfer.js](./stream-transfer.js), we see lots of scavenge cycles.
- These don't block much as they are quick.

#### 3. Mark compact
- Major GC; follows mark-sweep. After marking, instead of sweeping, it compacts memory by moving objects together.
- Elimates fragmentation; better memory locality.
- Its expensive, since moving objects around means updating all the references.

#### Incremental marking
- A major GC optimization; does marking in small chunks interleaved with program execution.
- Reduces long GC pauses.

#### Idle time
- Opportunistic; runs when V8 detects the event loop is idle.
- Frees up cleanup time, minimize impact on app responsiveness.

#### Concurrent / parallel marking and sweeping
- Newer V8 stuff - reduces pause time further.
- Some marking and sweeping can happen off the main thread (in parallel with JS execution).

#### Generational
- Its a concept not specifc algorithm.
- Heap is split into young and old generation:
    - Young: handled by scavange (fast, frequent)
    - Old: handle by mark-sweep / mark-compact (slow, less frequent)

**TL;DR**
- **Marking = identifying live objects.**
- **Sweep/compact = removing unmarked objects/tidying memory.**
- V8 starts from global objecs, followed by local variables on stack / closure etc. 
-Any object reachable from a root is marked as live. Anything not marked after traversal is considered garbage and elgible for cleanup.
- Incremental / concurrent changes how the marking is scheduled to reduce pauses, not what is marked.

> Marking means traversing the object graph and labelling objects that are still alive. Anything not marked after traversal is considered garbage and elgible for cleanup.
