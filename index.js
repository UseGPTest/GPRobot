const core = require('@actions/core');
const github = require('@actions/github');
const { GetUnitTest } = require('./services/GPTestClient');
const { UnitTestIssueBodyTemplate } = require('./utils/IssueBodyTemplate');

const githubApiKey = core.getInput('github_token');
console.log('github_token: ' + githubApiKey);
const rapidAPIKey = core.getInput('rapidapi_key');
const octokit = github.getOctokit(githubApiKey);

const owner = github.context.repo.owner;
const repo = github.context.repo.repo;

const availableLanguages = ['js', 'jsx', 'ts', 'tsx', 'py'];

const createUnitTestIssue = async (unitTest, filePath, fileExtension) => {
  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title: `[GPTest] Unit test for ${filePath}`,
    body: UnitTestIssueBodyTemplate(unitTest, filePath, fileExtension),
  });
  return issue;
};

function main() {
  const finalDiff = core.getInput('final_diff');
  console.log('final_diff: ' + finalDiff);
  const modifiedFilesPaths = core.getInput('changed_files').split(',');
  try {
    if (finalDiff == '' || modifiedFilesPaths == '') {
      throw new Error('No changes detected');
    }
    for (let i = 0; i < modifiedFilesPaths.length; i++) {
      const filePath = modifiedFilesPaths[i];
      const fileExtension = filePath.split('.').slice(-1)[0];
      if (!availableLanguages.includes(fileExtension)) {
        continue;
      }
      octokit.rest.repos
        .getContent({
          owner,
          repo,
          path: filePath,
          ref: github.context.ref,
        })
        .then((response) => {
          const fileContent = Buffer.from(
            response.data.content ?? '',
            'base64'
          ).toString();
          GetUnitTest(fileContent, rapidAPIKey)
            .then((response) => {
              createUnitTestIssue(
                response.data.unit_test,
                filePath,
                fileExtension
              );
            })
            .catch((error) => {
              console.log('Error: ' + error);
              throw new Error(error);
            });
        });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
main();
