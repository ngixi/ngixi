const std = @import("std");

pub var module: ?*std.Build.Module = null;
pub var lib_path: ?[]const u8 = null;

pub fn init(b: *std.Build, target: std.Build.ResolvedTarget, optimize: std.builtin.OptimizeMode) !void {
    const wasmer_path_env = std.process.getEnvVarOwned(b.allocator, "NGIXI_WASMER_PATH") catch {
        std.log.err("NGIXI_WASMER_PATH environment variable not set", .{});
        return error.EnvVarNotSet;
    };
    defer b.allocator.free(wasmer_path_env);

    const lib_dir = std.fs.path.join(b.allocator, &.{ wasmer_path_env, "lib" }) catch unreachable;
    defer b.allocator.free(lib_dir);

    const include_dir = std.fs.path.join(b.allocator, &.{ wasmer_path_env, "include" }) catch unreachable;
    defer b.allocator.free(include_dir);

    const wasmerModule = b.addModule("wasmer", .{
        .root_source_file = b.path("modules/wasmer-zig-api/src/wasmer.zig"),
        .target = target,
        .optimize = optimize,
    });

    wasmerModule.addIncludePath(.{ .cwd_relative = include_dir });
    wasmerModule.addLibraryPath(.{ .cwd_relative = lib_dir });
    wasmerModule.linkSystemLibrary("wasmer", .{});

    // Install the dynamic library
    const target_os = target.result.os.tag;
    const lib_name = switch (target_os) {
        .windows => "wasmer.dll",
        .linux => "libwasmer.so",
        .macos => "libwasmer.dylib",
        else => {
            std.log.err("Unsupported OS: {}", .{target_os});
            return error.UnsupportedOS;
        },
    };

    const lib_path_alloc = std.fs.path.join(b.allocator, &.{ lib_dir, lib_name }) catch unreachable;

    const install_lib = b.addInstallFile(.{ .cwd_relative = lib_path_alloc }, b.fmt("bin/{s}", .{lib_name}));
    b.getInstallStep().dependOn(&install_lib.step);

    module = wasmerModule;
    lib_path = lib_path_alloc;
}

pub fn deinit(b: *std.Build) void {
    if (lib_path) |p| {
        b.allocator.free(p);
        lib_path = null;
    }
    module = null;
}
