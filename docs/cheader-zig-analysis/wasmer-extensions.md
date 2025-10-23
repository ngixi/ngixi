# Wasmer Extensions API Analysis

## Missing Components

### Features API
```c
wasmer_features_t* wasmer_features_new(void)
void wasmer_features_delete(wasmer_features_t*)
bool wasmer_features_bulk_memory(wasmer_features_t*, bool)
bool wasmer_features_memory64(wasmer_features_t*, bool)
bool wasmer_features_module_linking(wasmer_features_t*, bool)
bool wasmer_features_multi_memory(wasmer_features_t*, bool)
bool wasmer_features_multi_value(wasmer_features_t*, bool)
bool wasmer_features_reference_types(wasmer_features_t*, bool)
bool wasmer_features_simd(wasmer_features_t*, bool)
bool wasmer_features_tail_call(wasmer_features_t*, bool)
bool wasmer_features_threads(wasmer_features_t*, bool)
```

### CPU Features API
```c
wasmer_cpu_features_t* wasmer_cpu_features_new(void)
void wasmer_cpu_features_delete(wasmer_cpu_features_t*)
bool wasmer_cpu_features_add(wasmer_cpu_features_t*, const wasm_name_t*)
```

### Metering API
```c
wasmer_metering_t* wasmer_metering_new(uint64_t, wasmer_metering_cost_function_t)
void wasmer_metering_delete(wasmer_metering_t*)
wasmer_middleware_t* wasmer_metering_as_middleware(wasmer_metering_t*)
uint64_t wasmer_metering_get_remaining_points(wasm_instance_t*)
bool wasmer_metering_points_are_exhausted(wasm_instance_t*)
void wasmer_metering_set_remaining_points(wasm_instance_t*, uint64_t)
```

### Target/Triple API
```c
wasmer_triple_t* wasmer_triple_new(const wasm_name_t*)
wasmer_triple_t* wasmer_triple_new_from_host(void)
void wasmer_triple_delete(wasmer_triple_t*)
wasmer_target_t* wasmer_target_new(wasmer_triple_t*, wasmer_cpu_features_t*)
void wasmer_target_delete(wasmer_target_t*)
```

### FuncEnv API
```c
wasmer_funcenv_t* wasmer_funcenv_new(wasm_store_t*, void*)
void wasmer_funcenv_delete(wasmer_funcenv_t*)
```

### Named Extern API
```c
const wasm_name_t* wasmer_named_extern_module(const wasmer_named_extern_t*)
const wasm_name_t* wasmer_named_extern_name(const wasmer_named_extern_t*)
const wasm_extern_t* wasmer_named_extern_unwrap(const wasmer_named_extern_t*)
void wasmer_named_extern_vec_copy(wasmer_named_extern_vec_t*, const wasmer_named_extern_vec_t*)
void wasmer_named_extern_vec_delete(wasmer_named_extern_vec_t*)
void wasmer_named_extern_vec_new(wasmer_named_extern_vec_t*, uintptr_t, wasmer_named_extern_t**)
void wasmer_named_extern_vec_new_empty(wasmer_named_extern_vec_t*)
void wasmer_named_extern_vec_new_uninitialized(wasmer_named_extern_vec_t*, uintptr_t)
```

### Error Handling
```c
int wasmer_last_error_length(void)
int wasmer_last_error_message(char*, int)
```

### Utilities
```c
bool wasmer_is_backend_available(wasmer_backend_t)
bool wasmer_is_headless(void)
void wasmer_setup_tracing(int, int)
const char* wasmer_version(void)
uint8_t wasmer_version_major(void)
uint8_t wasmer_version_minor(void)
uint8_t wasmer_version_patch(void)
const char* wasmer_version_pre(void)
void wat2wasm(const wasm_byte_vec_t*, wasm_byte_vec_t*)
```

## Implementation Plan

### Phase 1: Core Types
1. Implement `Features` with all feature flags
2. Implement `CpuFeatures` with add/check operations
3. Implement `Target` and `Triple` for cross-compilation

### Phase 2: Metering
1. Implement `Metering` type
2. Add middleware integration
3. Add point checking/management

### Phase 3: FuncEnv
1. Implement `FuncEnv` for function environments
2. Integrate with Func creation

### Phase 4: Named Externs
1. Implement `NamedExtern` and `NamedExternVec`
2. Add import/export utilities

### Phase 5: Utilities
1. Add error handling functions
2. Add version information
3. Add WAT parsing
4. Add backend checking
5. Add tracing setup