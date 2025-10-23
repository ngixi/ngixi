# WASM C API Analysis

## Current Implementation

### Implemented Types
- `Config` - Basic initialization only
- `Engine` - Basic init and withConfig
- `Store` - Basic init
- `Module` - Init and exports
- `Instance` - Init and export access
- `Func` - Basic creation and calling (incomplete)
- `Memory` - Basic operations
- `Extern` - Type conversions
- `Trap` - Basic error handling
- `Valtype`, `ValVec`, etc. - Value handling

### Missing Functions

#### Config
```c
void wasm_config_push_middleware(wasm_config_t*, wasmer_middleware_t*)
void wasm_config_set_backend(wasm_config_t*, wasmer_backend_t)
void wasm_config_set_features(wasm_config_t*, wasmer_features_t*)
void wasm_config_set_target(wasm_config_t*, wasmer_target_t*)
void wasm_config_sys_canonicalize_nans(wasm_config_t*, bool)
```

#### Engine
- No additional functions needed beyond current

#### Module
```c
void wasmer_module_name(const wasm_module_t*, wasm_name_t*)
wasm_module_t* wasmer_module_new(wasm_engine_t*, const wasm_byte_vec_t*)
bool wasmer_module_set_name(wasm_module_t*, const wasm_name_t*)
```

#### Func
- Full call implementation missing
- FuncEnv support missing

#### Memory
- Additional operations may be missing

#### Table/Global
- Entirely missing implementations

## Implementation Plan

### Phase 1: Complete Config API
1. Add missing Config methods
2. Implement Features, Target, Middleware types
3. Add proper error handling

### Phase 2: Extend Module API
1. Add name operations
2. Implement wasmer_module_new wrapper

### Phase 3: Complete Func API
1. Fix call implementation
2. Add FuncEnv support

### Phase 4: Add Table/Global
1. Implement Table type and operations
2. Implement Global type and operations

### Phase 5: Advanced Features
1. Add CPU features
2. Add metering
3. Add target/triple support