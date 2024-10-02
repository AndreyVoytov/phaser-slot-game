const fs = require('fs');
const path = require('path');
const SpritesmithPlugin = require('webpack-spritesmith');

function findArtDirectories(baseDir) {
  const artDirs = [];
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('art-')) {
      artDirs.push(entry.name);
    }
  }
  return artDirs;
}

function findSpriteFoldersInArtDir(artDirPath) {
  const spriteFolders = [];
  const entries = fs.readdirSync(artDirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const name = entry.name;
      if (name.startsWith('_') && name !== '_art-optimized') {
        spriteFolders.push(name);
      }
    }
  }
  return spriteFolders;
}

const assetsDir = path.resolve(__dirname, '../assets');

const artDirs = findArtDirectories(assetsDir);

const spritePlugins = [];

for (const artDir of artDirs) {
  const artDirPath = path.join(assetsDir, artDir);
  const spriteFolders = findSpriteFoldersInArtDir(artDirPath);

  for (const spriteFolder of spriteFolders) {
    const srcPath = path.join(artDirPath, spriteFolder);
    const destFolder = path.join(assetsDir, '_art-optimized', artDir);

    // Убедимся, что папка назначения существует
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    const imageOutputPath = path.join(destFolder, `${spriteFolder}.png`);
    const cssOutputPath = path.join(destFolder, `${spriteFolder}.json`);

    const plugin = new SpritesmithPlugin({
      src: {
        cwd: srcPath,
        glob: '*.*',
      },
      target: {
        image: imageOutputPath,
        css: [
          [cssOutputPath, { format: 'custom_json' }]
        ]
      },
      apiOptions: {
        cssImageRef: `${spriteFolder}.png`,
        generateSpriteName: function (fullFilePath) {
          return path.basename(fullFilePath, path.extname(fullFilePath));
        },
        handlebarsHelpers: {
          trimExtension: function (name) {
            return path.basename(name, path.extname(name));
          },
          escapedImageRef: function () {
            return this.spritesheet.image.replace(/\\/g, '/');
          }
        }
      },
      customTemplates: {
        'custom_json': path.resolve(__dirname, './json-template.handlebars')
      }
    });

    spritePlugins.push(plugin);
  }
}

module.exports = spritePlugins;
