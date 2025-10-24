const std = @import("std");
const WasmerModule = @import("build/WasmerModule.zig");
const NgixiModule = @import("build/NgixiModule.zig");
const NgixiExe = @import("build/NgixiExe.zig");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Wasmer
    try WasmerModule.init(b, target, optimize, null);
    defer WasmerModule.deinit(b);

    // Ngixi modules
    try NgixiModule.init(b, target);
    defer NgixiModule.deinit();

    try NgixiExe.init(b);
    defer NgixiExe.deinit();

    b.installArtifact(NgixiExe.exe.?);

    // --- Run target ---
    const run_step = b.step("run", "Run ngixi app");
    const run_cmd = b.addRunArtifact(NgixiExe.exe.?);
    run_step.dependOn(&run_cmd.step);
    if (b.args) |args| run_cmd.addArgs(args);

    // --- Tests ---
    const mod_tests = b.addTest(.{ .root_module = NgixiModule.module.? });
    const exe_tests = b.addTest(.{ .root_module = NgixiExe.exe.?.root_module });
    const run_mod_tests = b.addRunArtifact(mod_tests);
    const run_exe_tests = b.addRunArtifact(exe_tests);
    const test_step = b.step("test", "Run tests");
    test_step.dependOn(&run_mod_tests.step);
    test_step.dependOn(&run_exe_tests.step);
}
