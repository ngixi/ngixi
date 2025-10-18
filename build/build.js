import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { AggregateToolError, ensureDirectory, ensureTooling, ensurePython3, checkCPUArchitecture, checkWindowsSDK, checkMSVC } from './scripts/utilities.js';
import { buildWasmtime } from './scripts/buildWasmtime.js';
import { buildNgixiZigwin32gen } from './scripts/buildNgixi_zigwin32gen.js';
import { buildDawn } from './scripts/buildDawn.js';
import { buildFFmpeg } from './scripts/buildFFmpeg.js';
import { getRunId, logFilePath, scopedLogger } from './scripts/logging.js';

const MINIMUM_VERSIONS = {
	node: '22.0.0',
	cmake: '3.16.0',
	cargo: '1.75.0',
	zig: '0.15.1',
	clang: '12.0.0',
	ninja: '1.12.0',
	go: '1.23.0'
};

const TOOLCHAIN_REQUIREMENTS = [
	{
		name: 'Node.js',
		program: 'node',
		minimumVersion: MINIMUM_VERSIONS.node,
		hint: 'Install Node.js 22 or newer from https://nodejs.org/en/download/'
	},
	{
		name: 'Git',
		program: 'git',
		hint: 'Install Git from https://git-scm.com/downloads'
	},
	{
		name: 'CMake',
		program: 'cmake',
		minimumVersion: MINIMUM_VERSIONS.cmake,
		hint: 'Install a recent CMake from https://cmake.org/download/'
	},
	{
		name: 'Cargo',
		program: 'cargo',
		minimumVersion: MINIMUM_VERSIONS.cargo,
		hint: 'Install a recent Rust toolchain via https://rustup.rs/'
	},
	{
		name: 'Zig',
		program: 'zig',
		versionArgs: ['version'],
		minimumVersion: MINIMUM_VERSIONS.zig,
		hint: 'Install Zig 0.15.1 or newer from https://ziglang.org/download/'
	},
	{
		name: 'Clang',
		program: 'clang',
		minimumVersion: MINIMUM_VERSIONS.clang,
		hint: 'Install Clang 12 or newer with C++20 support. On Windows, install Visual Studio 2022+ or LLVM from https://releases.llvm.org/'
	},
	{
		name: 'Ninja',
		program: 'ninja',
		minimumVersion: MINIMUM_VERSIONS.ninja,
		hint: 'Install Ninja 1.12 or newer from https://ninja-build.org/ or via package manager'
	},
	{
		name: 'Go',
		program: 'go',
		versionArgs: ['version'],
		minimumVersion: MINIMUM_VERSIONS.go,
		hint: 'Install Go 1.23 or newer from https://go.dev/dl/',
		parseVersion: (stdout) => {
			const match = stdout.match(/go version go(\d+\.\d+(?:\.\d+)?)/);
			return match ? match[1] : null;
		}
	},
	{
		name: 'depot_tools',
		program: 'gclient',
		hint: 'Install depot_tools and add to PATH. See https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html',
		required: true
	},
	{
		name: 'Python 3',
		program: 'python3',
		minimumVersion: '3.11.0',
		hint: 'Install Python 3.11 or newer, or install pyenv to manage Python versions',
		customCheck: () => ensurePython3()
	},
	// Windows-specific requirements
	{
		name: 'CPU Architecture (x64)',
		platforms: ['win32'],
		customCheck: () => checkCPUArchitecture('x64')
	},
	{
		name: 'Windows SDK',
		platforms: ['win32'],
		customCheck: () => checkWindowsSDK()
	},
	{
		name: 'MSVC',
		platforms: ['win32'],
		customCheck: () => checkMSVC()
	}
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, 'buildConfig.json');
const BUILD_ROOT = __dirname;
const GIT_TEMP_ROOT = path.join(BUILD_ROOT, '.git.temp');
const log = scopedLogger('build');

async function loadBuildConfig(configPath) {
	const raw = await readFile(configPath, 'utf8');
	return JSON.parse(raw);
}

