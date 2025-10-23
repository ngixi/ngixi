# Wasmer in Zig

## Contents

- [[README|Ngixi WebAssembly Guide]]
- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

## On This Page

- [[Wasmer in Zig#Scopes and Terminology|Scopes and Terminology]]
- [[Wasmer in Zig#Execution Modes|Execution Modes]]
- [[Wasmer in Zig#Zig Binding Layout|Zig Binding Layout]]
- [[Wasmer in Zig#Instantiation Pipeline|Instantiation Pipeline]]
- [[Wasmer in Zig#Memory and Host Interaction|Memory and Host Interaction]]
- [[Wasmer in Zig#Configuring WASI and WASIX|Configuring WASI and WASIX]]
- [[Wasmer in Zig#Diagnostics and Tooling|Diagnostics and Tooling]]
- [[Wasmer in Zig#Ngixi Integration Patterns|Ngixi Integration Patterns]]

## Scopes and Terminology

- **Engine**: Compiles Wasm to native code. Wasmer ships Cranelift (balanced), LLVM (maximum optimisation), and Singlepass (fast compile). Switch engines via `wasmer.Engine.initWithConfig` once the Zig bindings expose configuration helpers.
- **Store**: Owns compiled artifacts and instance state. Create a store per logical execution context. Stores are not thread-safe; guard them when crossing threads.
- **Module**: Compiled Wasm bytecode. Modules are reusable; instantiate them multiple times with different imports or memories.
- **Instance**: A module bound to imports. Instances contain function, memory, table exports.
- **Imports**: Functions, memories, tables, globals provided by the host. Use `wasmer.Imports` to bundle them.
- **Exports**: Items exposed by the guest and retrieved via `instance.exports.getFunction`, `getMemory`, etc.

## Execution Modes

- **JIT (default)**: Compiles on first instantiation inside the running process. Ideal for dynamic modules; Ngixi's current bootstrapping takes this path.
- **AOT**: Use `wasmer compile module.wasm -o module.so` to precompile. Load via Wasmer APIs to save startup time. Zig bindings can load object files once you plumb the API through.
- **Headless compilation**: Compile modules in a build step and serialize the artifact using `wasmer.Module.serialize`. Cache the bytes to disk (`wasmer.Cache`) for reuse across runs.

## Zig Binding Layout

The vendored Wasmer Zig API (`modules/wasmer-zig-api/`) mirrors the C API.

- `src/wasmer.zig`: Core types (`Engine`, `Store`, `Module`, `Instance`, `Memory`, `Imports`).
- `src/wasi.zig`: Helpers for constructing WASI environments (arguments, env vars, dirs, stdio).
- `examples/*.zig`: Recipes for instantiation, working with memories, and exporting host functions.

Update strategy: align the vendored bindings with upstream Wasmer releases; check `build.zig.zon` for version constraints.

## Instantiation Pipeline

1. **Load bytes**: Read `.wasm` from disk or embed in the binary using Zig's `@embedFile`.
2. **Module::init**: Compile with the chosen engine.
3. **Imports**: Start with WASI (preview 1 or 2) or WASIX imports using helper builders.
4. **Custom host functions**: Create `wasmer.Function` values and add them to the import object (see `modules/ngixi/host.zig`).
5. **Instance::init**: Instantiate with store, module, imports.
6. **Entrypoint**: Fetch `_start` or other functions via `instance.exports.getFunction("name")` and call.

Use `defer` liberally to deallocate each handle (`deinit`). Wasmer uses reference counting under the hood; ensure Zig's lifetime mirrors guest usage.

## Memory and Host Interaction

- **Shared memory**: Grab the guest memory handle via `instance.exports.getMemory("memory")`. Keep a pointer to read or write guest buffers.
- **Slicing helpers**: Extend `host.zig` with utilities that translate `(ptr, len)` from guest arguments into Zig slices. Always bounds-check against `memory.dataLen()`.
- **Borrow rules**: Memory remains valid while the instance is alive. If the guest calls `memory.grow`, previously captured pointers may become invalid; re-query base pointers after host calls that might grow memory.
- **Pass-by-reference**: For large data, allocate host-side buffers and write them into guest memory before calling exported functions.

## Configuring WASI and WASIX

- **WASI Preview 1**: Use `wasmer.WasiConfig` to set args, env, preopened dirs, stdio. Attach config to a store via `wasmer.Wasi.init` and then convert to imports.
- **WASI Preview 2 / Component model**: Experimental. Requires component-compiled modules and the `wasmer-component` API. Track Wasmer releases for stabilized Zig bindings.
- **WASIX**: Augments preview 1 with POSIX-like calls. Enable by importing from the `wasix` namespace using Wasmer's WASIX environment builder. Combine with preview 1 when instantiating compatible modules.
- **Feature flags**: Wasmer allows toggling `SIMD`, `threads`, `bulk-memory`, `reference-types` per engine. Use `wasmer.EngineConfig` once exposed.

## Diagnostics and Tooling

- `wasmer inspect module.wasm`: List imports/exports, required features.
- `wasmer run module.wasm --invoke name`: Ad hoc function invocation for smoke testing guest code.
- `WASMER_BACKTRACE=1`: Environment variable enabling stack traces when guest traps.
- `WASMER_BACKTRACE_DETAILS=1`: Adds instruction offsets and code snippets.
- **Tracing**: Enable `wasmer.RuntimeTracing` to collect timing and memory stats (requires building Wasmer with tracing enabled).

## Ngixi Integration Patterns

- **Engine lifecycle**: Initialize a single engine per process; reuse across stores to amortize compilation caches.
- **Store pools**: For concurrent requests, maintain a pool of stores preloaded with modules to reduce latency.
- **Host module registry**: Extend `host.zig` with registrars (e.g., `registerHttp`, `registerKv`) that add function groups. Compose them based on a module's declared needs.
- **Import manifests**: Parse guest-provided metadata (e.g., JSON) to decide which host capabilities to wire before instantiation.
- **Error handling**: Wrap Wasmer errors with contextual data (module name, function, params) to aid debugging.
- **Testing**: Write Zig tests that instantiate fixture modules with deterministic outputs. Use `std.testing` harness to assert on memory contents or return values.

Embedding Wasmer effectively in Ngixi means mastering these primitives and wiring them with the project's host capability goals.
