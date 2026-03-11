const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const banner = `/*! ${pkg.name} - ${pkg.version} */`;
const entry = path.resolve(__dirname, 'src/index');
const outputPath = path.resolve(__dirname, 'dist');
const modulePaths = [
  'node_modules',
  path.join(__dirname, 'node_modules'),
];

const commonRules = [
  {
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
    options: {
      context: __dirname,
      configFile: path.resolve(__dirname, 'tsconfig.json'),
    },
  },
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: [path.resolve(__dirname, 'src')],
    options: {
      cacheDirectory: true,
    },
  },
];

const commonOutput = {
  path: outputPath,
  library: pkg.name,
  libraryTarget: 'umd',
  globalObject: "typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this)",
};

/** @type {import('webpack').Configuration[]} */
module.exports = [
  // Non-minified (development) build → dist/index.js
  {
    entry,
    mode: 'development',
    devtool: 'source-map',
    output: {
      ...commonOutput,
      filename: 'index.js',
    },
    module: { rules: commonRules },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      modules: modulePaths,
    },
  },

  // Minified (production) build → dist/index.min.js
  {
    entry,
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: { evaluate: false },
            output: { comments: false, quote_style: 3, preamble: banner },
          },
        }),
      ],
    },
    output: {
      ...commonOutput,
      filename: 'index.min.js',
    },
    module: { rules: commonRules },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      modules: modulePaths,
    },
  },
];
