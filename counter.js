const fs = require('fs');
const path = require('path');

// Function to get all files recursively
const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    if (dirPath.includes("node_modules") || dirPath.includes('.git')) {
        return arrayOfFiles;
    }

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
};

// Function to count lines and characters in a file
const countLinesAndCharacters = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').length;
    const characters = data.length;
    return {lines, characters};
};

// Main function
const analyzeFiles = (directory) => {
    const files = getAllFiles(directory);
    let totalFiles = files.length;
    let totalLines = 0;
    let totalCharacters = 0;

    files.forEach((file) => {
        const {lines, characters} = countLinesAndCharacters(file);
        totalLines += lines;
        totalCharacters += characters;
        console.log(`File: ${file}, Lines: ${lines}, Characters: ${characters}`);
    });

    console.log(`Total number of files: ${totalFiles}`);
    console.log(`Total number of lines: ${totalLines}`);
    console.log(`Total number of characters: ${totalCharacters}`);
};

// Replace 'app/' with your directory path
const directoryPath = path.join(__dirname, 'models');
analyzeFiles(directoryPath);
