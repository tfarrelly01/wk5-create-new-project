const exec = require('child_process').exec;
const fs = require('fs');
const projectName = process.argv[2];
const directoryPath = process.argv[3];
const projectPath = directoryPath + '/' + projectName;
const sourceDir = '/src/';
const testDir = '/spec/';
const mainJs = 'index.js';
const testFile = 'index.spec.js';

const createDirP = function (fullPathName) {

    return new Promise((resolve, reject) => {
        fs.mkdir(fullPathName, (err, stdout, stderr) => {
            if (err) reject(err);

            resolve(console.log('Directory : ' +  fullPathName + ' created.'));
        });
    });
};

const runCmdP = function (cmd) {

    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(err);

            resolve(console.log('Command : ' +  cmd + ' executed.'));
        });
    });
};

const createAndWriteToFileP = function (dirPath, fileName, content) {
    let fullPath = dirPath + fileName;

    return new Promise((resolve, reject) => {
        fs.writeFile(fullPath, content, (err) => {
            if (err) return reject(err);

            resolve(console.log('File: ' + fullPath + ' created. ' +  fileName + ' contains appropriate content'));
        });
    });
};

const customisePackageJSON = function (dirPath, fileName) {
    let fullPath = dirPath + fileName;

    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (err) return reject(err);

            let content = JSON.parse(data);
            content['scripts']['test'] = 'mocha ./spec/test.js';
            content['scripts']['lint'] = 'eslint ./';
            content['scripts']['precommit'] = 'mocha ./spec/test.js, ';
            content['scripts']['postcommit'] = 'mocha ./spec/test.js, ';
            
            let stringifyContent = JSON.stringify(content, null, 2)

            resolve(createAndWriteToFileP(dirPath, fileName, stringifyContent));

            
        });
    });
};

createDirP(projectPath)
    .then(() => createDirP(projectPath + sourceDir))
    .then(() => createAndWriteToFileP(projectPath + sourceDir, mainJs, 'module.exports = {};'))
    .then(() => createDirP(projectPath + testDir))
    .then(() => createAndWriteToFileP(projectPath + testDir, testFile, 'const expect = require(\'chai\')'))
    .then(() => runCmdP('cd ' + projectPath + '; npm init -y; git init; npm install --save-dev eslint chai husky mocha'))
    .then(() => customisePackageJSON(projectPath + '/', 'package.json'))
    .catch((err) => console.log('ERROR:', err.code));

/*
function runCmd(cmd, cb) {
    return exec(cmd, cb);
}
runCmd('pwd', function (err, stdout, stderr) {
    if (err) {
        console.error(err);
        return;
    }
        console.log(stdout);
    });
*/