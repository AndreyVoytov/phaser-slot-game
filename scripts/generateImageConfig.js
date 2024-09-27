const fs = require('fs');
const path = require('path');

// Определяем путь к корневой директории assets
const assetsDir = path.join(__dirname, '..', 'assets');

// Функция для обработки папки с артом
const processArtFolder = (folder) => {
    const folderSuffix = path.basename(folder).replace('art-', '').toLowerCase(); // Сохраняем окончание папки (например, 'main', 'loading')
    const allFiles = fs.readdirSync(folder);
    
    // Фильтруем изображения и JSON файлы
    const imageFiles = allFiles.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
    const jsonFiles = allFiles.filter(file => file.endsWith('.json'));
    
    // Генерация маппингов для изображений
    const imageList = new Map();
    imageFiles
        .filter(file => !jsonFiles.some(jsonFile => path.basename(jsonFile, '.json') === path.basename(file, '.png')))
        .forEach(file => {
            const name = path.basename(file, path.extname(file));
            const relativePath = `assets/${path.basename(folder)}/${file}`;
            imageList.set(name, relativePath);
        });
    
    // Генерация маппингов для атласов
    const atlasList = new Map();
    jsonFiles.forEach(file => {
        const name = path.basename(file, '.json');
        atlasList.set(name, `assets/${path.basename(folder)}/${name}`); // Убираем .json
    });

    return {
        folderSuffix,
        imageList,
        atlasList
    };
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

// Обрабатываем каждую папку
artFolders.forEach(folder => {
    const { folderSuffix, imageList, atlasList } = processArtFolder(folder);

    // Добавляем данные в общие списки
    atlasList.forEach((value, key) => {
        allAtlasListEntries.push(`    ['${key}', '${value}']`);
    });

    imageListByScene.set(folderSuffix, imageList);
    atlasListByScene.set(folderSuffix, atlasList);

    // Генерация ATLAS_BY_IMAGE_MAPPING для конкретного атласа
    atlasList.forEach((atlasPath, atlasName) => {
        const jsonFilePath = path.join(folder, `${atlasName}.json`);
        const atlasData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

        if (atlasData.textures && atlasData.textures[0] && atlasData.textures[0].frames) {
            const frames = atlasData.textures[0].frames;
            frames.forEach(frame => {
                allAtlasByImageMappingEntries.push(`    ['${frame.filename}', '${atlasName}']`);
            });
        }
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
