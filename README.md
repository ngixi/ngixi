# 🌈 ngixi

> **🚧 HEAVY WIP - ARCHITECTURAL PROTOTYPE 🚧**  
> *Most of this is ideas, plans, and rapid prototyping. Nothing is stable. Everything changes daily.*

## What Is This? 🤔

ngixi is an **experimental/toy project** exploring cross-platform multimedia frameworks built on modern native technologies. This is a research project—expect architectural plans, not finished features.

**Reality Check**: This README describes the vision and architectural intent. Most features listed are planned or in early exploration, not production-ready.

### The Vision (What We're Building Toward)

- 🚀 **WebAssembly** (Wasmtime/Wasmer) - Sandboxed execution environment
- 🎨 **WebGPU** (Google Dawn) - Cross-platform GPU rendering (planned integration)
- � **FFmpeg** - Multimedia processing (planned)
- � **CPAL** - Cross-platform audio (planned)
- ⚡ **Zig** - Systems programming language
- 🪟 **SDL3** - Cross-platform windowing (migrating to SDL3 components)

### Target Platforms

- Linux (planned)
- macOS (planned)  
- Windows (primary development platform)

## Current Status 📊

```
[████████████████████████] 100% Architectural Planning
[████████░░░░░░░░░░░░░░░░] 30% In Development
[████░░░░░░░░░░░░░░░░░░░░] 15% Actually Working
[░░░░░░░░░░░░░░░░░░░░░░░░] 0% Stable
```

**What Actually Exists**:
- ✅ Custom Wasmer Zig bindings (wasmer-zig-api module)
- ✅ WebAssembly runtime experiments
- ✅ Benchmark utilities
- ✅ Build system foundation

**What's Planned/TBD**:
- 📋 Dawn WebGPU integration
- � FFmpeg pipeline
- 📋 CPAL audio integration  
- 📋 SDL3 windowing
- 📋 Linux/macOS support
- 📋 Pretty much everything else

## Getting Started 🚧

**Prerequisites**:
- Zig 0.15.1+ (only thing you need—build server handles dependencies)
- Patience (measured in geological time)
- Willingness to accept rapid, breaking changes

```bash
git clone <repo-url>
cd ngixi
zig build
```

**Note**: Build instructions may be outdated by the time you read this. Check recent commits for current setup.

## Contributing 🤝

Interested in the experiment? Contributions welcome, but understand this is rapid-prototype territory.

**Current Focus**: Architectural exploration, not feature completion

See [NGIXI organization](https://github.com/ngixi) for the broader ecosystem.

## License 📜

MIT - Life's too short for complicated licenses when building experimental toys.

---

**Status**: Heavy WIP. Commits happen by the hundreds. Everything changes. Nothing is stable.  
**Motto**: *"It's not a bug, it's an undocumented architectural decision!"*