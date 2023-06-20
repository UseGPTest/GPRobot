const { core } = require('./utils/Constants');
const { getUnitTest } = require('./services/GPTestClient');
const { getModifiedFunctions } = require('./utils/DiffParser');
const { createUnitTestIssue, getFileContent } = require('./utils/Octokit');

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
          const contextCode = await getFileContent(filePath);
          console.log(`func: ${funcObj.func}\nfuncObj for request: ${JSON.stringify(funcObj)}\ncontext code for request: ${contextCode}`)
          const response = await getUnitTest(funcObj.func, contextCode);
          console.log('index getUnitTest response: ' + response);
          await createUnitTestIssue(response.unit_test, filePath);
        } catch (error) {
          console.log('index createUnitTestIssue ERROR: ' + error);
          throw new Error(error);
        }
      }
    }
  } catch (error) {
    console.log('index.main: Error: ' + error);
    core.setFailed(error.message);
  }
}

main();
