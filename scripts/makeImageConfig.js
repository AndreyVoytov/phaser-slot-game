const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { consoleError, consoleWarning, consoleSuccess, consoleLog } = require('./utils');

// Define paths to directories
const assetsDir = path.join(__dirname, '..', 'assets');
const optimizedDir = path.join(assetsDir, '_art-optimized');

// Function to recursively get all files from a directory and its subdirectories
const getAllFilesRecursively = (dir, files = []) => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFilesRecursively(fullPath, files);
        } else {
            files.push(fullPath);
        }
    });
    return files;
};

// Function to compute the hash of a file
const computeFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5'); // You can use 'sha256' or another algorithm if preferred
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};

// Function to read and parse hash.txt
const readHashFile = (hashFilePath) => {
    const hashData = new Map(); // Map<relativePath, hash>

    if (!fs.existsSync(hashFilePath)) {
        consoleError('Error: File **hash.txt** not found at **_art-optimized** folder, using original images. Try to call \'npm run optimize\'')
        return hashData;
    }
    const content = fs.readFileSync(hashFilePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const [relativePath, hash] = line.trim().split(/\s+/);
        if (relativePath && hash) {
            hashData.set(relativePath.replace(/\\/g, '/'), hash);
        }
    });

    return hashData;
};

// Read the hash.txt file
const hashFilePath = path.join(optimizedDir, 'hash.txt');
const hashData = readHashFile(hashFilePath);

// Function to check for duplicate keys and issue warnings
const allKeys = new Set(); // To store all image names and atlas file names
const checkForDuplicateKeys = (key, fileName) => {
    if (allKeys.has(key)) {
        consoleError(`Error: Duplicate key found for image **${key}** in file ${fileName.split('assets')[1]}`);
    } else {
        allKeys.add(key);
    }
};

// Function to process an art folder
const processArtFolder = (folder) => {
    const folderSuffix = path.basename(folder).replace('art-', '').toLowerCase(); // Get the folder name (e.g., 'main', 'loading')

    const allFiles = getAllFilesRecursively(folder); // Get all files in the folder

    // Filter images into two categories:
    const imageFiles = allFiles.filter(
        file => (file.endsWith('.png') || file.endsWith('.jpg')) && !file.includes('_')
    ); // Regular images
    const customImageFiles = allFiles.filter(
        file => file.includes('_') && (file.endsWith('.png') || file.endsWith('.jpg'))
    ); // Images in folders with prefix '_'
    const jsonFiles = allFiles.filter(file => file.endsWith('.json')); // Atlases (JSON files)

    // Initialize imageList as a Map
    let imageList = new Map();

    imageFiles.forEach(file => {
        const name = path.basename(file, path.extname(file)); // File name without extension
        const relativePath = path.relative(assetsDir, file).replace(/\\/g, '/');
        const optimizedImagePath = path.join(optimizedDir, relativePath);

        // Get the hash from hash.txt
        const hashEntry = hashData.get(`/${relativePath}`);

        // Compute hash of the source file
        const sourceHash = computeFileHash(file);

        // Validate the hash
        let useOptimized = false;
        if (hashEntry && hashEntry === sourceHash) {
            useOptimized = true;
        } else
         if (hashData.length > 0)
        {  
            consoleWarning(
                `Warning: Image hash mismatch for **${file.split('assets')[1]}**, using original image`
            );
        }

        // Compute hash of the optimized or original file
        let fileToUse;
        if (useOptimized && fs.existsSync(optimizedImagePath)) {
            fileToUse = optimizedImagePath;
        } else {
            fileToUse = file;
        }
        const optimizedHash = computeFileHash(fileToUse);

        // Append hash to path
        const filePathWithHash = `assets/${relativePath}?${optimizedHash}`;

        // Check for duplicates
        checkForDuplicateKeys(name, file);

        imageList.set(name, filePathWithHash);
    });

    return {
        folderSuffix,
        imageList,          // Regular images
        customImageFiles,   // Images from subfolders with '_'
        jsonFiles           // Atlases
    };
};

