# Roadmap and Further Study

## Contents

- [[README|Ngixi WebAssembly Guide]]
- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

## On This Page

- [[Roadmap and Further Study#Short Term Milestones|Short Term Milestones]]
- [[Roadmap and Further Study#Medium Term Milestones|Medium Term Milestones]]
- [[Roadmap and Further Study#Long Term Vision|Long Term Vision]]
- [[Roadmap and Further Study#Learning Resources|Learning Resources]]
- [[Roadmap and Further Study#Communities and Updates|Communities and Updates]]

## Short Term Milestones

- Instrument the current AssemblyScript module with a host logging import to validate host-to-guest callbacks.
- Add WASI preview 1 filesystem access for controlled directories (`/tmp` sandbox) and capture module output from Zig.
- Build a smoke-test harness in Zig that loads the Wasm sample, calls exports, and asserts on values (using `std.testing`).

## Medium Term Milestones

- Integrate WASIX networking for a proof-of-concept HTTP fetch module; enforce host-configured allowlists.
- Implement a host capability registry in `host.zig` with feature flags so modules request `http`, `kv`, or `fs` before instantiation.
- Prototype a component-model build using `wit-bindgen` or `componentize-js`, even if experimental, to understand Preview 2 ergonomics.

## Long Term Vision

- Provide Ngixi users a catalog of host capabilities described in WIT, enabling language-agnostic guest development.
- Move critical guest workloads to Wasmer AOT artifacts for faster cold-starts in production environments.
- Offer multi-tenant isolation by spawning dedicated stores with resource quotas and monitoring via Wasmer tracing hooks.

## Learning Resources

- **Wasmer Docs**: https://docs.wasmer.io/
- **WASI Proposals**: https://github.com/WebAssembly/WASI
- **WASIX Project**: https://wasix.org/ and https://github.com/wasix-org/wasix
- **Component Model**: https://github.com/WebAssembly/component-model
- **AssemblyScript WASI**: https://github.com/jedisct1/wasi-assemblyscript
- **wit-bindgen**: https://github.com/bytecodealliance/wit-bindgen

## Communities and Updates

- **Wasmer Discord**: Active discussions on embedding and new releases.
- **Bytecode Alliance Zulip**: Deep dives into WASI, component model, tooling.
- **WASIX Matrix**: Follow progress on new syscalls and compatibility layers.
- **Release tracking**: Watch Wasmer release notes and Zig binding updates to align Ngixi's vendored API.

Use this roadmap to prioritize learning and development work as you evolve Ngixi's WebAssembly runtime.
