# WASI API Analysis

## Current Implementation

### Implemented Types
- `WasiConfig` - Most methods implemented
- `WasiEnv` - Core functionality
- `WasiVersion` - Enum implemented
- Global functions: `getWasiVersion`, `getImports`, `getStartFunction`

### Missing Functions

#### WasiEnv
```c
wasi_env_t* wasi_env_with_filesystem(wasi_config_t*, wasm_store_t*, const wasm_module_t*, const wasi_filesystem_t*, wasm_extern_vec_t*, const char*)
```

#### Filesystem Support
```c
void wasi_filesystem_delete(wasi_filesystem_t*)
wasi_filesystem_t* wasi_filesystem_init_static_memory(const wasm_byte_vec_t*)
```

#### Additional Imports
```c
bool wasi_get_unordered_imports(wasi_env_t*, const wasm_module_t*, wasmer_named_extern_vec_t*)
```

## Implementation Plan

### Phase 1: Filesystem Support
1. Implement `WasiFilesystem` type
2. Add `wasi_env_with_filesystem` method
3. Add filesystem creation/deletion functions

### Phase 2: Extended Imports
1. Implement `NamedExtern` and `NamedExternVec` types
2. Add `getUnorderedImports` function

### Phase 3: Complete Config
- Verify all config methods are implemented
- Add any missing config options