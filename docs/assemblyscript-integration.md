# AssemblyScript Guest Playbook

## Contents

- [[README|Ngixi WebAssembly Guide]]
- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

## On This Page

- [[AssemblyScript Guest Playbook#Project Structure|Project Structure]]
- [[AssemblyScript Guest Playbook#WASI Preview 1 Interop|WASI Preview 1 Interop]]
- [[AssemblyScript Guest Playbook#Memory Management Patterns|Memory Management Patterns]]
- [[AssemblyScript Guest Playbook#Component Model Preparations|Component Model Preparations]]
- [[AssemblyScript Guest Playbook#Testing and Tooling|Testing and Tooling]]
- [[AssemblyScript Guest Playbook#Checklist for New Modules|Checklist for New Modules]]

## Project Structure

- `modules/wasm/ngixi.ts`: Current sample module. Uses manual extern declarations to call WASI `fd_write` and print a greeting.
- `modules/wasm/wasm-core/assembly/`: AssemblyScript workspace scaffold for larger projects. Contains `assembly/index.ts`, build scripts, and tests.
- `modules/wasm/wasm-core/tests/`: JavaScript-based tests executed with `npm test` to validate guest logic before compilation.

## WASI Preview 1 Interop

- **Declaring imports**: Use `@external("wasi_snapshot_preview1", "fn")` decorators. Provide correct TypeScript signatures matching WASI C prototypes.
- **String handling**: Leverage `String.UTF8.encode` to produce buffers. Always send pointer/length pairs.
- **Iovecs**: Use `memory.data(8)` or `new ArrayBuffer(8)` to allocate memory for structures. Remember to reserve space for out-parameters (`memory.data(4)`).
- **Export design**: Expose both `_start` for CLI programs and custom functions for RPC-style invocation from Zig. Example:

```typescript
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

The host can call this via `instance.exports.getFunction("add")`.

## Memory Management Patterns

- **Arena allocations**: AssemblyScript's runtime uses a bump allocator. Freeing is optional for short-lived modules but use `memory.free` if you enable the full runtime.
- **Passing buffers to host**: Export helper functions such as `export function get_buffer(ptr: usize, len: usize): usize` to share slices. Alternatively, adopt `as-bind` (AssemblyScript library) to manage strings/arrays automatically.
- **Host callbacks**: When host functions call back into AssemblyScript, ensure they respect the runtime's GC expectations (tick the runtime if using reference types).

## Component Model Preparations

- **WIT definitions**: Start modelling interfaces in `.wit` files even if not yet compiling to preview 2. This informs how you shape host capabilities.
- **Bindings**: Watch `componentize-as` (AssemblyScript component toolchain). It will generate wrapper code so your TypeScript functions map to component model exports.
- **Adapters**: While preview 2 adoption matures, consider using adapter modules (`wit-bindgen` generated) to wrap preview 1 functions with higher-level APIs.

## Testing and Tooling

- `npm run asbuild`: Compile AssemblyScript modules using configured `asconfig.json` targets.
- `npm test`: Run guest unit tests (under `modules/wasm/wasm-core/tests/`). Write tests against compiled Wasm using Wasmer's JS API or Node's WASI runtime.
- `wasmer run build/module.wasm --invoke _start`: Smoke test the compiled artifact with actual WASI environment.
- **Debugging**: Use `console.log` equivalents by importing host logging functions. Alternatively, write to WASI stdout and capture via host.

## Checklist for New Modules

- [ ] Define the module's imports (WASI, custom host functions) and document expected capabilities.
- [ ] Export `_start` only if the module behaves like a CLI; otherwise, export explicit entrypoints.
- [ ] Provide helper functions to allocate/deallocate buffers when the host needs to push data into the guest.
- [ ] Write unit tests in AssemblyScript or JS before integrating with Ngixi.
- [ ] Document required WASI snapshot (preview 1, preview 2, WASIX) to avoid mismatched imports.
- [ ] Version the Wasm artifacts and keep them alongside metadata (hash, build options) for reproducibility.

With these patterns, AssemblyScript modules can evolve from simple demos to fully fledged capabilities within Ngixi's Wasmer runtime.
