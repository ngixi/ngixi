const std = @import("std");
const wasmer = @import("wasmer");

pub fn main() !void {
    std.debug.print("Hello, Ngixi!\n", .{});

    // Create a Wasmer engine
    const engine = try wasmer.Engine.init();
    defer engine.deinit();

    std.debug.print("Wasmer Engine initialized!\n", .{});

    // Create a store
    const store = try wasmer.Store.init(engine);
    defer store.deinit();

    std.debug.print("Wasmer Store created!\n", .{});
}
