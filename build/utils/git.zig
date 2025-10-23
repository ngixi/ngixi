const std = @import("std");

pub fn initSubmodules(b: *std.Build) *std.Build.Step {
    const git_cmd = b.addSystemCommand(&.{ "git", "submodule", "update", "--init", "--recursive" });
    return &git_cmd.step;
}

pub fn updateSubmodules(b: *std.Build) *std.Build.Step {
    const git_cmd = b.addSystemCommand(&.{ "git", "submodule", "update", "--remote" });
    return &git_cmd.step;
}

pub fn pull(b: *std.Build) *std.Build.Step {
    const git_cmd = b.addSystemCommand(&.{ "git", "pull", "--recurse-submodules" });
    return &git_cmd.step;
}

pub fn status(b: *std.Build) *std.Build.Step {
    const git_cmd = b.addSystemCommand(&.{ "git", "status", "--porcelain" });
    return &git_cmd.step;
}
