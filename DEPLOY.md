### USE CASE #1: Rewards for Commits 	🎁

The Reward Bot is designed to reward points for every commit which a user does to the GitHub repo. The use case flow is as follows:

- Go to ```GitHub-test``` repository and make a commit there.

![image](https://media.github.ncsu.edu/user/22719/files/62f280fc-1f29-4723-80e1-3bdbd44168db)

- The GitHub Bot catches the user activity and posts it on the common ```#github``` channel.

![image](https://media.github.ncsu.edu/user/22719/files/80810107-796c-4ba5-88e7-5e5b7da06282)

- To check if reward has been received by thr user, click on the icon below as shown in the screenshot and navigate to ```Team20```.

![image](https://media.github.ncsu.edu/user/22719/files/2e79e6d8-15b4-4962-b58c-70ecd219bf33)

- The Reward Bot rewards the user +5 points for making the commit and saves the user database.

![image](https://media.github.ncsu.edu/user/22719/files/da868f84-1944-4b7a-a492-6d6fdbd36d28)



### USE CASE #2: Rewards for Closing Issues 🏆	

The Reward Bot is designed to reward points for every Issue which a user closes on the GitHub repo. The use case flow is as follows:

- Go to ```GitHub-test``` repository and close an issue on that respository.

![image](https://media.github.ncsu.edu/user/22719/files/e491fb9d-4d35-4450-bc95-18f59775d930)

- The GitHub Bot catches the user activity and posts it on the common ```#github``` channel.

![image](https://media.github.ncsu.edu/user/22719/files/382904d3-1ef5-4a28-a0bd-54feb3721787)

- The Reward Bot rewards the user +10 points for closing the issue and saves the user database.

![image](https://media.github.ncsu.edu/user/22719/files/d73fb2a3-d18b-472e-a875-f2048e1b8937)

### USE CASE #3: Rewards for using Positive Words 🎉

The Reward Bot is designed to reward points for using positive words inside discord channel to build positive enforcement among users🥳. The use case flow is as follows:

- Go to discord server ```Team20Server``` and message using positive words like Thanks, Awesome, good, etc on the channel ```ta-test-channel```

![image](https://media.github.ncsu.edu/user/22719/files/a5fd7827-ca04-4565-8d48-c2e6e3b5d56f)

-  These words are then analyzed by the ```Sentiment``` library and the Reward Bot rewards the user for using positive words according to the degree of positive word used.

![image](https://media.github.ncsu.edu/user/22719/files/834a14d5-b5f0-4055-9ff3-69644af6fe01)

- If we use any negative words, then The Reward Bot will provide zero points to the user. To test this you can type any negative words and the bot wouldn't provide any points.

### USE CASE #4: Provides the self-statistics

The Reward Bot provides the self-statistics about the user personally and that includes individual details such as points for commits, issues, etc. The use case is as follows:

- Go to discord server ```Team20Server``` and type ```?self-stats``` on the ```ta-test-channel```.

![image](https://media.github.ncsu.edu/user/22719/files/41aaa7e1-c6cf-4b6e-a674-5807e0cad660)

- Navigate to ```Team20``` and you should be able to view the self-statistics of the user to be displayed on screen.

![image](https://media.github.ncsu.edu/user/22719/files/95c419ab-c882-4d97-b049-495cfb5030fe)


