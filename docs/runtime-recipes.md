# Runtime Capability Recipes

## Contents

- [[README|Ngixi WebAssembly Guide]]
- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

## On This Page

- [[Runtime Capability Recipes#Logging and Tracing|Logging and Tracing]]
- [[Runtime Capability Recipes#Filesystem Portal|Filesystem Portal]]
- [[Runtime Capability Recipes#HTTP Client Bridge|HTTP Client Bridge]]
- [[Runtime Capability Recipes#Key Value Storage|Key Value Storage]]
- [[Runtime Capability Recipes#Event Streams|Event Streams]]
- [[Runtime Capability Recipes#Security and Sandboxing|Security and Sandboxing]]

## Logging and Tracing

- **Goal**: Provide guests with structured logging while keeping control on the host.
- **Host side**: Implement `registerLog` in `host.zig`, exposing `env.log(ptr: i32, len: i32)`.
- **Guest side**: Wrap the import in AssemblyScript to accept a string. Encourage JSON logs for machine parsing.
- **Tracing**: Add a second import `env.span_begin` returning a handle, and `env.span_end` to produce performance traces.

## Filesystem Portal

- **Preview 1**: Preopen directories with `wasi_config.preopenDir("/data")` and mount them inside the guest.
- **Policy**: Map guest paths to restricted host directories. Deny writes by mounting read-only copies (WASI `rights`) when available.
- **Virtual FS**: Combine with custom imports to simulate a key-value drive (guest reads/writes via RPC, host persists elsewhere).

## HTTP Client Bridge

- **When to use**: Preview 1 lacks native HTTP; wire a host function instead.
- **Host API**: `fn http_request(method_ptr, method_len, url_ptr, url_len, body_ptr, body_len) -> i32 handle` plus follow-up calls to read status and body.
- **State**: Store responses in a Zig-managed map keyed by handles. Provide `http_response_free(handle)` to release.
- **Future**: Migrate to preview 2 `wasi:http` once component tooling is ready.

## Key Value Storage

- **Simple API**: Imports `env.kv_get(key_ptr, key_len, out_ptr)` and `env.kv_set(key_ptr, key_len, value_ptr, value_len)`.
- **Consistency**: Decide between eventual (async dispatch) vs strong (host commits before returning) semantics.
- **Backends**: Start with in-memory HashMap; adapt to Redis, SQLite, or cloud services by translating calls.
- **Security**: Namespaces per module; enforce quotas and TTLs to avoid unbounded usage.

## Event Streams

- **Pattern**: Host maintains a ring buffer in shared memory. Guest calls `env.next_event(ptr, len)` to copy events.
- **Synchronization**: Use atomic flags in shared memory or rely on host-managed indices to avoid locks.
- **Use cases**: Pushing sensor data, job dispatch, or cross-module communication via host arbitration.

## Security and Sandboxing

- **Capability manifests**: Describe allowed imports, directories, network targets per module. Enforce before instantiation.
- **Resource limits**: Configure Wasmer to cap memory pages, fuel (instruction budgets), and stack depth.
- **Observability**: Capture stdout/stderr, Wasmer traps, and host errors. Feed into Ngixi's monitoring.
- **Auditing**: Log import/export wiring and module hashes for reproducibility.

Mix and match these recipes to craft rich host capabilities while preserving the sandbox guarantees that make WebAssembly attractive.
