const std = @import("std");

// WASI functions
extern fn clock_time_get(clock_id: u32, precision: u64, timestamp: *u64) u32;
extern fn fd_write(fd: u32, iovs: [*]const std.os.wasi.iovec_t, iovs_len: usize, nwritten: *usize) u32;

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

pub fn main() void {
    // Get start time using WASI clock
    var start: u64 = 0;
    _ = clock_time_get(0, 1000, &start); // CLOCK_MONOTONIC, 1ns precision

    // Calculate fibonacci(30) 10000 times and sum them
    var sum: u64 = 0;
    var i: u32 = 0;
    while (i < 10000) : (i += 1) {
        sum += fib(30);
    }

    // Get end time using WASI clock
    var end: u64 = 0;
    _ = clock_time_get(0, 1000, &end); // CLOCK_MONOTONIC, 1ns precision

    const duration_ns = end - start;
    const duration_us = duration_ns / 1000;
    const average_time = duration_us / 10000;

    // Print results using std.debug.print (should work in WASI)
    std.debug.print("🦀 Zig → WASM\n", .{});
    std.debug.print("  ⏱️  Total Time: {} μs\n", .{duration_us});
    std.debug.print("  📊 Avg Time: {} μs\n", .{average_time});
    std.debug.print("  ✅ Result: {}\n\n", .{sum});
}
