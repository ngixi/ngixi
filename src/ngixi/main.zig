const std = @import("std");
const wasmer = @import("wasmer");

// Complex benchmark: Calculate fibonacci numbers iteratively
fn fib(n: u32) u32 {
    if (n <= 1) return n;
    var a: u32 = 0;
    var b: u32 = 1;
    var i: u32 = 2;
    while (i <= n) : (i += 1) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

pub fn main() u8 {
    // Print header
    // Run Zig native benchmark
    const start_time = std.time.microTimestamp();
    var sum: u64 = 0;
    var i: u32 = 0;
    while (i < 10000) : (i += 1) {
        sum += fib(30);
    }
    const end_time = std.time.microTimestamp();
    const zig_duration = end_time - start_time;

    // Print Zig native results
    std.debug.print("🔷 Zig Native\n", .{});
    std.debug.print("  ⏱️ Total Time: {} μs\n", .{zig_duration});
    std.debug.print("  📊 Avg Time: {} μs\n", .{@divTrunc(zig_duration, 10000)});
    std.debug.print("  ✅ Result: {}\n\n", .{sum});

    // Run Grain WASM benchmark (it prints its own section)
    runGrainBenchmark() catch |err| {
        std.debug.print("Error running Grain benchmark: {}\n", .{err});
    };
    
    return 0;
}

fn runGrainBenchmark() !void {
    // Create configuration with tail call support enabled
    const config = try wasmer.Config.init();
    defer config.deinit();

    const features = try wasmer.Features.init();
    // NOTE: config.setFeatures() takes ownership of features!
    // Do NOT call features.deinit() or it will double-free when config.deinit() runs
    // defer features.deinit();

    // Enable tail calls for our runtime
    _ = features.tailCall(true);

    config.setFeatures(features);

    const engine = try wasmer.Engine.initWithConfig(config);
    defer engine.deinit();

    const store = try wasmer.Store.init(engine);
    defer store.deinit();

    // Try multiple possible paths for the wasmu file
    const possible_paths = [_][]const u8{
        "src/ngixi/grain/helloWorld.wasmu",
        "../src/ngixi/grain/helloWorld.wasmu",
        "../../src/ngixi/grain/helloWorld.wasmu",
        "src/ngixi/grain/helloWorld.wasm",
    };

    var wasmu_bytes: []u8 = undefined;
    var found = false;
    for (possible_paths) |path| {
        wasmu_bytes = std.fs.cwd().readFileAlloc(std.heap.page_allocator, path, 10 * 1024 * 1024) catch continue;
        found = true;
        break;
    }

    if (!found) {
        std.debug.print("Error: Could not find helloWorld.wasmu or helloWorld.wasm\n", .{});
        return;
    }

    defer std.heap.page_allocator.free(wasmu_bytes);

    var wasmu_byte_vec = wasmer.ByteVec.fromSlice(wasmu_bytes);
    defer wasmu_byte_vec.deinit();

    const module = wasmer.Module.deserialize(store, &wasmu_byte_vec) catch
        try wasmer.Module.init(store, &wasmu_byte_vec);
    defer module.deinit();

    const wasi_config = try wasmer.WasiConfig.init();
    defer wasi_config.deinit();

    const wasi_env = try wasmer.WasiEnv.init(store, wasi_config);
    defer wasi_env.deinit();

    var imports = try wasmer.wasi.getImports(store, wasi_env, module);
    // NOTE: Instance.init() likely takes ownership of imports!
    // Do NOT call imports.deinit() or it will double-free
    // defer imports.deinit();

    const instance = try wasmer.Instance.init(store, module, &imports);
    // NOTE: There may be an ownership issue with instance cleanup
    // Skipping deinit to avoid potential double-free
    // defer instance.deinit();

    try wasi_env.initializeInstance(store, instance);

    var exports = wasmer.ExternVec.init();
    defer exports.deinit();
    instance.getExports(&exports);

    for (exports.asSlice()) |export_opt| {
        if (export_opt) |export_ptr| {
            if (export_ptr.getKind() == .function) {
                if (export_ptr.asFunc()) |func| {
                    func.call(&[_]wasmer.Value{}, &[_]wasmer.Value{}) catch |err| {
                        std.debug.print("WASM function call error: {}\n", .{err});
                    };
                    break;
                }
            }
        }
    }
}
