const std = @import("std");
const tools = @import("build/tools.zig");
const WasmerModule = @import("build/WasmerModule.zig");
const NgixiModule = @import("build/NgixiModule.zig");
const NgixiExe = @import("build/NgixiExe.zig");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // --- TOP-LEVEL: Git setup ---
    const git = tools.git.init(b, null);
    const submodule_init = git.submoduleInit();
    b.default_step.dependOn(submodule_init); // ✅ fixed

    // --- SECONDARY: Main build orchestrator ---
    const build_all = b.step("build-all", "Full build after submodules init");
    build_all.dependOn(submodule_init);

    // Wasmer
    try WasmerModule.init(b, target, optimize, submodule_init);
    defer WasmerModule.deinit(b);

    // Ngixi modules
    try NgixiModule.init(b, target);
    defer NgixiModule.deinit();

    try NgixiExe.init(b);
    defer NgixiExe.deinit();

    build_all.dependOn(&NgixiExe.exe.?.step);

    // --- Run target ---
    const run_step = b.step("run", "Run ngixi app");
    const run_cmd = b.addRunArtifact(NgixiExe.exe.?);
    run_step.dependOn(&run_cmd.step);
    run_cmd.step.dependOn(submodule_init);
    if (b.args) |args| run_cmd.addArgs(args);

    // --- Tests ---
    const mod_tests = b.addTest(.{ .root_module = NgixiModule.module.? });
    const exe_tests = b.addTest(.{ .root_module = NgixiExe.exe.?.root_module });
    const run_mod_tests = b.addRunArtifact(mod_tests);
    const run_exe_tests = b.addRunArtifact(exe_tests);
    const test_step = b.step("test", "Run tests");
    test_step.dependOn(submodule_init);
    test_step.dependOn(&run_mod_tests.step);
    test_step.dependOn(&run_exe_tests.step);

    // --- Default entry ---
    b.getInstallStep().dependOn(submodule_init);
    b.default_step.dependOn(build_all);
}
