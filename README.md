## Welcome to GPRobot

This is the robot of the GPTest. Here you will be able to integrate the unit test creation automation into your application!

To do that, follow this 4 simples steps:

1. Go to [our RapidAPI link](https://rapidapi.com/ldsds94/api/gptest1/pricing), create an account and get your API key by selecting the plan that better fits you.
2. Create a GitHub secret in your repository with the name `RAPID_API_KEY` with the value of your API key.
3. Click on the button "Use This Action In My Repo" located in the top of this page.
4. In your repository, create a workflow file in the `.github/workflows` folder following [this example](/examples/workflow.yaml):