async function main() {
	const argv = yargs(hideBin(process.argv))
		.strict()
		.option('mode', {
			type: 'string',
			choices: ['debug', 'release'],
			describe: 'Select the build mode',
			default: 'debug'
		})
		.option('wasmtimeVersion', {
			type: 'string',
			describe: 'Override the default Wasmtime dependency version'
		})
		.option('force', {
			type: 'boolean',
			describe: 'Force a clean rebuild by removing and recloning dependencies',
			default: false
		})
		.option('toolcheck', {
			type: 'boolean',
			describe: 'Only run toolchain validation and exit',
			default: false
		})
		.help()
		.parse();

	const buildConfig = await loadBuildConfig(CONFIG_PATH);
	const wasmtimeConfig = buildConfig?.deps?.wasmtime ?? {};
	const wasmtimeVersion = argv.wasmtimeVersion ?? wasmtimeConfig.defaultVersion;
	const ngixiZigwin32genConfig = buildConfig?.deps?.['ngixi.zigwin32gen'] ?? {};
	const ngixiZigwin32genVersion = ngixiZigwin32genConfig.defaultVersion;
	const googleDawnConfig = buildConfig?.deps?.['google/dawn'] ?? {};
	const googleDawnVersion = googleDawnConfig.defaultVersion;
	const ffmpegConfig = buildConfig.deps['ffmpeg'];
	const ffmpegVersion = argv.ffmpegVersion || ffmpegConfig?.defaultVersion;
	ensureDirectory(GIT_TEMP_ROOT);

	log.info(
		{ mode: argv.mode, wasmtimeVersion, ngixiZigwin32genVersion, googleDawnVersion, ffmpegVersion, configVersion: buildConfig.version, runId: getRunId(), logFilePath },
		'build configuration resolved'
	);

	if (!wasmtimeVersion) {
		throw new Error('Wasmtime version is required but was not provided.');
	}

	if (!ngixiZigwin32genVersion) {
		throw new Error('Ngixi zigwin32gen version is required but was not provided.');
	}

	if (!googleDawnVersion) {
		throw new Error('Dawn version is required but was not provided.');
	}
	
	if (!ffmpegVersion) {
		throw new Error('FFmpeg version is required but was not provided.');
	}

	let toolReports;
	let toolingFailed = false;
	try {
		toolReports = ensureTooling(TOOLCHAIN_REQUIREMENTS);
	} catch (error) {
		if (error instanceof AggregateToolError) {
			toolReports = error.reports;
			toolingFailed = true;
		} else {
			throw error;
		}
	}

	// Print tooling summary
	console.log('\n' + '='.repeat(70));
	console.log('TOOLCHAIN VALIDATION');
	console.log('='.repeat(70));
	
	const satisfied = toolReports.filter(r => r.ok || r.skipped);
	const unsatisfied = toolReports.filter(r => !r.ok && !r.skipped);
	
	if (satisfied.length > 0) {
		console.log('\n✓ Satisfied Requirements:');
		for (const report of satisfied) {
			const details = [];
			if (report.version) details.push(`v${report.version}`);
			if (report.arch) details.push(report.arch);
			if (report.installedViaPyenv) details.push('via pyenv');
			if (report.skipped) details.push('skipped');
			
			const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
			console.log(`  \x1b[32m✓\x1b[0m ${report.name}${detailStr}`);
			if (report.path && !report.skipped) {
				console.log(`    ${report.path}`);
			}
			
			// Show bin path for Windows SDK
			if (report.binPath) {
				console.log(`    \x1b[2mBin: ${report.binPath}\x1b[0m`);
			}
			
			// Show include paths (array, typically for Windows SDK)
			if (report.includePaths && report.includePaths.length > 0) {
				console.log(`    \x1b[2mInc: ${report.includePaths.length} paths\x1b[0m`);
			}
			
			// Show library paths for Windows SDK (array)
			if (report.libPaths && report.libPaths.length > 0) {
				console.log(`    \x1b[2mLib: ${report.libPaths.length} paths\x1b[0m`);
			}
			
			// Show library path for MSVC (single path)
			if (report.libPath) {
				console.log(`    \x1b[2mLib: 1 path\x1b[0m`);
			}
		}
	}
	
	if (unsatisfied.length > 0) {
		console.log('\n✗ Unsatisfied Requirements:');
		for (const report of unsatisfied) {
			console.log(`  \x1b[31m✗\x1b[0m ${report.name}`);
			if (report.reason) {
				console.log(`    Reason: ${report.reason}`);
			}
			if (report.version) {
				console.log(`    Found: v${report.version}`);
			}
			if (report.hint) {
				console.log(`    \x1b[33mHint:\x1b[0m ${report.hint}`);
			}
		}
	}
	
	console.log('\n' + '='.repeat(70));
	console.log(`Summary: ${satisfied.length} satisfied, ${unsatisfied.length} unsatisfied`);
	console.log('='.repeat(70) + '\n');
	
	if (argv.toolcheck) {
		log.info('toolcheck mode: exiting after toolchain validation');
		if (toolingFailed) {
			process.exitCode = 1;
		}
		return;
	}
	
	if (toolingFailed) {
		log.error('tooling requirements not met');
		process.exitCode = 1;
		return;
	}
	
	for (const report of toolReports) {
		log.info({ name: report.name, version: report.version, path: report.path, installedViaPyenv: report.installedViaPyenv, arch: report.arch }, 'tool availability confirmed');
	}

	log.info({ mode: argv.mode, wasmtimeVersion, ngixiZigwin32genVersion, googleDawnVersion, configVersion: buildConfig.version }, 'beginning build orchestration');

	const buildResults = [];
	const wasmtimeRepoPath = path.join(GIT_TEMP_ROOT, 'wasmtime');

	log.info('building Wasmtime');
	try {
		const result = await buildWasmtime({
			config: wasmtimeConfig,
			version: wasmtimeVersion,
			gitRoot: GIT_TEMP_ROOT,
			repoPath: wasmtimeRepoPath,
			force: argv.force
		});
		buildResults.push(result);
		log.info({ wasmtimeVersion }, 'Wasmtime build completed');
	} catch (error) {
		buildResults.push({ ok: false, name: 'Wasmtime', version: wasmtimeVersion, error: error.message });
		log.error({ err: error }, 'Wasmtime build failed');
		throw error;
	}

	const ngixiZigwin32genRepoPath = path.join(GIT_TEMP_ROOT, 'ngixi-zigwin32gen');

	log.info('building ngixi-zigwin32gen');
	try {
		const result = await buildNgixiZigwin32gen({
			config: ngixiZigwin32genConfig,
			version: ngixiZigwin32genVersion,
			gitRoot: GIT_TEMP_ROOT,
			repoPath: ngixiZigwin32genRepoPath,
			force: argv.force
		});
		buildResults.push(result);
		log.info({ ngixiZigwin32genVersion }, 'ngixi-zigwin32gen build completed');
	} catch (error) {
		buildResults.push({ ok: false, name: 'ngixi-zigwin32gen', version: ngixiZigwin32genVersion, error: error.message });
		log.error({ err: error }, 'ngixi-zigwin32gen build failed');
		throw error;
	}

	const dawnRepoPath = path.join(GIT_TEMP_ROOT, 'dawn');

	log.info('building Dawn');
	try {
		const result = await buildDawn({
			config: googleDawnConfig,
			version: googleDawnVersion,
			gitRoot: GIT_TEMP_ROOT,
			repoPath: dawnRepoPath,
			force: argv.force
		});
		buildResults.push(result);
		log.info({ googleDawnVersion }, 'Dawn build completed');
	} catch (error) {
		buildResults.push({ ok: false, name: 'Dawn', version: googleDawnVersion, error: error.message });
		log.error({ err: error }, 'Dawn build failed');
		throw error;
	}

	const ffmpegRepoPath = path.join(GIT_TEMP_ROOT, 'ffmpeg');
	
	log.info('building FFmpeg');
	try {
		const result = await buildFFmpeg({
			config: ffmpegConfig,
			version: ffmpegVersion,
			gitRoot: GIT_TEMP_ROOT,
			repoPath: ffmpegRepoPath,
			force: argv.force
		});
		buildResults.push(result);
		log.info({ ffmpegVersion }, 'FFmpeg build completed');
	} catch (error) {
		buildResults.push({ ok: false, name: 'FFmpeg', version: ffmpegVersion, error: error.message });
		log.error({ err: error }, 'FFmpeg build failed');
		throw error;
	}

	log.info('build pipeline completed successfully');
	
	// Print build summary
	console.log('\n' + '='.repeat(70));
	console.log('BUILD SUMMARY');
	console.log('='.repeat(70));
	for (const result of buildResults) {
		const status = result.ok ? '✓ Complete' : '✗ Failed';
		const statusColor = result.ok ? '\x1b[32m' : '\x1b[31m'; // Green or Red
		const resetColor = '\x1b[0m';
		console.log(`${result.name.padEnd(30)} ${statusColor}${status}${resetColor}`);
		if (result.version) {
			console.log(`  Version: ${result.version}`);
		}
		if (!result.ok && result.error) {
			console.log(`  Error: ${result.error}`);
		}
	}
	console.log('='.repeat(70) + '\n');
}

main().catch((error) => {
	log.error({ err: error }, 'build pipeline failed');
	process.exit(1);
});
