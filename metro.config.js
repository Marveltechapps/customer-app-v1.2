const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo
 * https://docs.expo.dev/guides/customizing-metro
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Configure SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

const projectRoot = __dirname;
const reactDir = path.dirname(require.resolve('react/package.json', { paths: [projectRoot] }));
const reactSubpath = (name) => path.join(reactDir, name);

// Ensure node_modules is watched when using custom resolveRequest (e.g. memoize-one)
// so Metro can compute SHA-1 for resolved files.
config.watchFolders = [
  ...(config.watchFolders || []),
  path.join(projectRoot, 'node_modules'),
];

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  resolveRequest(context, moduleName, platform) {
    // Resolve React JSX runtimes to their actual files so Metro doesn't fail on
    // React 19's package.json "exports" (avoids "invalid package.json" / "Unable
    // to resolve react/jsx-dev-runtime" warnings and bundling failures).
    if (moduleName === 'react/jsx-dev-runtime') {
      return { type: 'sourceFile', filePath: reactSubpath('jsx-dev-runtime.js') };
    }
    if (moduleName === 'react/jsx-runtime') {
      return { type: 'sourceFile', filePath: reactSubpath('jsx-runtime.js') };
    }
    // Resolve memoize-one to its CJS file (Metro can fail to resolve "main" for some packages).
    if (moduleName === 'memoize-one') {
      const filePath = path.resolve(
        projectRoot,
        'node_modules/memoize-one/dist/memoize-one.cjs.js'
      );
      return { type: 'sourceFile', filePath };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
