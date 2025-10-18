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

- **Node.js** - For the build system that builds the things that build the other things
- **Zig** - The new hotness in systems programming
- **A Modern GPU** - Preferably one that supports Vulkan/D3D12/Metal (pick your poison)
- **Patience** - Lots and lots of patience
- **Coffee** - Essential for debugging WebAssembly crashes at 3 AM
- **A Sense of Humor** - You're gonna need it

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