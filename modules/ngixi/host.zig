/// Ngixi Host API
/// Provides host functions and capabilities to WebAssembly modules
///
/// Usage:
/// ```zig
/// const Host = @import("host.zig");
///
/// // Create host with WASM memory
/// var my_host = Host.init(allocator, memory);
///
/// // Register all host functions
/// try my_host.registerFunctions(store, imports);
/// ```
const std = @import("std");
const wasmer = @import("wasmer");

// File-level struct fields
allocator: std.mem.Allocator,
memory: *wasmer.Memory,

const Self = @This();

pub fn init(allocator: std.mem.Allocator, memory: *wasmer.Memory) Self {
    return .{
        .allocator = allocator,
        .memory = memory,
    };
}

/// Register all host functions with a Wasmer instance
/// Call this to inject ngixi capabilities into a WASM module
pub fn registerFunctions(self: *Self, store: *wasmer.Store, imports: *wasmer.Imports) !void {
    _ = self;
    _ = store;
    _ = imports;

    // Future: add custom ngixi functions here
    // try self.registerHttp(store, imports);
    // try self.registerDatabase(store, imports);
    // try self.registerCrypto(store, imports);
}

test {
    std.testing.refAllDecls(@This());
}
