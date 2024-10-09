import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findDirectories, createAtlas, consoleLog, consoleSuccess, consoleError } from './utils.js';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../assets');
const outputFiles = [];

// Atlas generation function
async function generateAtlases() {
  const artDirs = findDirectories(assetsDir, 'art-');

  for (const artDir of artDirs) {
    const artDirPath = path.join(assetsDir, artDir);
    const atlasSourceFolders = findDirectories(artDirPath, '_');

    for (const atlasSourceFolder of atlasSourceFolders) {
      const srcPath = path.join(artDirPath, atlasSourceFolder);
      const destFolder = path.join(assetsDir, '_art-optimized', artDir);

      // Ensure that folder exists
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      const imageOutputPath = path.join(destFolder, atlasSourceFolder);

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
