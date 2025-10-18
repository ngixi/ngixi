import fs from "node:fs";
import path from "node:path";
import {
  checkoutGitRef,
  cloneGitRepository,
  ensureDirectory,
  runCargo,
  runCommand,
  updateGitSubmodules,
} from "./utilities.js";
import { scopedLogger } from "./logging.js";

const log = scopedLogger("wasmtime");

export async function buildWasmtime(options) {
  const { config, version, gitRoot, repoPath, force = false } = options;

  if (!config) throw new Error("buildWasmtime requires a configuration object");
  if (!gitRoot) throw new Error("buildWasmtime requires a gitRoot directory");
  if (!repoPath) throw new Error("buildWasmtime requires a repoPath destination");
  if (!config.gitUrl) throw new Error("Wasmtime gitUrl is missing from the build configuration");

  ensureDirectory(gitRoot);

  const destination = path.resolve(repoPath);
  
  if (force && fs.existsSync(destination)) {
    log.info({ destination }, "force flag enabled - removing existing Wasmtime repository");
    fs.rmSync(destination, { recursive: true, force: true });
    log.info({ destination }, "existing repository removed");
  }
  
  log.info({ repoUrl: config.gitUrl, destination, version, force }, "preparing Wasmtime sources");
  const cloneResult = cloneGitRepository({
    repoUrl: config.gitUrl,
    destination,
    shallow: true,
  });

  if (!cloneResult.ok && !cloneResult.skipped) {
    const msg = cloneResult.stderr || cloneResult.stdout || "unknown error";
    throw new Error(`Failed to clone Wasmtime repository: ${msg}`);
  }
  log.info({ destination, reused: cloneResult.skipped }, "repository ready");

  const submoduleResult = updateGitSubmodules({ repoPath: destination });
  if (!submoduleResult.ok) {
    const msg = submoduleResult.stderr || submoduleResult.stdout || "unknown error";
    throw new Error(`Failed to initialize Wasmtime submodules:\n${msg}`);
  }
  log.info("git submodules initialized");

  const artifactsRoot = path.resolve(gitRoot, "..", "artifacts", "wasmtime");
  ensureDirectory(artifactsRoot);

  const trimmedVersion = typeof version === "string" ? version.trim() : "";
  const fallbackRefs = [];
  if (trimmedVersion) {
    fallbackRefs.push(trimmedVersion.startsWith("v") ? trimmedVersion.slice(1) : `v${trimmedVersion}`);
  }

  const checkoutResult = checkoutGitRef({
    repoPath: destination,
    primaryRef: trimmedVersion,
    fallbackRefs,
  });

  if (!checkoutResult.ok) {
    const detail = checkoutResult.errors
      .map(e => `  · ${e.ref} ${e.type} ${e.step}${e.output ? `\n    ${e.output}` : ""}`)
      .join("\n");
    throw new Error(`Failed to check out Wasmtime reference. Attempts:\n${detail}`);
  }

  log.info({ ref: checkoutResult.ref, refType: checkoutResult.type }, "checked out Wasmtime reference");

  buildWasmtimeRustCAPI(destination);
  verifyRustArtifacts(destination);
  configureWasmtimeCAPI(destination, artifactsRoot);
  buildWasmtimeCAPI(destination);
  installWasmtimeCAPI(destination, artifactsRoot);
  copyRuntimeArtifacts(destination, artifactsRoot);
  
  return { ok: true, name: 'Wasmtime', version };
}

function buildWasmtimeRustCAPI(cwd) {
  log.info("building Rust C API crate (cargo build --release -p wasmtime-c-api)");
  const result = runCargo(["build", "--release", "-p", "wasmtime-c-api"], { cwd, stdio: "inherit" });
  if (!result.ok) fail("Rust C API build", result);
}

function verifyRustArtifacts(cwd) {
  const dll = path.join(cwd, "target", "release", "wasmtime.dll");
  const lib = path.join(cwd, "target", "release", "wasmtime.lib");
  if (!fs.existsSync(dll) || !fs.existsSync(lib)) {
    log.error({ dll, lib }, "missing Rust build artifacts");
    throw new Error("[wasmtime] missing Rust build artifacts — Cargo did not produce the runtime.");
  }
  log.info({ dll, lib }, "verified Rust artifacts exist");
}

function configureWasmtimeCAPI(cwd, installPrefix) {
  log.info({ installPrefix }, "configuring C API with CMake (cmake configure)");
  runCMakeOrThrow(
    ["-S", "crates/c-api", "-B", "target/c-api", "--install-prefix", installPrefix],
    cwd,
    "Failed to configure Wasmtime C API with CMake"
  );
}

function buildWasmtimeCAPI(cwd) {
  log.info("building C API with CMake (cmake --build target/c-api --config Release)");
  runCMakeOrThrow(
    ["--build", "target/c-api", "--config", "Release"],
    cwd,
    "Failed to build Wasmtime C API"
  );
}

function installWasmtimeCAPI(cwd, installPrefix) {
  log.info({ installPrefix }, "installing C API artifacts");
  runCMakeOrThrow(
    ["--install", "target/c-api", "--config", "Release"],
    cwd,
    "Failed to install Wasmtime C API artifacts"
  );
}

function copyRuntimeArtifacts(cwd, installPrefix) {
  const srcDll = path.join(cwd, "target", "release", "wasmtime.dll");
  const srcLib = path.join(cwd, "target", "release", "wasmtime.lib");
  const destLib = path.join(installPrefix, "lib");
  ensureDirectory(destLib);

  log.info({ destLib }, "copying runtime DLL and LIB to artifacts");
  fs.copyFileSync(srcDll, path.join(destLib, "wasmtime.dll"));
  fs.copyFileSync(srcLib, path.join(destLib, "wasmtime.lib"));
}

function runCMakeOrThrow(args, cwd, msg) {
  const result = runCommand("cmake", args, { cwd, stdio: "inherit" });
  if (!result.ok) fail(msg, result);
}

function fail(label, result) {
  const output = result.stderr || result.stdout || (result.error ? result.error.message : "");
  const code = typeof result.status === "number" ? ` (exit code ${result.status})` : "";
  const err = result.error instanceof Error ? result.error : undefined;
  log.error({ label, status: result.status, output, err }, "Wasmtime build step failed");
  throw new Error(`[wasmtime] ${label} failed${code}\n${output}`);
}
