const std = @import("std");
const WasmerModule = @import("WasmerModule.zig");

pub var module: ?*std.Build.Module = null;

pub fn init(b: *std.Build, target: std.Build.ResolvedTarget) !void {
    const ngixiModule = b.addModule("ngixi", .{
        .root_source_file = b.path("src/ngixi/main.zig"),
        .target = target,
    });
    ngixiModule.addImport("wasmer", WasmerModule.module.?);

    module = ngixiModule;
}

pub fn deinit() void {
    module = null;
}
