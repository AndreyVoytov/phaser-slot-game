const fs = require('fs');
const path = require('path');
const Spritesmith = require('spritesmith');
const Handlebars = require('handlebars');
const spritesheetTemplates = require('spritesheet-templates');

function findDirectories(baseDir, prefix) {
  const artDirs = [];
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith(prefix)) {
      artDirs.push(entry.name);
    }
  }
  return artDirs;
}

function consoleError(text) {
  const formattedText = formatReverse(getConsolePrefix() + text);
  console.warn(
      '\x1b[31m%s\x1b[0m', // Red color
      formattedText
  );
}

function consoleSuccess(text) {
  const formattedText = formatReverse(getConsolePrefix() + text);
  console.warn(
      '\x1b[32m%s\x1b[0m', // Green color
      formattedText
  );
}

function consoleWarning(text) {
  const formattedText = formatReverse(getConsolePrefix() + text);
  console.warn(
      '\x1b[33m%s\x1b[0m', // Yellow color
      formattedText
  );
}

function consoleLog(text) {
  const formattedText = formatReverse(getConsolePrefix() + text);
  console.log(
      formattedText
  );
}
function formatReverse(text) {
  return text.replaceAll('**', '');
  // const reverseCode = '\x1b[1;7m'; 
  // const resetCode = '\x1b[22;27m'; 
  
  // return text.replace(/\*\*(.*?)\*\*/g, `${reverseCode}$1${resetCode}`);
}

function getConsolePrefix(){
  return '[npm run ' + process.env.npm_lifecycle_event + '] ';
}

function createAtlas(inputFolderPath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const images = fs.readdirSync(inputFolderPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
      })
      .map(file => path.join(inputFolderPath, file));

    if (images.length === 0) {
      return reject(new Error('No images found in the specified folder ' + inputFolderPath.split('assets')[1]));
    }

    // Create atlas
    Spritesmith.run({ src: images }, function (err, result) {
      if (err) {
        consoleError('Error during atlas creation:' + err);
        return reject(err);
      }

      try {
        fs.writeFileSync(`${outputFilePath}.png`, result.image);
        const coordinates = result.coordinates;
        const properties = result.properties;

        // Making data for template
        const spritesheetData = {
          sprites: Object.keys(coordinates).map(filePath => {
            const name = path.basename(filePath);
            const coords = coordinates[filePath];
            return {
              name: name,
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              total_width: properties.width,
              total_height: properties.height
            };
          }),
          spritesheet: {
            width: properties.width,
            height: properties.height,
            image: path.basename(`${outputFilePath}.png`)
          }
        };

        // Using custom handlebars template
        const templatePath = path.resolve(__dirname, './json-template.handlebars');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        Handlebars.registerHelper('trimExtension', function(filename) {
          return filename.replace(/\.[^/.]+$/, "");
        });
        spritesheetTemplates.addHandlebarsTemplate('custom_json', templateContent, Handlebars);

        // Generate json
        const jsonResult = spritesheetTemplates(spritesheetData, {
          format: 'custom_json',
          handlebars: Handlebars
        });

        // Save json to file
        fs.writeFileSync(`${outputFilePath}.json`, jsonResult);
        consoleSuccess('Atlas created sucessfully:' + `${outputFilePath.split('assets')[1]}.png and .json`);
        resolve(); // Success
      } catch (writeError) {
        consoleError('Error during writing files:' + writeError);
        reject(writeError);
      }
    });
  });
}

module.exports = { findDirectories, createAtlas, consoleError, consoleWarning, consoleSuccess, consoleLog };

