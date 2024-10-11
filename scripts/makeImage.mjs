import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { findDirectories, createAtlas, consoleLog, consoleSuccess, consoleError, getAllFilesRecursively } from './utils.js';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import { setHash } from './hashHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../assets');
const outputFiles = [];

// Atlas generation function
async function copyImages() {
  const artDirs = findDirectories(assetsDir, 'art-');

  for (const artDir of artDirs) {
    const artDirPath = path.join(assetsDir, artDir);
    const allFiles = getAllFilesRecursively(artDirPath);
    const imageFiles = allFiles.filter(
        file => (file.endsWith('.png') || file.endsWith('.jpg')) && !file.includes('_')
    );

    for (const imageFile of imageFiles) {
      let outputPath = path.join(path.relative(artDirPath, imageFile));
      outputPath = path.join(assetsDir, '_art-optimized', artDir, outputPath);

      // Ensure that folder exists
      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      }

      // await fsPromises.access(imageFile, fs.constants.R_OK);
      // await fsPromises.access(path.dirname(outputPath), fs.constants.W_OK);
      setHash(path.relative(assetsDir, imageFile));

      await fsPromises.copyFile(imageFile, outputPath);

      outputFiles.push(outputPath);
    }
  }
}

// Image compression function (TODO move helperImage)
async function compressImages(inputFiles) {
  try {
    await Promise.all(
      inputFiles.map(async (filePath) => {
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
        consoleLog(`Compression completed for image: ${filePath.split('assets')[1]}`);
      })
    );
    consoleSuccess('All images compressed');
  } catch (error) {
    consoleError('Error during image compression:' + error);
  }
}

// Main async functions
(async () => {
  try {
    await copyImages();
    await compressImages(outputFiles);
  } catch (error) {
    consoleError('Error during atlas processing:' + error);
  }
})();
