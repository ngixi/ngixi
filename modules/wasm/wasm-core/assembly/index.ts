/**
 * Ngixi WASM Module - AssemblyScript
 *
 * Simple hello world using custom host print function
 */

declare function print(ptr: usize, len: u32): void;

export function _start(): void {
  const msg = "Hello, World from AssemblyScript!\n";
  // Allocate message as a UTF-8 buffer
  const buf = String.UTF8.encode(msg, true); // ArrayBuffer

  const bufPtr = changetype<usize>(buf);
  const bufLen = buf.byteLength;

  print(bufPtr, bufLen);
}

export function _initialize(): void { }