# Ngixi WebAssembly Guide

## Contents

- [[WebAssembly Primer]]
- [[Wasmer in Zig]]
- [[WASI and WASIX Deep Dive]]
- [[AssemblyScript Guest Playbook]]
- [[Runtime Capability Recipes]]
- [[Roadmap and Further Study]]

Welcome to the knowledge base for embedding Wasmer inside the Ngixi Zig project. This guide is designed to bring you from "what even is WASI?" to confidently extending Ngixi with powerful host capabilities, guest modules, and modern component-model tooling.

## How to Use These Docs

- Start with [[WebAssembly Primer]] for a refresher on the execution model.
- Continue with [[Wasmer in Zig]] to understand the embedding surface you have today.
- Study [[WASI and WASIX Deep Dive]] to grok the evolving system interface landscape.
- Use [[AssemblyScript Guest Playbook]] while building new guest modules.
- Explore [[Runtime Capability Recipes]] for ideas on exposing rich host features.
- Consult [[Roadmap and Further Study]] for next steps, open questions, and reference material.

Each page begins with an Obsidian-friendly contents list so you can jump across the stack without relying on external sidebar files.

## Quick Orientation of the Ngixi Runtime

- `modules/ngixi/main.zig`: Initializes Wasmer engine and store. Extend this to load modules, configure WASI/WASIX, and host imports.
- `modules/ngixi/host.zig`: Stub for defining host functions. Expand this to register Zig capabilities with guest modules.
- `modules/wasm/ngixi.ts`: AssemblyScript WASI Preview 1 sample that writes to stdout. Use it as a template for richer guest logic.
- `modules/wasmer-zig-api/`: Vendored Wasmer Zig bindings. Review `examples/*.zig` to learn idiomatic patterns.

The remainder of this documentation expands each of these components and shows how to wield Wasmer features effectively.
