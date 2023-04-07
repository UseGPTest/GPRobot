const { core } = require('./utils/Constants');
// const { getUnitTest } = require('./services/GPTestClient');
const { getModifiedFunctions } = require('./utils/DiffParser');

// const availableLanguages = ['js', 'jsx', 'ts', 'tsx', 'py'];

async function main() {
  // Gets final diff
  const finalDiff = core
    .getInput('final_diff')
    .replace(/%25/g, '%')
    .replace(/%0A/g, '\n')
    .replace(/%0D/g, '\r');

  // Gets modified files paths old way
  const modifiedFilesPaths = core.getInput('changed_files').split(',');

  try {
    if (finalDiff == '' || modifiedFilesPaths.length == 0) {
      throw new Error('No changes detected');
    }

    const modifiedFunctions = await getModifiedFunctions(finalDiff);
    console.log('modifiedFunctions: ' + modifiedFunctions);

    // for (let i = 0; i < modifiedFilesPaths.length; i++) {
    //   const filePath = modifiedFilesPaths[i];
    //   const fileExtension = filePath.split('.').slice(-1)[0];
    //   if (!availableLanguages.includes(fileExtension)) {
    //     continue;
    //   }
    //   const fileContent = getFileContent(filePath);
    //   try {
    //     const response = await getUnitTest(fileContent);
    //     createUnitTestIssue(response.data.unit_test, filePath, fileExtension);
    //   } catch (error) {
    //     console.log('createUnitTestIssue ERROR: ' + error);
    //   }
    // }
  } catch (error) {
    console.log('index.main: ERROR: ' + error);
    core.setFailed(error.message);
  }
}

main();
