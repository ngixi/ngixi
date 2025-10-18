import fs from "node:fs";
import path from "node:path";
import {
  checkoutGitRef,
  cloneGitRepository,
  ensureDirectory,
  runCommand,
} from "./utilities.js";
import { scopedLogger } from "./logging.js";

const log = scopedLogger("ngixi-zigwin32gen");

export async function buildNgixiZigwin32gen(options) {
  const { config, version, gitRoot, repoPath, force = false } = options;

  if (!config) throw new Error("buildNgixiZigwin32gen requires a configuration object");
  if (!gitRoot) throw new Error("buildNgixiZigwin32gen requires a gitRoot directory");
  if (!repoPath) throw new Error("buildNgixiZigwin32gen requires a repoPath destination");
  if (!config.gitUrl) throw new Error("Ngixi zigwin32gen gitUrl is missing from the build configuration");

  ensureDirectory(gitRoot);

  const destination = path.resolve(repoPath);
  
  if (force && fs.existsSync(destination)) {
    log.info({ destination }, "force flag enabled - removing existing ngixi-zigwin32gen repository");
    fs.rmSync(destination, { recursive: true, force: true });
    log.info({ destination }, "existing repository removed");
  }
  
  log.info({ repoUrl: config.gitUrl, destination, version, force }, "preparing ngixi-zigwin32gen sources");
  const cloneResult = cloneGitRepository({
    repoUrl: config.gitUrl,
    destination,
    shallow: true,
  });

  if (!cloneResult.ok && !cloneResult.skipped) {
    const msg = cloneResult.stderr || cloneResult.stdout || "unknown error";
    throw new Error(`Failed to clone ngixi-zigwin32gen repository: ${msg}`);
  }
  log.info({ destination, reused: cloneResult.skipped }, "repository ready");

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
    throw new Error(`Failed to check out ngixi-zigwin32gen reference. Attempts:\n${detail}`);
  }

  log.info({ ref: checkoutResult.ref, refType: checkoutResult.type }, "checked out ngixi-zigwin32gen reference");

  const artifactsRoot = path.resolve(gitRoot, "..", "artifacts", "zigwin32");
  ensureDirectory(artifactsRoot);

  log.info({ artifactsRoot }, "building ngixi-zigwin32gen with zig build");
  const buildResult = runCommand("zig", ["build", "--prefix", artifactsRoot], {
    cwd: destination,
    stdio: "inherit",
  });

  if (!buildResult.ok) {
    const msg = buildResult.stderr || buildResult.stdout || "unknown error";
    throw new Error(`Failed to build ngixi-zigwin32gen:\n${msg}`);
  }

  log.info({ artifactsRoot }, "ngixi-zigwin32gen build completed successfully");
  
  return { ok: true, name: 'ngixi-zigwin32gen', version };
}
