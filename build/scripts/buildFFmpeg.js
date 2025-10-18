import fs from "node:fs";
import path from "node:path";
import {
  checkoutGitRef,
  cloneGitRepository,
  ensureDirectory,
  runCommand,
} from "./utilities.js";
import { scopedLogger } from "./logging.js";

const log = scopedLogger("ffmpeg");

/**
 * Build FFmpeg multimedia framework.
 * 
 * FFmpeg is a complete, cross-platform solution to record, convert and stream
 * audio and video. It includes libavcodec, libavformat, libavutil, libavfilter,
 * libavdevice, libswscale and libswresample.
 * 
 * Build process:
 * 1. Clone FFmpeg repository
 * 2. Checkout specified version/tag
 * 3. Configure build
 * 4. Build libraries
 * 5. Install headers and libraries to artifacts directory
 * 
 * @param {Object} options - Build configuration
 * @param {Object} options.config - FFmpeg configuration from buildConfig.json
 * @param {string} options.version - Version/tag to build (e.g., "n7.1.2")
 * @param {string} options.gitRoot - Root directory for git repositories
 * @param {string} options.repoPath - Path where FFmpeg repository will be cloned
 * @param {boolean} [options.force=false] - Force clean rebuild
 * @returns {Promise<Object>} Build result
 */
export async function buildFFmpeg(options) {
  const { config, version, gitRoot, repoPath, force = false } = options;

  if (!config) throw new Error("buildFFmpeg requires a configuration object");
  if (!gitRoot) throw new Error("buildFFmpeg requires a gitRoot directory");
  if (!repoPath) throw new Error("buildFFmpeg requires a repoPath destination");
  if (!config.gitUrl) throw new Error("FFmpeg gitUrl is missing from the build configuration");

  ensureDirectory(gitRoot);

  const destination = path.resolve(repoPath);
  
  if (force && fs.existsSync(destination)) {
    log.info({ destination }, "force flag enabled - removing existing FFmpeg repository");
    fs.rmSync(destination, { recursive: true, force: true });
    log.info({ destination }, "existing repository removed");
  }
  
  log.info({ repoUrl: config.gitUrl, destination, version, force }, "preparing FFmpeg sources");
  const cloneResult = cloneGitRepository({
    repoUrl: config.gitUrl,
    destination,
    shallow: false, // FFmpeg needs full history
  });

  if (!cloneResult.ok && !cloneResult.skipped) {
    const msg = cloneResult.stderr || cloneResult.stdout || "unknown error";
    throw new Error(`Failed to clone FFmpeg repository: ${msg}`);
  }
  log.info({ destination, reused: cloneResult.skipped }, "repository ready");

  const artifactsRoot = path.resolve(gitRoot, "..", "artifacts", "ffmpeg");
  ensureDirectory(artifactsRoot);

  const trimmedVersion = typeof version === "string" ? version.trim() : "";
  const fallbackRefs = [];
  if (trimmedVersion) {
    // FFmpeg uses 'n' prefix for tags (e.g., n7.1.2)
    if (!trimmedVersion.startsWith("n")) {
      fallbackRefs.push(`n${trimmedVersion}`);
    } else {
      fallbackRefs.push(trimmedVersion.slice(1));
    }
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
    throw new Error(`Failed to check out FFmpeg reference. Attempts:\n${detail}`);
  }

  log.info({ ref: checkoutResult.ref, refType: checkoutResult.type }, "checked out FFmpeg reference");

  // TODO: Configure FFmpeg build
  // FFmpeg uses autoconf/configure script
  // Common options:
  // - --prefix=<artifactsRoot> (install location)
  // - --enable-shared (build shared libraries)
  // - --disable-static (don't build static libraries)
  // - --enable-pic (position independent code)
  // Platform-specific options:
  // Windows: May need MSYS2 or cross-compilation
  // Linux: Standard configure && make
  // macOS: Standard configure && make
  
  log.warn("FFmpeg build configuration not yet implemented - TODO");
  log.info({ artifactsRoot }, "FFmpeg preparation completed (build not implemented)");
  
  return { ok: true, name: 'FFmpeg', version };
}

/**
 * Configure FFmpeg build.
 * 
 * TODO: Implement FFmpeg configuration
 * - Detect platform (Windows/Linux/macOS)
 * - Set appropriate configure flags
 * - Handle MSYS2 on Windows if needed
 * - Configure codecs and features
 * 
 * @param {string} cwd - FFmpeg repository path
 * @param {string} artifactsRoot - Installation prefix for artifacts
 */
function configureFFmpeg(cwd, artifactsRoot) {
  log.info({ artifactsRoot }, "configuring FFmpeg");
  
  // TODO: Platform detection and configuration
  // const isWindows = process.platform === "win32";
  // const isLinux = process.platform === "linux";
  // const isMacOS = process.platform === "darwin";
  
  throw new Error("FFmpeg configuration not yet implemented");
}

/**
 * Build FFmpeg with make.
 * 
 * TODO: Implement FFmpeg build
 * - Run make with appropriate parallelism
 * - Handle platform-specific build tools
 * 
 * @param {string} cwd - FFmpeg repository path
 */
function buildFFmpegLibraries(cwd) {
  log.info("building FFmpeg");
  
  // TODO: Build implementation
  // const makeArgs = ["-j" + os.cpus().length];
  // const buildResult = runCommand("make", makeArgs, { cwd, stdio: "inherit" });
  
  throw new Error("FFmpeg build not yet implemented");
}

/**
 * Install FFmpeg artifacts to the artifacts directory.
 * 
 * TODO: Implement FFmpeg installation
 * - Run make install
 * - Verify libraries and headers are installed
 * 
 * @param {string} cwd - FFmpeg repository path
 */
function installFFmpeg(cwd) {
  log.info("installing FFmpeg artifacts");
  
  // TODO: Install implementation
  // const installResult = runCommand("make", ["install"], { cwd, stdio: "inherit" });
  
  throw new Error("FFmpeg install not yet implemented");
}

/**
 * Verify that FFmpeg artifacts were created successfully.
 * 
 * TODO: Implement artifact verification
 * - Check for presence of key headers (libavcodec, libavformat, etc.)
 * - Check for presence of libraries (.so, .dylib, .dll depending on platform)
 * 
 * @param {string} artifactsRoot - Artifacts directory
 */
function verifyFFmpegArtifacts(artifactsRoot) {
  log.info({ artifactsRoot }, "verifying FFmpeg artifacts");
  
  // TODO: Verification implementation
  
  throw new Error("FFmpeg artifact verification not yet implemented");
}

/**
 * Helper to throw build errors with context.
 * 
 * @param {string} label - Build step label
 * @param {Object} result - Command result from runCommand
 * @throws {Error} Always throws with formatted error message
 */
function fail(label, result) {
  const status = result.status ?? result.code ?? "unknown";
  const output = result.output || result.stderr || result.stdout || "";
  throw new Error(`[ffmpeg] ${label} failed (exit code ${status})\n${output}`);
}
