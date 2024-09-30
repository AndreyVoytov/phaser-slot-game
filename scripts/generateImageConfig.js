const fs = require('fs');
const path = require('path');

// Определяем пути к директориям
const assetsDir = path.join(__dirname, '..', 'assets');
const optimizedDir = path.join(assetsDir, '_art-optimized');

// Функция для рекурсивного получения всех файлов из директории и её подпапок
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

// Функция для обработки папки с артом, проверяя сначала _art-optimized
const processArtFolder = (folder) => {
    const folderSuffix = path.basename(folder).replace('art-', '').toLowerCase(); // Получаем название папки (например, 'main', 'loading')

    const allFiles = getAllFilesRecursively(folder); // Получаем все файлы в папке

    // Фильтруем изображения на две категории:
    const imageFiles = allFiles.filter(file => (file.endsWith('.png') || file.endsWith('.jpg')) && !file.includes('_')); // Обычные изображения
    const customImageFiles = allFiles.filter(file => file.includes('_') && (file.endsWith('.png') || file.endsWith('.jpg'))); // Изображения в папках с префиксом '_'
    const jsonFiles = allFiles.filter(file => file.endsWith('.json')); // Атласы (JSON-файлы)

    // Маппинг для изображений первой категории (обычные изображения)
    const imageList = new Map();
    imageFiles.forEach(file => {
        const name = path.basename(file, path.extname(file));
        const relativePath = path.relative(assetsDir, file).replace(/\\/g, '/');
        const optimizedImagePath = path.join(optimizedDir, relativePath);

        // Check for duplicates
        checkForDuplicateKeys(name, file);

        if (fs.existsSync(optimizedImagePath)) {
            imageList.set(name, `assets/${relativePath}`);
        } else {
            console.warn('\x1b[33m%s\x1b[0m', `Warning: Optimized image not found for ${file}, using original`);
            imageList.set(name, `assets/${relativePath}`);
        }
    });


    // Маппинг для атласов
    const atlasList = new Map();
    jsonFiles.forEach(file => {
        const name = path.basename(file, '.json'); // Имя атласа
        const relativePath = path.relative(assetsDir, file).replace(/\\/g, '/'); // Путь к файлу
        const optimizedAtlasPath = path.join(optimizedDir, relativePath); // Путь к оптимизированной версии атласа

        // Если оптимизированный атлас существует — используем его
        if (!atlasList.has(name)) { // Проверяем на дублирование
            if (fs.existsSync(optimizedAtlasPath)) {
                atlasList.set(name, `assets/${path.relative(assetsDir, optimizedAtlasPath).replace(/\\/g, '/')}`);
            } else {
                // Если атласа нет — используем оригинал и выводим предупреждение
                console.warn('\x1b[33m%s\x1b[0m', `Warning: Optimized atlas not found for ${name}, using original from ${relativePath}`);
                atlasList.set(name, `assets/${relativePath}`);
            }
        }
    });

    return {
        folderSuffix,
        imageList,
        atlasList,
        customImageFiles // Изображения из папок с префиксом '_', которые нужно обработать отдельно
    };
};

// Проверка дубликатов
const checkForDuplicateKeys = (key, fileName) => {
    if (allKeys.has(key)) {
        console.error('\x1b[31m%s\x1b[0m', `Duplicate key found: ${key} from ${fileName}`);
    } else {
        allKeys.add(key);
    }
};

