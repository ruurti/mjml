#!/usr/bin/env node
/**
 * Custom build script that produces:
 *  - dist/index.js         (non-minified, UMD)
 *  - dist/index.js.map     (source map for above)
 *  - dist/index.min.js     (minified, UMD)
 *  - dist/index.min.js.map (source map for above)
 *  - dist/index.d.ts       (TypeScript declarations)
 *  - locale/               (compiled locale files)
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const webpack = require(path.join(root, 'node_modules', 'webpack'));
const webpackConfig = require(path.join(root, 'webpack.config.js'));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(`\n${msg}\n`);
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Step 1: Webpack (JS bundles) ────────────────────────────────────────────

function runWebpack() {
  return new Promise((resolve, reject) => {
    log('Building JS bundles (non-minified + minified)...');
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats && stats.hasErrors()) {
        return reject(new Error(stats.toString({ colors: true })));
      }
      if (stats) {
        process.stdout.write(
          stats.toString({ colors: true, modules: false, entrypoints: false }) + '\n'
        );
      }
      resolve();
    });
  });
}

// ─── Step 2: Locale files ────────────────────────────────────────────────────

function buildLocale() {
  const localeSrc = path.join(root, 'src', 'locale');
  const localeDest = path.join(root, 'locale');

  if (!fs.existsSync(localeSrc)) {
    log('No locale source directory found, skipping locale build.');
    return;
  }

  log('Building locale files...');

  // Clean and recreate locale output directory
  if (fs.existsSync(localeDest)) {
    fs.rmSync(localeDest, { recursive: true, force: true });
  }
  fs.mkdirSync(localeDest, { recursive: true });

  // Copy all locale files
  copyDirSync(localeSrc, localeDest);

  // Compile each JS file with Babel (CommonJS output for compatibility)
  const babelBin = path.join(root, 'node_modules', '.bin', 'babel');
  const babelPresetEnv = path.join(
    root,
    'node_modules',
    'grapesjs-cli',
    'node_modules',
    '@babel',
    'preset-env'
  );
  const babelPresetEnvFallback = path.join(root, 'node_modules', '@babel', 'preset-env');

  const presetEnvPath = fs.existsSync(babelPresetEnv)
    ? babelPresetEnv
    : babelPresetEnvFallback;

  const localeFiles = fs.readdirSync(localeDest).filter(f => f.endsWith('.js'));
  let indexContent = '';

  for (const file of localeFiles) {
    const filePath = path.join(localeDest, file);
    const name = file.replace(/\.js$/, '');

    try {
      const compiled = execSync(
        `"${babelBin}" "${filePath}" --presets="${presetEnvPath}"`,
        { encoding: 'utf8' }
      );
      fs.writeFileSync(filePath, compiled);
    } catch (e) {
      // If babel compilation fails, keep the original (still functional)
      process.stderr.write(`Warning: Could not compile locale file ${file}: ${e.message}\n`);
    }

    indexContent += `export { default as ${name} } from './${name}'\n`;
  }

  fs.writeFileSync(path.join(localeDest, 'index.js'), indexContent);
  log('Locale files built successfully.');
}

// ─── Step 3: TypeScript declaration file ─────────────────────────────────────

function buildTypes() {
  const srcIndex = path.join(root, 'src', 'index.ts');
  if (!fs.existsSync(srcIndex)) {
    log('No src/index.ts found, skipping TypeScript declarations.');
    return;
  }

  log('Building TypeScript declaration file...');

  try {
    const dtsBundleGen = require(path.join(root, 'node_modules', 'dts-bundle-generator'));
    const result = dtsBundleGen.generateDtsBundle(
      [{ filePath: srcIndex, output: { noBanner: true } }],
      { preferredConfigPath: path.join(root, 'tsconfig.json') }
    );
    const distDir = path.join(root, 'dist');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'index.d.ts'), result[0]);
    log('TypeScript declaration file built successfully.');
  } catch (e) {
    process.stderr.write(`Warning: Could not generate TypeScript declarations: ${e.message}\n`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await runWebpack();
    buildLocale();
    buildTypes();
    log('Build completed successfully!');

    // Print output summary
    const distDir = path.join(root, 'dist');
    log('Output files:');
    for (const f of fs.readdirSync(distDir).sort()) {
      const size = fs.statSync(path.join(distDir, f)).size;
      const sizeStr = size > 1024 * 1024
        ? `${(size / 1024 / 1024).toFixed(2)} MB`
        : `${(size / 1024).toFixed(1)} KB`;
      process.stdout.write(`  dist/${f}  (${sizeStr})\n`);
    }
  } catch (err) {
    process.stderr.write(`\nBuild failed: ${err.message || err}\n`);
    process.exit(1);
  }
}

main();
