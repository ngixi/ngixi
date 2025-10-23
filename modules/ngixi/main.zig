const std = @import("std");
const wasmer = @import("wasmer");

pub fn main() !void {
    std.debug.print("🚀 Starting ngixi WASM Runtime\n", .{});
    std.debug.print("================================\n\n", .{});

    // Initialize Wasmer with default configuration
    // The wasmer-zig-api wrapper uses Universal backend by default
    // For AOT compilation, Wasmer uses JIT by default but Universal backend provides good performance
    std.debug.print("⚙️  Initializing Wasmer engine...\n", .{});
    const engine = try wasmer.Engine.init();
    defer engine.deinit();

    std.debug.print("✅ Wasmer engine initialized (Universal backend, JIT compilation)\n\n", .{});

    std.debug.print("📦 Creating Wasmer store...\n", .{});
    const store = try wasmer.Store.init(engine);
    defer store.deinit();

    std.debug.print("✅ Wasmer store initialized\n\n", .{});

    // Load Grain-compiled WASM module
    std.debug.print("📂 Loading Grain WASM module from 'modules/ngixi/grain/helloWorld.wasm'...\n", .{});
    const wasm_bytes = try std.fs.cwd().readFileAlloc(std.heap.page_allocator, "modules/ngixi/grain/helloWorld.wasm", 1024 * 1024);
    defer std.heap.page_allocator.free(wasm_bytes);

    var wasm_byte_vec = wasmer.ByteVec.fromSlice(wasm_bytes);
    defer wasm_byte_vec.deinit();

    const module = try wasmer.Module.init(store, &wasm_byte_vec);
    defer module.deinit();

    std.debug.print("✅ Grain WASM module loaded successfully ({} bytes)\n\n", .{wasm_bytes.len});

    // Check if this is a WASI module
    const wasi_version = wasmer.wasi.getWasiVersion(module);
    std.debug.print("🔍 Analyzing module compatibility...\n", .{});
    std.debug.print("   WASI version: {}\n", .{@intFromEnum(wasi_version)});

    if (wasi_version != .InvalidVersion) {
        std.debug.print("✅ This is a WASI module! Setting up WASI environment...\n\n", .{});

        // Create WASI config
        std.debug.print("⚙️  Creating WASI configuration...\n", .{});
        const wasi_config = try wasmer.WasiConfig.init();
        defer wasi_config.deinit();

        // Inherit stdout/stderr so console.log output goes to our stdout
        wasi_config.inherit(.{ .std_out = true, .std_err = true });
        std.debug.print("✅ WASI config created (stdout/stderr inherited)\n\n", .{});

        // Create WASI environment
        std.debug.print("🏠 Creating WASI environment...\n", .{});
        const wasi_env = try wasmer.WasiEnv.init(store, wasi_config);
        defer wasi_env.deinit();

        std.debug.print("✅ WASI environment created\n\n", .{});

        // Get WASI imports - this should provide fd_write and other WASI functions
        std.debug.print("🔗 Getting WASI imports...\n", .{});
        var wasi_imports = try wasmer.wasi.getImports(store, wasi_env, module);
        defer wasi_imports.deinit();

        std.debug.print("✅ Got {} WASI imports\n\n", .{wasi_imports.size});

        // Create instance with WASI imports
        std.debug.print("🏗️  Creating WASM instance with WASI imports...\n", .{});
        const instance = try wasmer.Instance.init(store, module, &wasi_imports);
        defer instance.deinit();

        std.debug.print("✅ Instance created with WASI imports\n\n", .{});

        // Initialize WASI for the instance
        std.debug.print("🚀 Initializing WASI for instance...\n", .{});
        try wasi_env.initializeInstance(store, instance);

        std.debug.print("✅ WASI initialized for instance\n\n", .{});

        // Get memory from instance exports and set it for WASI
        std.debug.print("💾 Setting up WASI memory...\n", .{});
        var exports = wasmer.ExternVec.init();
        defer exports.deinit();
        instance.getExports(&exports);

        // Find memory export and set it for WASI
        var memory_found = false;
        for (exports.asSlice()) |export_opt| {
            if (export_opt) |export_ptr| {
                if (export_ptr.getKind() == .memory) {
                    if (export_ptr.asMemory()) |memory| {
                        wasi_env.setMemory(memory);
                        memory_found = true;
                        break;
                    }
                }
            }
        }

        if (memory_found) {
            std.debug.print("✅ WASI memory set\n\n", .{});
        } else {
            std.debug.print("⚠️  No memory export found for WASI\n\n", .{});
        }

        // Try to get and call the start function (if it exists)
        std.debug.print("🎯 Executing WASI start function...\n", .{});
        if (wasmer.wasi.getStartFunction(instance)) |start_func| {
            std.debug.print("   Running start function...\n", .{});
            try start_func.call(&[_]wasmer.Value{}, &[_]wasmer.Value{});
            std.debug.print("✅ WASI start function completed\n\n", .{});
        } else {
            std.debug.print("ℹ️  No WASI start function found\n\n", .{});
        }

        // Look for exported functions to call
        std.debug.print("🔍 Looking for exported functions...\n", .{});
        var function_called = false;
        for (exports.asSlice()) |export_opt| {
            if (export_opt) |export_ptr| {
                if (export_ptr.getKind() == .function) {
                    std.debug.print("   Found exported function\n", .{});

                    // Try calling the function (assuming it takes no parameters and returns nothing)
                    if (export_ptr.asFunc()) |func| {
                        std.debug.print("   Calling exported function...\n", .{});
                        try func.call(&[_]wasmer.Value{}, &[_]wasmer.Value{});
                        std.debug.print("✅ Exported function completed\n", .{});
                        function_called = true;
                        break; // Just call the first function we find
                    }
                }
            }
        }

        if (!function_called) {
            std.debug.print("ℹ️  No exported functions found to call\n", .{});
        }

    } else {
        std.debug.print("❌ This is not a WASI module\n", .{});
    }

    std.debug.print("\n🎉 ngixi WASM execution completed successfully!\n", .{});
}