// Обработка подпапок с префиксом '_' и их изображений
const processCustomFolders = (customImageFiles, folderSuffix) => {
    const customAtlasData = [];
    const customImageList = new Map();

    customImageFiles.forEach(file => {
        const subFolderPath = path.dirname(file); // Папка, где лежит файл
        const jsonFileName = `${path.basename(subFolderPath)}.json`; // Имя JSON файла для атласа
        const optimizedJsonFilePath = path.join(optimizedDir, path.relative(assetsDir, path.dirname(subFolderPath)), jsonFileName);

        // Проверяем наличие оптимизированного атласа
        if (fs.existsSync(optimizedJsonFilePath)) {
            customAtlasData.push({ name: jsonFileName.replace('.json', ''), path: `assets/${path.relative(assetsDir, optimizedJsonFilePath).replace(/\\/g, '/')}` });
        } else {
            console.warn('\x1b[33m%s\x1b[0m', `Warning: Custom atlas ${jsonFileName} not found at path: ${optimizedJsonFilePath}. Adding individual images.`);

            // Если атлас не найден, добавляем изображения отдельно
            const name = path.basename(file, path.extname(file)); // Имя файла
            const relativePath = path.relative(assetsDir, file).replace(/\\/g, '/');
            const optimizedImagePath = path.join(optimizedDir, relativePath);

            // Здесь мы игнорируем поиск оптимизированных картинок и добавляем только оригинальные файлы
            customImageList.set(name, `assets/${relativePath}`);
        }
    });

    return { customAtlasData, customImageList };
};

// Получаем все папки, начинающиеся с 'art-' в директории assets
const artFolders = fs.readdirSync(assetsDir)
    .filter(folder => folder.startsWith('art-'))
    .map(folder => path.join(assetsDir, folder));

// Генерация всех мапов
let allAtlasListEntries = [];
let imageListByScene = new Map();
let atlasListByScene = new Map();
let allAtlasByImageMappingEntries = [];
let allKeys = new Set(); // Для хранения всех ключей

// Обрабатываем каждую папку
artFolders.forEach(folder => {
    const { folderSuffix, imageList, atlasList, customImageFiles } = processArtFolder(folder);

    atlasListByScene.set(folderSuffix, atlasList);

    // Обработка изображений из папок с префиксом '_'
    const { customAtlasData, customImageList } = processCustomFolders(customImageFiles, folderSuffix);

    // Если нашли атлас, исключаем добавление отдельных изображений из этой папки
    if (customAtlasData.length > 0) {
        // Если атлас есть, не добавляем отдельные изображения в IMAGE_LIST_BY_SCENE
        customAtlasData.forEach(atlas => {
            // Проверяем на дублирование перед добавлением в ATLAS_LIST_BY_SCENE
            if (!atlasListByScene.get(folderSuffix)?.has(atlas.name)) {
                allAtlasListEntries.push(`    ['${atlas.name}', '${atlas.path}']`);
                atlasListByScene.set(folderSuffix, new Map([[atlas.name, atlas.path]]));
            }
        });
    } else {
        // Если атлас не найден, добавляем отдельные изображения
        customImageList.forEach((value, key) => {
            imageList.set(key, value);
        });
    }

    // После обработки изображений добавляем обычные изображения в IMAGE_LIST_BY_SCENE
    imageListByScene.set(folderSuffix, imageList);

    atlasList.forEach((value, key) => {
        // Проверяем на дублирование в ALL_ATLASES_LIST
        if (!allAtlasListEntries.includes(`    ['${key}', '${value}']`)) {
            allAtlasListEntries.push(`    ['${key}', '${value}']`);
        }
    });
});

// Генерация ATLAS_BY_IMAGE_MAPPING
atlasListByScene.forEach((atlasList, scene) => {
    atlasList.forEach((atlasPath, atlasName) => {
        const atlasData = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));
        atlasData.textures[0].frames.forEach(frame => {
            const key = frame.filename;
            checkForDuplicateKeys(key, atlasPath);
            allAtlasByImageMappingEntries.push(`    ['${key}', '${atlasName}']`);
        });
    });
});

// Функция для форматирования Map с отступами
const formatMap = (map) => {
    if (map.size === 0) {
        return '    // No entries';
    }
    return Array.from(map.entries())
        .map(([key, value]) => `        ['${key}', '${value}']`)
        .join(',\n');
};

// Формирование контента итогового файла
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

// Запись файла
const outputFilePath = path.join(__dirname, '..', 'src', 'config', 'ImageConfig.ts');
fs.writeFileSync(outputFilePath, fileContent, 'utf8');

console.log(`ImageConfig.ts has been generated at ${outputFilePath}`);
