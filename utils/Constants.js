const core = require('@actions/core');
const github = require('@actions/github');

const githubApiKey = core.getInput('github_token');
const rapidAPIKey = core.getInput('rapidapi_key');
const octokit = github.getOctokit(githubApiKey);

module.exports = { core, github, rapidAPIKey, octokit };
