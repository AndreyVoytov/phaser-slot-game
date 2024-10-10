import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findDirectories, createAtlas, consoleLog, consoleSuccess, consoleError, getAllFilesRecursively } from './utils.js';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../assets');
const outputFiles = [];

function getAtlasDirectories(dir, files = []) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()){
        if(item.startsWith('_')) {
          files.push(fullPath);
        } else {
          getAtlasDirectories(fullPath, files);
        }
      }
  });
  return files;
};

// Atlas generation function
async function generateAtlases() {
  const artDirs = findDirectories(assetsDir, 'art-');

  for (const artDir of artDirs) {
    const artDirPath = path.join(assetsDir, artDir);
    const atlasSourceFolders = getAtlasDirectories(artDirPath); 
    
    for (const atlasSourceFolder of atlasSourceFolders) {
      const atlasSourceFolderRelative = path.relative(artDirPath, atlasSourceFolder);
      const srcPath = atlasSourceFolder;
      const destFolder = path.join(assetsDir, '_art-optimized', artDir);

      // Ensure that folder exists
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      const imageOutputPath = path.join(destFolder, atlasSourceFolderRelative);

      // Waiting for atlas generation to complete
      await createAtlas(srcPath, imageOutputPath);
      outputFiles.push(`${imageOutputPath}.png`);
    }
  }
}

// Atlas compression function
async function compressAtlases() {
  try {
    await Promise.all(
      outputFiles.map(async (filePath) => {
        const destinationDir = path.dirname(filePath);

        await imagemin([filePath], {
          destination: destinationDir,
          plugins: [
            imageminPngquant({
              quality: [0.6, 0.8],
            }),
            imageminMozjpeg({
              quality: 70,
            }),
          ],
        });
        consoleLog(`Compression completed for atlas: ${filePath.split('assets')[1]}`);
      })
    );
    consoleSuccess('All atlases compressed');
  } catch (error) {
    consoleError('Error during atlas compression:' + error);
  }
}

// Main async functions
(async () => {
  try {
    await generateAtlases();
    await compressAtlases();
  } catch (error) {
    consoleError('Error during atlas processing:' + error);
  }
})();
