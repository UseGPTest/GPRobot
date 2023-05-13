## Welcome to GPRobot

This is the robot of the GPTest. Here you will be able to integrate the unit test creation automation into your application!

To do that, follow this 4 simples steps:

1. Go to [our RapidAPI link](https://rapidapi.com/LeoUpperThrower4/api/usegptest1), create an account and get your API key by selecting the plan that better fits you.
2. Create a GitHub secret in your repository with the name `RAPIDAPI_KEY` with the value of your API key.
3. [On the GitHub marketplace](https://github.com/marketplace/actions/unit-test-creation-with-gptest), click on the green button "Use latest version".
4. In your repository, create a workflow file named `main.yaml` in the `.github/workflows` folder following [this example](/examples/workflow.yaml)