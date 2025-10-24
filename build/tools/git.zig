const std = @import("std");

b: *std.Build,
cwd: ?[]const u8 = null,

fn cmd(self: @This(), args: []const []const u8, name: []const u8) *std.Build.Step {
    const s = self.b.addSystemCommand(args);
    s.setName(name);

    // Zig 0.15 expects a LazyPath, not a raw string.
    if (self.cwd) |dir| s.setCwd(self.b.path(dir));

    return &s.step;
}

pub fn init(b: *std.Build, cwd: ?[]const u8) @This() {
    return .{ .b = b, .cwd = cwd };
}

pub fn submoduleInit(self: @This()) *std.Build.Step {
    return self.cmd(&.{
        "git", "submodule", "update", "--init", "--recursive",
    }, "git-submodule-init");
}

pub fn submoduleUpdate(self: @This()) *std.Build.Step {
    return self.cmd(&.{
        "git", "submodule", "update", "--remote",
    }, "git-submodule-update");
}

pub fn pull(self: @This()) *std.Build.Step {
    return self.cmd(&.{
        "git", "pull", "--recurse-submodules",
    }, "git-pull");
}

pub fn status(self: @This()) *std.Build.Step {
    return self.cmd(&.{
        "git", "status", "--porcelain",
    }, "git-status");
}

pub fn checkout(self: @This(), branch: []const u8) *std.Build.Step {
    return self.cmd(&.{
        "git", "checkout", branch,
    }, "git-checkout");
}

pub fn fetch(self: @This()) *std.Build.Step {
    return self.cmd(&.{
        "git", "fetch", "--all", "--tags", "--recurse-submodules",
    }, "git-fetch");
}
