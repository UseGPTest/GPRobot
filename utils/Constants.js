const core = require('@actions/core');
const github = require('@actions/github');

const githubApiKey = core.getInput('github_token');
const rapidAPIKey = core.getInput('rapidapi_key');
const octokit = github.getOctokit(githubApiKey);
const repo = github.context.repo.repo;
const owner = github.context.repo.owner;

const DIFF_NULL_PATH = '/dev/null';

module.exports = {
  core,
  github,
  rapidAPIKey,
  octokit,
  repo,
  owner,
  DIFF_NULL_PATH,
};
