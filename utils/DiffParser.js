const acorn = require('acorn');
const parseDiff = require('parse-diff');
const { getFileContent } = require('./Octokit');
const { DIFF_NULL_PATH, availableLanguages } = require('./Constants');

function getModifiedLinesFromDiff(diff) {
  // modifiedLines: filePath -> [{startLine, finalLine}]
  const modifiedLines = [];
  const parsedDiff = parseDiff(diff);
  for (const file of parsedDiff) {
    const filePath = file.to || file.from;
    const extension = filePath.split('.').slice(-1)[0];
    if (filePath == DIFF_NULL_PATH || !availableLanguages.includes(extension)) {
      continue;
    }
    for (const chunk of file.chunks) {
      if (!modifiedLines[filePath]) {
        modifiedLines[filePath] = [];
      }
      modifiedLines[filePath].push({
        startLine: chunk.newStart,
        endLine: chunk.newStart + chunk.newLines,
      });
    }
  }
  return modifiedLines;
}

async function getModifiedFunctions(diff) {
  const modifiedFunctions = []; // map: filePath -> [functionName]
  const modifiedLines = getModifiedLinesFromDiff(diff);

  for (const filePath in modifiedLines) {
    console.log(`getModifiedFunctions: filePath=${filePath}`);
    const modifiedLinesInFile = modifiedLines[filePath];
    const file = await getFileContent(filePath);
    const fileParsed = acorn.parse(file, { ecmaVersion: 2020 });
    for (let i = 0; i < fileParsed.body.length; i++) {
      const node = fileParsed.body[i];
      if (node.type == 'FunctionDeclaration') {
        console.log(`found function declaration ${node.id.name}`);
        for (const { startLine, finalLine } of modifiedLinesInFile) {
          console.log(`startLine=${startLine} finalLine=${finalLine}`);
          if (
            (node.start >= startLine && node.start <= finalLine) ||
            (node.end >= startLine && node.end <= finalLine)
          ) {
            if (!modifiedFunctions[filePath]) {
              modifiedFunctions[filePath] = [];
            }
            modifiedFunctions[filePath].push(node.id.name);
            console.log(`found function ${node.id.name} in ${filePath}`);
          }
        }
      }
    }
  }
  return modifiedFunctions;
}

module.exports = { getModifiedFunctions };
