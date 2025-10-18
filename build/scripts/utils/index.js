/**
 * Unified utilities index - exports all utility modules
 */

// Command execution utilities
export {
  resolveCommand,
  buildEnv,
  runCommand,
  runWithCrossEnv,
  runCargo,
  runPyenv,
} from './command-runner.js';

// Tooling check utilities
export {
  AggregateToolError,
  ensureTooling,
  checkTool,
} from './tooling-checks.js';

// Platform-specific check utilities
export {
  checkWindowsSDK,
  checkMSVC,
  checkCPUArchitecture,
  ensurePython3,
} from './platform-checks.js';

// File system utilities
export {
  ensureDirectory,
  ensureSubdirectory,
} from './file-system.js';

// Git operation utilities
export {
  cloneGitRepository,
  updateGitSubmodules,
  checkoutGitRef,
} from './git-operations.js';

// Version parsing and comparison utilities
export {
  compareVersions,
  normalizeVersion,
  defaultVersionParser,
  stripVersionPrefix,
  parseLeadingInteger,
} from './version-utils.js';
