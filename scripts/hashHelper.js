const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.join(__dirname, '../assets/');
const hashFilePath = path.join(__dirname, '../assets/_art-optimized/hash.txt');

function normalizePath(filePath) {
    let res = filePath.replace(/\\/g, '/');
    if(!filePath.startsWith('/')) {
        res = '/' + res;
    }
    return res;
}

function getHash(filePath) {
    if (!fs.existsSync(hashFilePath)) {
        return undefined;
    }

    const data = fs.readFileSync(hashFilePath, 'utf8');
    const lines = data.split('\n');
    const normalizedFilePath = normalizePath(filePath);

    for (let line of lines) {
        line = line.trim();
        if (line.length === 0) continue;
        const [storedPath, storedHash] = line.split(' ');
        if (!storedPath || !storedHash) continue;
        const normalizedStoredPath = normalizePath(storedPath);
        if (normalizedStoredPath === normalizedFilePath) {
            return storedHash;
        }
    }
    return undefined;
}

function setHash(filePath) {
    // Remove leading slash if present
    let relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const absolutePath = path.join(baseDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.error(`File ${absolutePath} does not exist`);
        return;
    }

    // Compute hash of the file
    const fileBuffer = fs.readFileSync(absolutePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    const hash = hashSum.digest('hex');

    let data = '';
    if (fs.existsSync(hashFilePath)) {
        data = fs.readFileSync(hashFilePath, 'utf8');
    }

    const lines = data.split('\n');
    let found = false;
    let newLines = [];
    const normalizedFilePath = normalizePath(relativePath);

    for (let line of lines) {
        line = line.trim();
        if (line.length === 0) continue;
        const [storedPath, storedHash] = line.split(' ');
        if (!storedPath || !storedHash) continue;
        const normalizedStoredPath = normalizePath(storedPath);
        if (normalizedStoredPath === normalizedFilePath) {
            // Update the line with normalized path
            newLines.push(`${normalizedFilePath} ${hash}`);
            found = true;
        } else {
            newLines.push(`${normalizedStoredPath} ${storedHash}`);
        }
    }

    if (!found) {
        newLines.push(`${normalizedFilePath} ${hash}`);
    }

    const newData = newLines.join('\n') + '\n';

    fs.writeFileSync(hashFilePath, newData, 'utf8');
}

module.exports = { getHash, setHash };