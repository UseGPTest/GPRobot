const { octokit, owner, repo, github } = require('./Constants');
const { UnitTestIssueBodyTemplate } = require('./IssueBodyTemplate');

async function getFileContent(filePath) {
  try {
    const content = (
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: github.context.ref,
      })
    ).data.content;
    return Buffer.from(content ?? '', 'base64').toString();
  } catch (error) {
    console.log('Error: ' + error);
    throw new Error(error);
  }
}

async function createUnitTestIssue(unitTest, filePath, fileExtension) {
  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title: `[GPTest] Unit test for ${filePath}`,
    body: UnitTestIssueBodyTemplate(unitTest, filePath, fileExtension),
  });
  return issue;
}

module.exports = { getFileContent, createUnitTestIssue };
