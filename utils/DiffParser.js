const acorn = require('acorn');
const ts = require('typescript');
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

function parseFile(fileContent, fileExtension) {
  let parsedFile;
  if (fileExtension == 'js') {
    parsedFile = acorn.parse(fileContent, {
      ecmaVersion: 2020,
      locations: true,
    });
  } else if (fileExtension == 'ts' || fileExtension == 'tsx') {
    parsedFile = ts.createSourceFile('temp.tsx', fileContent, ts.ScriptTarget.Latest, true);
    if (parsedFile.parseDiagnostics.length > 0) {
      console.log(
        `Error parsing file ${filePath}: ${parsedFile.parseDiagnostics}`
      );
      return;
    }
  }
  return parsedFile;
}

async function getModifiedFunctions(diff) {
  const modifiedFunctions = []; // map: filePath -> [{ name: function name, func: function code }]
  const modifiedLines = getModifiedLinesFromDiff(diff);

  for (const filePath in modifiedLines) {
    const modifiedLinesInFile = modifiedLines[filePath];
    const fileExtension = filePath.split('.').slice(-1)[0];

    // only js/ts files are supported
    console.log(`getModifiedFunctions: filePath= ${filePath}, fileExtension= ${fileExtension}`)
    if (!availableLanguages.includes(fileExtension)) continue;

    const file = await getFileContent(filePath);
    try {
      let parsedFile = parseFile(file, fileExtension);
      if (!parsedFile) continue;
      if (fileExtension == 'js') {
        for (let i = 0; i < parsedFile.body.length; i++) {
          const node = parsedFile.body[i];
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
                    console.log(`found modified function. getModifiedFunctions: filePath= ${filePath}, function= ${node.id.name}`)
                    const contextCode = file.slice(Math.min(node.start - 100, 0), node.start) + file.slice(node.end, Math.min(node.end + 100, file.length));
                    modifiedFunctions[filePath].push({ name: node.id.name, func, contextCode });
                  }
                }
              }
            }
          }
        }
      } else if (fileExtension == 'ts' || fileExtension == 'tsx') {  
        // Traverse the AST to find React components and functions
        ts.forEachChild(parsedFile, visitNode);
      
        function visitNode(node) {
           if (ts.isFunctionDeclaration(node)) {
            // Extract relevant information from function
            const functionName = node.name?.text;
            const functionStart = node.getStart(parsedFile);
            const functionEnd = node.getEnd(parsedFile);
            const functionText = parsedFile.text.substring(functionStart, functionEnd);
            const contextCodeBefore = parsedFile.text.substring(Math.min(functionStart - 100, 0), functionStart);
            const contextCodeAfter = parsedFile.text.substring(functionEnd, Math.max(functionEnd + 100, parsedFile.text.length));
            const contextCode = `${contextCodeBefore} \n\n ${contextCodeAfter}`;
            modifiedFunctions[filePath].push({ name: functionName, func: functionText, contextCode });
            console.log(`found modified function. getModifiedFunctions: filePath= ${filePath}, function= ${functionName}`)
          }
      
          // Recursively visit child nodes
          ts.forEachChild(node, visitNode);
        }    
      }
    } catch (error) {
      console.log(`Error: ` + error)
      continue;
    }
  }
  console.log(`getModifiedFunctions found a total of ${modifiedFunctions.length} functions: modifiedFunctions= ${JSON.stringify(modifiedFunctions)}`)
  return modifiedFunctions;
}

module.exports = { getModifiedFunctions };
