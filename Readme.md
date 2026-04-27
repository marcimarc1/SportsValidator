# Sports Validator

### Validator for Tracking in Sports

There are multiple interception points, where developers can start exploring the repository.

- ´frontend/Readme.md´ for a probably outdated introduction to the frontend
- ´connection/Readme.md´ for the setup of the postgers db
- ´autopopulate/Readme.md´ for how to populate the db with a scirpt
- ´backend/developer-guide.md´ is containing information regarding the docker setup and developing the frontend without rebuilding the backend
- ´backend/documentations.md´ is a conundrum of sources
- for the developers (as long as the repo is private), please run the github actions with https://github.com/nektos/act before making a PR. I pay for the runner minutes privately.

### Guide for Player Validation

Point of our project is to give the user an interface for finding errors within the data and give them the tools to fix the issues. One of the errors in data that we see is that a single player being represented by multiple PlayerKey's in the data, we can detect this by looking at the trails
What are trails? Trails are the points that we see appearing behind the players, and they represent the history of the players position. Colors are different for each player.

![image](https://github.com/marcimarc1/SportsValidator/assets/57864903/cf347a4d-0b09-4943-8091-e88a0f1bebd0)

We see in the above image that even though this is a single player, multiple colors exist in the trails. This is an error in the data, where a single player is represented as multiple players. In this case, we can use merging to fix the data.

There are also cases where we need swapping, for example, in a case where the algorithm mixed up the data for two different players:

![image](https://github.com/marcimarc1/SportsValidator/assets/57864903/52675da9-df9b-496d-91c6-d953b8b4de59)

In this case, we should go to the frame where the issue started, and use the swap functionality, and end up with correct data like this:

![image](https://github.com/marcimarc1/SportsValidator/assets/57864903/e33f0a82-2970-4891-a843-72b5f1dcc5b2)

Our project has two ways for player validation, multi-select merge and the merge-swap menu.

- For multi-select merge, select trails with different colors and click the merge button. This can be done by holding and dragging our mouse to cover multiple trails.
- Opening the merge-swap menu from the player list using the icon that looks like the "refresh" icon:
- ![image](https://github.com/marcimarc1/SportsValidator/assets/57864903/fc290287-51be-4d30-b015-210d76e63158)

- and choose swap or merge option, choose the player to be swapped or merged from the dropdown menu and hit "Apply changes".

- ![image](https://github.com/marcimarc1/SportsValidator/assets/57864903/3b3a0ef6-d9dd-49cf-ac1d-c6c81ebd70ca)

- Merging and swapping from the merge menu **only changes the data from the current frame and onwards**. This is what we always need for swapping, since the previous data is already correct. However, it could also prove to be useful for merging in certain situations. **In majority of cases though, multi-select merge would suffice for our merging needs.**

### Guide for adding a new sport to active learning

#### 1. Add the pydantic model

Look at the `pydantic_models/homography.py` file and add a new model for your sport.
I recommend following the structure of the `Soccer` and `Tennis`. You should have two models for your sport,
one where the frames are a dict and another one where it is a list

### 2. Add a new route for `/refine` and `/save-refine`

This new route should take as input your new data type and then call the filter function.
Look in `routers/annotations` at the `refine_soccer` and `save_refine_soccer` functions.

### 3. Add new tests

In `/logic` create a new module for your new sport. Look at `soccer_module.py` to see how.
Each test should takes an input a frame of your data and a threshold, Even if you test does not use.
Each test should be annotated with `add_test(TEST_NAME, SPORT_NAME)`. This is to allow the test framework to
discover it. After that, go to `routers/annotation.py` and import all your function from the module. This is needed for
the annotation to work correctly.

### 4. Add your test to the config

Go th the `active_learning_config.json` and add your tests as a new object with the name of your new sport to the tests.
Make sure to follow the exact structure of the `Soccer` and `Tennis` tests.