// Corrected processCustomFolders function
const processCustomFolders = (customImageFiles, folderSuffix) => {
    const customAtlasData = [];
    const customImageList = new Map();

    // Group images by their subfolder
    const imagesBySubFolder = new Map();

    customImageFiles.forEach(file => {
        const subFolderPath = path.dirname(file);
        if (!imagesBySubFolder.has(subFolderPath)) {
            imagesBySubFolder.set(subFolderPath, []);
        }
        imagesBySubFolder.get(subFolderPath).push(file);
    });

    imagesBySubFolder.forEach((files, subFolderPath) => {
        const jsonFileName = `${path.basename(subFolderPath)}.json`; // JSON file name for the atlas

        // Corrected path calculation
        const optimizedJsonFilePath = path.join(
            optimizedDir,
            path.relative(assetsDir, path.dirname(subFolderPath)),
            jsonFileName
        );

        let useOptimizedAtlas = true;

        // Validate each source image
        for (const file of files) {
            const relativePath = `/${path.relative(assetsDir, file).replace(/\\/g, '/')}`;
            const hashEntry = hashData.get(relativePath);

            // Compute hash of the source file
            const sourceHash = computeFileHash(file);

            if (!hashEntry || hashEntry !== sourceHash) {
                if(hashData.length > 0){
                    consoleWarning(
                        `Warning: Atlas hash mismatch for file **${file.split('assets')[1]}**, using individual images`
                    );
                }
                useOptimizedAtlas = false;
                break; // No need to check further if one image doesn't match
            }
        }

        if (useOptimizedAtlas && fs.existsSync(optimizedJsonFilePath)) {
            // Compute hash of the optimized atlas JSON file
            const optimizedHash = computeFileHash(optimizedJsonFilePath);

            const atlasName = jsonFileName.replace('.json', '');

            // Check for duplicates
            checkForDuplicateKeys(atlasName, optimizedJsonFilePath);

            customAtlasData.push({
                name: atlasName,
                path: `assets/${path.relative(assetsDir, optimizedJsonFilePath).replace(/\\/g, '/')}?${optimizedHash}`
            });
        } else {
            // Add individual images
            files.forEach(file => {
                const name = path.basename(file, path.extname(file));
                const relativePath = path.relative(assetsDir, file).replace(/\\/g, '/');
                const optimizedImagePath = path.join(optimizedDir, relativePath);

                // Get the hash from hash.txt
                const hashEntry = hashData.get(`/${relativePath}`);

                // Compute hash of the source file
                const sourceHash = computeFileHash(file);

                // Validate the hash
                let useOptimized = false;
                if (hashEntry && hashEntry === sourceHash) {
                    useOptimized = true;
                } else 
                    if (hashData.length > 0)
                    {
                    consoleLog(
                        `Used individual image ${file.split('assets')[1]}`
                    );
                }

                // Compute hash of the optimized or original file
                let fileToUse;
                if (useOptimized && fs.existsSync(optimizedImagePath)) {
                    fileToUse = optimizedImagePath;
                } else {
                    fileToUse = file;
                }
                const optimizedHash = computeFileHash(fileToUse);

                // Append hash to path
                const filePathWithHash = `assets/${relativePath}?${optimizedHash}`;

                // Check for duplicates
                checkForDuplicateKeys(name, file);

                customImageList.set(name, filePathWithHash);
            });
        }
    });

    return { customAtlasData, customImageList };
};

// Get all folders starting with 'art-' in the assets directory
const artFolders = fs.readdirSync(assetsDir)
    .filter(folder => folder.startsWith('art-'))
    .map(folder => path.join(assetsDir, folder));

// Generate all maps
let allAtlasListEntries = [];
let imageListByScene = new Map();
let atlasListByScene = new Map();
let allAtlasByImageMappingEntries = [];

// Process each folder
artFolders.forEach(folder => {
    const { folderSuffix, imageList, customImageFiles } = processArtFolder(folder);

    // Process images from folders with prefix '_'
    const { customAtlasData, customImageList } = processCustomFolders(customImageFiles, folderSuffix);

    // Initialize atlasList for the scene
    let atlasList = new Map();

    // If an atlas is found, exclude adding individual images from this folder
    if (customAtlasData.length > 0) {
        // If an atlas exists, do not add individual images to IMAGE_LIST_BY_SCENE
        customAtlasData.forEach(atlas => {
            // Check for duplicates before adding to ATLAS_LIST_BY_SCENE
            if (!atlasList.has(atlas.name)) {
                allAtlasListEntries.push(`    ['${atlas.name}', '${atlas.path}']`);
                atlasList.set(atlas.name, atlas.path);
            }
        });
    } else {
        // If no atlas is found, add individual images
        customImageList.forEach((value, key) => {
            imageList.set(key, value);
        });
    }

    // After processing images, add regular images to IMAGE_LIST_BY_SCENE
    imageListByScene.set(folderSuffix, imageList);

    // Add atlasList to ATLAS_LIST_BY_SCENE
    atlasListByScene.set(folderSuffix, atlasList);
});

// Generate ATLAS_BY_IMAGE_MAPPING and check for duplicates
atlasListByScene.forEach((atlasList, scene) => {
    atlasList.forEach((atlasPath, atlasName) => {
        // Read the atlas JSON file
        const atlasFullPath = path.join(assetsDir, atlasPath.split('?')[0].replace('assets/', ''));
        const atlasData = JSON.parse(fs.readFileSync(atlasFullPath, 'utf8'));

        if(atlasData.textures){
            atlasData.textures[0].frames.forEach(frame => {
                const key = frame.filename;
                checkForDuplicateKeys(key, atlasFullPath);  // Check for duplicates
                allAtlasByImageMappingEntries.push(`    ['${key}', '${atlasName}']`);
            });
        }
    });
});

// Function to format Map with indentation
const formatMap = (map) => {
    if (map.size === 0) {
        return '    // No entries';
    }
    return Array.from(map.entries())
        .map(([key, value]) => `        ['${key}', '${value}']`)
        .join(',\n');
};

// Form the content of the final file
const fileContent = `// auto-generated

export const ALL_ATLASES_LIST: Map<string, string> = new Map([
${allAtlasListEntries.join(',\n')}
]);

export const IMAGE_LIST_BY_SCENE: Map<string, Map<string, string>> = new Map([
${Array.from(imageListByScene.entries())
    .map(([key, map]) => `    ['${key}', new Map([\n${formatMap(map)}\n    ])]`)
    .join(',\n')}
]);

export const ATLAS_LIST_BY_SCENE: Map<string, Map<string, string>> = new Map([
${Array.from(atlasListByScene.entries())
    .map(([key, map]) => `    ['${key}', new Map([\n${formatMap(map)}\n    ])]`)
    .join(',\n')}
]);

export const ATLAS_BY_IMAGE_MAPPING: Map<string, string> = new Map([
${allAtlasByImageMappingEntries.join(',\n')}
]);
`;

// Write the file
const outputFilePath = path.join(__dirname, '..', 'src', 'config', 'ImageConfig.ts');
fs.writeFileSync(outputFilePath, fileContent, 'utf8');
consoleSuccess(`ImageConfig.ts has been generated at ${outputFilePath}`);
