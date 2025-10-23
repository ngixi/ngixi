# WebAssembly Primer

## Contents

- [[README|Ngixi WebAssembly Guide]]
- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

## On This Page

- [[WebAssembly Primer#Mental Model|Mental Model]]
- [[WebAssembly Primer#Module Lifecycle|Module Lifecycle]]
- [[WebAssembly Primer#Key Sections and Terms|Key Sections and Terms]]
- [[WebAssembly Primer#Host and Guest Data Exchange|Host and Guest Data Exchange]]
- [[WebAssembly Primer#Compilation Targets for Ngixi|Compilation Targets for Ngixi]]
- [[WebAssembly Primer#Binary Tooling|Binary Tooling]]

## Mental Model

- **Binary format**: Wasm modules are compact binaries containing sections for types, imports, functions, tables, memories, globals, and exports. They are designed for deterministic, sandboxed execution.
- **Execution sandbox**: Modules cannot perform syscalls directly. All side effects must pass through imports (WASI, custom host functions), reinforcing capability-based security.
- **Linear memory**: Guests see a single contiguous byte array (initially 64 KiB pages) that can grow. Typed views (`store<u32>`, `load<u8>`) used in AssemblyScript map to this memory.
- **Stack machine**: The instruction set is stack-based, letting compilers emit predictable code. Each function has well-defined params/results.

## Module Lifecycle

1. **Compilation**: Wasm bytes are decoded and compiled into native code by an engine (e.g. Wasmer's Cranelift).
2. **Instantiation**: Imports are provided, memories initialized, and start functions executed.
3. **Invocation**: Host calls exported functions or triggers `_start` for WASI programs.
4. **Teardown**: Instance resources are dropped; store handles clean up.

## Key Sections & Terms

- **Type section**: Function signatures (params, results).
- **Import section**: Declares dependencies (module name + field name). Example: `"wasi_snapshot_preview1"`, `"fd_write"`.
- **Memory section**: Declares linear memories; most WASI modules rely on a default memory exported as `memory`.
- **Table section**: Holds function references for indirect calls (not used in the basic AssemblyScript example but important for host callbacks).
- **Export section**: Makes functions, memories, globals publicly accessible. `_start` is a conventional export for WASI entrypoints.
- **Start section**: Optional auto-invoked function during instantiation; seldom used alongside `_start`.

## Host and Guest Data Exchange

- **Numbers**: i32, i64, f32, f64 transferred as immediate values.
- **Complex structs**: Represented via pointers into linear memory (`ptr`, `len`). Host reads/writes by offset.
- **Reference types**: Future features (externref, funcref) allow storing host references; Wasmer can bridge these when reference types are enabled.

## Compilation Targets for Ngixi

- **AssemblyScript (TypeScript subset)**: Transpiles to Wasm with strong typing. Works with WASI via decorators for imports.
- **Rust**: `cargo build --target wasm32-wasi` produces WASI binaries. Useful for advanced guest modules requiring crates.
- **C/C++ (wasi-sdk)**: Permits compiling existing portable codebases.

## Binary Tooling

- `wasm-tools inspect module.wasm`: Explore sections.
- `wasmer inspect module.wasm`: Inspect using Wasmer CLI.
- `wasm-objdump -x module.wasm`: Dump sections and symbol info.

Understanding this lifecycle and memory model ensures your host integrations and AssemblyScript code operate predictably when mediated by Wasmer.
