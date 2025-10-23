const std = @import("std");
const NgixiModule = @import("NgixiModule.zig");

pub var exe: ?*std.Build.Step.Compile = null;

pub fn init(b: *std.Build) !void {
    const exe_comp = b.addExecutable(.{
        .name = "ngixi",
        .root_module = NgixiModule.module.?,
    });

    exe_comp.linkLibC();
    exe_comp.linkLibCpp();

    b.installArtifact(exe_comp);

    exe = exe_comp;
}

pub fn deinit() void {
    exe = null;
}
