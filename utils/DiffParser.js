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
    const modifiedLinesInFile = modifiedLines[filePath];
    const fileExtension = filePath.split('.').slice(-1)[0];

    // only js/ts files are supported
    if (!availableLanguages.includes(fileExtension)) continue;

    const file = await getFileContent(filePath);
    let fileParsed;
    try {
      fileParsed = acorn.parse(file, {
        ecmaVersion: 2020,
        locations: true,
      });
    } catch (error) {
      console.log(`Could not parse file. Check the syntax of file ${filePath}. Error: ` + error)
      continue;
    }
    for (let i = 0; i < fileParsed.body.length; i++) {
      const node = fileParsed.body[i];
      if (node.type == 'FunctionDeclaration') {
        for (const { startLine, endLine } of modifiedLinesInFile) {
          for (let line = startLine; line <= endLine; line++) {
            if (line >= node.loc.start.line && line <= node.loc.end.line) {
              if (!modifiedFunctions[filePath]) {
                modifiedFunctions[filePath] = [];
              }
              const func = file.slice(node.start, node.end);
              if (
                !modifiedFunctions[filePath].find(
                  (funcObj) => funcObj.name == node.id.name
                )
              ) {
                modifiedFunctions[filePath].push({ name: node.id.name, func });
              }
            }
          }
        }
      }
    }
  }
  return modifiedFunctions;
}

module.exports = { getModifiedFunctions };
