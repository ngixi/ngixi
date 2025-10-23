# Zig API Refactoring Plan

## Current Architecture Issues

### Problems
1. **C-Style Interface**: Direct exposure of C API patterns
2. **Inconsistent Error Handling**: Mix of error sets and null returns
3. **Memory Management**: Unclear ownership semantics
4. **Incomplete Types**: Missing Zig wrappers for complex types
5. **No Documentation**: Limited inline docs and examples

### Goals
1. **Zig Idiomatic**: Use Zig patterns (result types, optionals, allocators)
2. **Type Safety**: Proper type system with compile-time checks
3. **Resource Management**: Clear ownership and RAII patterns
4. **Comprehensive**: 100% API coverage
5. **Well-Documented**: Examples and comprehensive docs

## Refactoring Strategy

### Phase 1: Type System Overhaul

#### 1.1 Result Types
Replace error unions with proper Result types:
```zig
pub const Result = union(enum) {
    ok: T,
    err: Error,
};
```

#### 1.2 Optional Types
Use `?T` instead of nullable pointers where appropriate.

#### 1.3 Owned Types
Implement RAII with deinit methods:
```zig
pub const Owned = struct {
    ptr: *T,
    
    pub fn deinit(self: Owned) void {
        // cleanup
    }
};
```

### Phase 2: API Ergonomics

#### 2.1 Builder Pattern
For complex configuration:
```zig
const config = try Config.builder()
    .withFeatures(.{.simd = true, .threads = true})
    .withTarget(target)
    .build();
```

#### 2.2 Method Chaining
Fluent interfaces where appropriate:
```zig
const instance = try Instance.init(store, module)
    .withImports(&imports)
    .withWasi(env);
```

#### 2.3 Convenience Methods
Add high-level helpers:
```zig
// Instead of manual extern setup
const func = try Func.fromCallback(store, callback);
```

### Phase 3: Memory Management

#### 3.1 Allocator Integration
Accept allocators for owned types:
```zig
pub fn init(allocator: std.mem.Allocator) !Self
```

#### 3.2 Reference Counting
For shared resources where needed.

#### 3.3 Automatic Cleanup
Use defer patterns consistently.

### Phase 4: Error Handling

#### 4.1 Unified Error Set
```zig
pub const Error = error{
    ConfigInit,
    EngineInit,
    ModuleInit,
    InstanceInit,
    FuncInit,
    MemoryInit,
    WasiConfigInit,
    WasiEnvInit,
    OutOfMemory,
    InvalidArgument,
    Trap,
};
```

#### 4.2 Error Context
Include error messages from C API:
```zig
pub fn lastError(allocator: std.mem.Allocator) ![]const u8
```

### Phase 5: Advanced Features

#### 5.1 Generics
Use generics for type-safe operations:
```zig
pub fn call(comptime Result: type, args: anytype) !Result
```

#### 5.2 Compile-Time Checks
Validate at compile time where possible.

#### 5.3 Async Support
Consider async/await for long-running operations.

## File Structure

### Proposed Layout
```
src/
├── main.zig          # Re-exports and convenience functions
├── types.zig         # Core opaque types and externs
├── config.zig        # Configuration builders
├── engine.zig        # Engine and store management
├── module.zig        # Module loading and inspection
├── instance.zig      # Instance creation and management
├── func.zig          # Function handling
├── memory.zig        # Memory operations
├── table.zig         # Table operations
├── global.zig        # Global variables
├── wasi.zig          # WASI support
├── features.zig      # Feature flags
├── metering.zig      # Gas metering
├── target.zig        # Cross-compilation targets
├── utils.zig         # WAT parsing, error handling
└── testing.zig       # Test utilities
```

## Implementation Priority

### High Priority
1. Complete type system
2. Error handling overhaul
3. Memory management fixes
4. Core API completion (Config, Engine, Module, Instance)

### Medium Priority
1. WASI completion
2. Advanced features (Features, Metering, Target)
3. API ergonomics improvements

### Low Priority
1. Builder patterns
2. Generic improvements
3. Async support
4. Comprehensive testing

## Migration Strategy

### Backward Compatibility
- Keep old API available with deprecation warnings
- Provide migration guide
- Gradual rollout

### Testing
- Comprehensive test suite for new API
- Regression tests for old API
- Performance benchmarks

### Documentation
- API reference docs
- Migration guide
- Examples and tutorials