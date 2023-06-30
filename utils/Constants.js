const core = require('@actions/core');
const github = require('@actions/github');

const githubApiKey = core.getInput('github_token');
const repositoryName = core.getInput('repository_name');
const octokit = github.getOctokit(githubApiKey);
const repo = github.context.repo.repo;
const owner = github.context.repo.owner;

const DIFF_NULL_PATH = '/dev/null';
const availableLanguages = ['js', 'ts', 'tsx']; // TODO: JSX

module.exports = {
  core,
  github,
  repositoryName,
  octokit,
  repo,
  owner,
  DIFF_NULL_PATH,
  availableLanguages,
};
