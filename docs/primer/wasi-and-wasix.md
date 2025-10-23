# WASI and WASIX Deep Dive

## Contents

- [[README|Ngixi WebAssembly Guide]]
- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

## On This Page

- [[WASI and WASIX Deep Dive#Why WASI Exists|Why WASI Exists]]
- [[WASI and WASIX Deep Dive#Preview 1 Snapshot|Preview 1 Snapshot]]
- [[WASI and WASIX Deep Dive#Preview 2 and the Component Model|Preview 2 and the Component Model]]
- [[WASI and WASIX Deep Dive#WASIX Extension Set|WASIX Extension Set]]
- [[WASI and WASIX Deep Dive#Choosing Between Snapshots|Choosing Between Snapshots]]
- [[WASI and WASIX Deep Dive#Ngixi Configuration Playbook|Ngixi Configuration Playbook]]
- [[WASI and WASIX Deep Dive#Future Signals to Watch|Future Signals to Watch]]

## Why WASI Exists

- **Goal**: Provide a portable system interface for Wasm modules so they can perform I/O, filesystem, clocks, and networking in a secure, capability-based manner.
- **Design principles**: Deterministic semantics, sandboxing, modularity, polyglot friendliness.
- **Scope creep control**: WASI evolves through "previews" to avoid locking unstable APIs. Preview 1 targeted POSIX-like workloads; preview 2 embraces the component model for richer interfaces.

## Preview 1 Snapshot

- **Namespace**: Imports live under `"wasi_snapshot_preview1"`.
- **Core syscalls**: `fd_read`, `fd_write`, `path_open`, `args_get`, `environ_get`, `clock_time_get`, `proc_exit`, `random_get`.
- **Data model**: Raw integers, pointers, and POSIX-style structs (iovec, dirent). Guest languages construct binary layouts manually (see `modules/wasm/ngixi.ts`).
- **Strengths**: Stable, widely supported (Wasmer, Wasmtime, browsers via `browser_wasi_shim`).
- **Limitations**: No sockets, limited async story, manual memory layout, coarse-grained handles.
- **Versioning**: Snapshots are versioned by name; preview 1 is effectively v0.1 and frozen.

## Preview 2 and the Component Model

- **Component model**: Adds `*.wit` interface definitions with rich types (records, variants, strings) and handles. Modules become "components" with explicit imports/exports described in WIT.
- **Namespaces**: Example imports include `"wasi:io/streams"`, `"wasi:clocks/monotonic-clock"`, `"wasi:http/outgoing-handler"`.
- **Bindings**: High-level language bindings generated from WIT, eliminating manual pointer plumbing.
- **Transport**: Uses canonical ABI for interoperability between components compiled from different languages.
- **Status**: Experimental in Wasmer (enable component feature). Production readiness depends on toolchain maturity (Rust `wit-bindgen`, JS `componentize-js`, AssemblyScript support in progress).

## WASIX Extension Set

- **Purpose**: Extend preview 1 for POSIX compatibility without waiting for preview 2 stabilization.
- **Key additions**
  - Networking: `sock_open`, `sock_connect`, `sock_recv`, DNS functions.
  - Concurrency: `thread_spawn`, `thread_join`, signals (`sigaction`, `sigprocmask`).
  - Memory: `mmap`, `munmap`, `mprotect` semantics for broader libc support.
  - File descriptors: Extended flag support (`F_SETFL`, non-blocking I/O) and polling APIs resembling `epoll`.
- **Namespaces**: Typically accessed via `"wasix"` module; Wasmer wires them alongside WASI imports when enabled.
- **Compatibility**: Most WASIX functions map cleanly onto host OS primitives (Linux, macOS). Some features require Wasmer to run in a privileged mode to bridge sockets/files.

## Choosing Between Snapshots

- **Pure Preview 1**: Use for lightweight CLI-style modules, deterministic functions, and maximum portability (AssemblyScript example).
- **Preview 1 + WASIX**: Choose when porting existing C/Rust applications that rely on sockets, threads, or advanced FS. Ensure security controls when exposing network access.
- **Preview 2**: Adopt when you need typed interfaces, high-level protocols (HTTP, key-value), or multi-language component composition. Requires tooling investment.

## Ngixi Configuration Playbook

- **Level 0 (current)**: Instantiate preview 1 modules (AssemblyScript) with minimal WASI imports (stdio, env vars). Keep modules pure besides stdout logging.
- **Level 1**: Add preview 1 filesystem access by preopening directories (WasiConfig). Provide dynamic stdin/stdout to capture module output.
- **Level 2**: Enable WASIX for modules needing networking or async I/O. Wrap sockets with policy enforcement (e.g., host-managed firewall rules).
- **Level 3**: Pilot preview 2 components. Generate WIT interfaces describing Ngixi host capabilities (HTTP client, secrets store). Use Wasmer component API to compile and instantiate.
- **Level 4**: Combine component model with WASIX (as the two ecosystems converge) to support rich workloads while maintaining capability isolation.

## Future Signals to Watch

- **WASI 0.2 preview**: Track proposals in the WASI repository; new preview snapshots may rename namespaces.
- **WASIX standardization**: The community aims to upstream select features into future WASI previews. Monitor `wasix-org/wasix` releases.
- **Host ABI changes**: Wasmer may adjust Zig API as upstream C/ Rust APIs evolve. Keep vendored bindings aligned with Wasmer tags.
- **Language support**: AssemblyScript component-model support, Rust `componentize` macros, and Zig WIT generators will influence Ngixi's guest strategy.

Understanding the spectrum of WASI and WASIX capabilities lets you plan Ngixi's host surface area and guest expectations with confidence.
