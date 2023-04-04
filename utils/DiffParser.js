const allowedFileExtensions = ['js', 'jsx', 'ts', 'tsx', 'py'];
function getModifiedFunctions(finalDiff) {
  const modifiedFunctions = {}; // map: filePath -> [functionName]
  const modifiedFiles = finalDiff.split('diff --git');
  for (let i = 0; i < modifiedFiles.length; i++) {
    // Gets the file path
    const newFilePath = modifiedFiles[i].split(' b/')[1];
    if (newFilePath == undefined) {
      continue;
    }
    console.log('DiffParser: newFilePath: ' + newFilePath);
    const fileName = newFilePath.split('/').slice(-1)[0];
    console.log('DiffParser: fileName: ' + fileName);
    const fileExtension = fileName.split('.').slice(-1)[0];
    console.log('DiffParser: fileExtension: ' + fileExtension);
    // Checks if the file is a code file
    if (!allowedFileExtensions.includes(fileExtension)) {
      continue;
    }
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
      }
    }
  }
  return modifiedFunctions;
}

module.exports = { getModifiedFunctions };
