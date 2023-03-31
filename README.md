## Welcome to GPRobot

This is the robot of the GPTest. Here you will be able to integrate the unit test creation automation into your application!

To do that, follow this 3 simples steps:

1. Go to [our RapidAPI link](https://rapidapi.com/ldsds94/api/gptest1/pricing), create an account and get your API key by selecting the plan that better fits you.
2. Create a GitHub secret in your repository with the name `RAPID_API_KEY` with the value of your API key.
3. Click on the button "Use This Action In My Repo" located in the top of this page.
4. In your repository, create a workflow file in the `.github/workflows` folder with the following steps:

```yaml

- uses: actions/checkout@v3

- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v35  
  with:
    separator: ','

# Isso ta certo? Como usar uma action externa? TESTAR
  uses: usegptest/gprobot@v0.1
  with:
    github_token: ${{ secrets.MY_GITHUB_TOKEN }} # Get the Github Token from repository secrets
    rapidapi_key: ${{ secrets.RAPIDAPI_KEY}}  # Your RapidAPI Key from https://rapidapi.com/ldsds94/api/gptest1/pricing
    changed_files: ${{ steps.changed-files.outputs.all_changed_files }}

```

You can see an example of a workflow file [here](/examples/workflow.yaml).