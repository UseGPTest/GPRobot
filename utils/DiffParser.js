const acorn = require('acorn');
const { getFileContent } = require('./Octokit');
const allowedFileExtensions = ['js', 'jsx', 'ts', 'tsx', 'py'];

function getModifiedLinesFromDiff(diff) {
  // modifiedLines: filePath -> [{startLine, finalLine}]
  const modifiedLines = {};

  const modifiedFiles = diff.split('diff --git');
  console.log('DiffParser: modifiedFiles: ' + modifiedFiles);
  for (let i = 0; i < modifiedFiles.length; i++) {
    // Gets the file path
    const filePath = modifiedFiles[i].split(' b/')[1]?.split('\n')[0];
    if (filePath == undefined) {
      continue;
    }

    // Gets the file path, name and extension
    console.log('DiffParser: filePath: ' + filePath);
    const fileName = filePath.split('/').slice(-1)[0];
    console.log('DiffParser: fileName: ' + fileName);
    const fileExtension = fileName.split('.').slice(-1)[0];
    console.log('DiffParser: fileExtension: ' + fileExtension);

    // Checks if the file is a code file
    if (!allowedFileExtensions.includes(fileExtension)) {
      continue;
    }

    // Gets the modified lines
    const fileDiff = modifiedFiles[i];
    console.log('DiffParser: fileDiff: ' + fileDiff);
    const fileDiffLines = fileDiff.split('\n');

    for (let j = 0; j < fileDiffLines.length; j++) {
      const line = fileDiffLines[j];
      if (line.startsWith('@@')) {
        const startLineStr = line.split('@@')[1].split('+')[1].split(',');
        console.log('DiffParser: startLineStr: ' + startLineStr);
        const startLine = parseInt(startLineStr[0]);
        const finalLine = startLine + parseInt(startLineStr[1]);
        console.log('DiffParser: startLine: ' + startLine);
        console.log('DiffParser: finalLine: ' + finalLine);
        modifiedLines[filePath] = { startLine, finalLine };
      }
    }
  }
  return modifiedLines;
}

async function getModifiedFunctions(diff) {
  const modifiedFunctions = {}; // map: filePath -> [functionName]

  const modifiedLines = getModifiedLinesFromDiff(diff);

  for (const filePath in modifiedLines) {
    const { startLine, finalLine } = filePath;

    const file = await getFileContent(filePath);
    const fileParsed = acorn.parse(file, { ecmaVersion: 2020 });
    console.log('DiffParser: fileParsed: ' + fileParsed);
    for (let i = 0; i < fileParsed.body.length; i++) {
      const node = fileParsed.body[i];
      if (node.type == 'FunctionDeclaration') {
        if (startLine >= node.start && finalLine <= node.end) {
          modifiedFunctions[filePath].push(node.id.name);
        }
      }
    }

    return modifiedFunctions;
  }
}

module.exports = { getModifiedFunctions };
