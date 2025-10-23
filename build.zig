const std = @import("std");
const WasmerModule = @import("build/WasmerModule.zig");
const NgixiModule = @import("build/NgixiModule.zig");
const NgixiExe = @import("build/NgixiExe.zig");
const GitUtils = @import("build/utils/git.zig");

pub fn build(b: *std.Build) !void {
    // Always ensure submodules are initialized
    b.getInstallStep().dependOn(GitUtils.initSubmodules(b));

    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    try WasmerModule.init(b, target, optimize);
    defer WasmerModule.deinit(b);

    try NgixiModule.init(b, target);
    defer NgixiModule.deinit();

    try NgixiExe.init(b);
    defer NgixiExe.deinit();

    const ngixi_step = b.step("ngixi", "Build ngixi executable");
    ngixi_step.dependOn(&NgixiExe.exe.?.step);

    const run_step = b.step("run", "Run the app");
    const run_cmd = b.addRunArtifact(NgixiExe.exe.?);
    run_step.dependOn(&run_cmd.step);
    run_cmd.step.dependOn(b.getInstallStep());

    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    const mod_tests = b.addTest(.{
        .root_module = NgixiModule.module.?,
    });
    const run_mod_tests = b.addRunArtifact(mod_tests);

    const exe_tests = b.addTest(.{
        .root_module = NgixiExe.exe.?.root_module,
    });
    const run_exe_tests = b.addRunArtifact(exe_tests);

    const test_step = b.step("test", "Run tests");
    test_step.dependOn(&run_mod_tests.step);
    test_step.dependOn(&run_exe_tests.step);
}
