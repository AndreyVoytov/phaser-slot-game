import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findDirectories, createAtlas, consoleLog, consoleSuccess, consoleError } from './utils.js';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import { setHash } from './hashHelper.js';

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
      
      // Filter images to make atlas
      const images = fs.readdirSync(srcPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
      })
      .map(file => path.join(srcPath, file));
      if (images.length === 0) {
        return reject(new Error('No images found in the specified folder ' + srcPath.split('assets')[1]));
      }

      // Remember hash
      images.forEach(image => {
        setHash(path.relative(assetsDir, image));
      })

      // Waiting for atlas generation to complete
      const imageOutputPath = path.join(destFolder, atlasSourceFolderRelative);
      await createAtlas(images, imageOutputPath);
      outputFiles.push(`${imageOutputPath}.png`);
    }
  }
}

// Image compression function (TODO move to utils)
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
    consoleSuccess('All atlases compressed');
  } catch (error) {
    consoleError('Error during image compression:' + error);
  }
}

// Main async functions
(async () => {
  try {
    await generateAtlases();
    await compressImages(outputFiles);
  } catch (error) {
    consoleError('Error during atlas processing:' + error);
  }
})();
