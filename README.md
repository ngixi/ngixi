# 🌈 ngixi

> *"What is it?"* - Everyone who looks at this repo  
> *"I'm not 100% sure yet"* - The maintainer(s)

## What Even Is This? 🤔

ngixi is an **experimental** multimedia framework that may or may not revolutionize everything or absolutely nothing. We're throwing some of the most powerful native technologies into a blender and seeing what happens:

- 🚀 **WebAssembly** (via Wasmtime) - Because running native code in a sandbox is totally not overkill
- 🎨 **Dawn/WebGPU** - For when you need graphics so fast they break the sound barrier
- 🎵 **FFmpeg** - The Swiss Army knife of multimedia (now with more confusion!)
- 🎧 **CPAL** - For audio that actually works (probably)
- ⚡ **Zig** - Because we like our memory management like we like our coffee: manual and potentially explosive

## Current Status: 📊

```
[████████████████████░░░░] 80% Confused
[██████░░░░░░░░░░░░░░░░░░] 25% Functional  
[████████████████████████] 100% Experimental
[░░░░░░░░░░░░░░░░░░░░░░░░] 0% Production Ready
```

## What Does It Do? 🎭

**The Honest Answer:** We're not entirely sure yet, but it involves:

- Making pixels dance on your screen really, really fast
- Processing audio/video in ways that would make FFmpeg developers proud (or terrified)
- Leveraging WebAssembly for that sweet, sweet near-native performance
- Probably causing your GPU to work harder than it has since you tried to run Crysis

**The Marketing Answer:** ngixi is a next-generation, cross-platform, quantum-entangled multimedia framework that harnesses the power of modern native technologies to deliver unprecedented performance in media processing and rendering applications.

**The Reality:** It's a fun experiment that combines cool tech and may actually do something useful eventually! 🎪

## Getting Started (At Your Own Risk) 🚧

```bash
# Step 1: Clone this beautiful mess
git clone <wherever-this-lives>

# Step 2: Check if you have the tools (spoiler: you probably don't)
npm run toolcheck

# Step 3: Build everything and pray to the compiler gods
npm run build

# Step 4: ???
# Step 5: Profit (or at least pretty colors on screen)
```

## Architecture 🏗️

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Your App  │───▶│    ngixi    │───▶│ GPU goes    │
│  (Brave)    │    │ (Confused)  │    │    BRRRRR   │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ WebAssembly Magic   │
                  │ FFmpeg Wizardry     │
                  │ Dawn GPU Sorcery    │
                  │ CPAL Audio Alchemy  │
                  └─────────────────────┘
```

## Dependencies That Will Make You Cry 😭

### The Absolute Essentials (Checked by `npm run toolcheck`)
- **Node.js 22+** - Because 21 just wasn't confusing enough
- **Git** - For when you need to blame someone (probably yourself)
- **CMake 3.16+** - The build system that builds build systems
- **Cargo 1.75+** - Rust's package manager (we're building Wasmtime from source, you masochist)
- **Zig 0.15.1** - Manual memory management for those who miss segfaults
- **Clang 12+** - C++20 support required (because C++11 was too easy)
- **Ninja 1.12+** - Fast builds (you'll still wait hours)
- **Go 1.23+** - Yes, we need Go too (Dawn's build system is... special)
- **depot_tools** - Google's magical build tools (contains `gclient`, good luck)
- **Python 3.11+** - For all those build scripts that could've been shell scripts

### Windows-Specific Nightmares (Auto-detected on Windows)
- **Windows SDK 10.0.22631+** - Because older SDKs just won't cut it
- **MSVC 19.41+ / Visual Studio 2022 v17.11+** - Microsoft's C++ compiler with all the ATL/MFC goodness
- **x64 Architecture** - ARM64? Not today, friend

### What We're Actually Building
- **Wasmtime** - WebAssembly runtime (from source, because pain builds character)
- **Dawn** - Google's WebGPU implementation (timestamp versioning is their love language)
- **FFmpeg** - Multimedia Swiss Army chainsaw (prepare for a 30-minute build)
- **zigwin32gen** - Win32 bindings generator (because someone has to)

### Optional But Highly Recommended
- **pyenv** - For when your system Python is too old (or too new)
- **A Modern GPU** - Vulkan/D3D12/Metal support (your iGPU is crying already)
- **Coffee** - Industrial strength recommended
- **A Sense of Humor** - Non-negotiable
- **Patience** - Measured in geological epochs
- **SSD** - HDD users: godspeed o7

## What Works ✅

- [x] Building things (sometimes)
- [x] Creating really complex dependency graphs
- [x] Making developers question their life choices
- [x] Generating impressive compilation logs

## What Doesn't Work ❌

- [ ] Most things (yet)
- [ ] Clear documentation (working on it)
- [ ] Stable APIs (lol)
- [ ] The maintainer's sleep schedule

## Contributing 🤝

Want to contribute to this beautiful chaos? We'd love your help! Just:

1. Fork it
2. Make it work (or at least compile)
3. Submit a PR
4. Explain what you did because we probably won't understand it

**Bonus points if you can:**
- Make the build system less terrifying
- Add actual functionality
- Fix whatever we broke last Tuesday
- Bring snacks to the debugging session

## License 📜

MIT - Because life's too short for complicated licenses when you're not sure what you're building anyway.

## Disclaimer ⚠️

ngixi may cause:
- Excessive CPU usage
- GPU fans to sound like jet engines
- Existential questions about software architecture
- An irresistible urge to rewrite everything in Rust (resist this urge)
- Temporary or permanent confusion about WebAssembly memory models

Use responsibly. Side effects may include increased productivity, decreased social life, and an unhealthy obsession with frame rates.

---

*"It's not a bug, it's an undocumented feature!"* - ngixi development philosophy