const { core } = require('./utils/Constants');
const { getUnitTest } = require('./services/GPTestClient');
const { getModifiedFunctions } = require('./utils/DiffParser');
const { createUnitTestIssue } = require('./utils/Octokit');

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

    for (const filePath in modifiedFunctions) {
      for (const funcObj of modifiedFunctions[filePath]) {
        try {
          const response = await getUnitTest(funcObj.func);
          const fileExtension = filePath.slice(filePath.lastIndexOf('.') + 1);
          createUnitTestIssue(response.data.unit_test, filePath, fileExtension);
        } catch (error) {
          console.log('createUnitTestIssue ERROR: ' + error);
        }
      }
    }
  } catch (error) {
    console.log('index.main: ERROR: ' + error);
    core.setFailed(error.message);
  }
}

main();
