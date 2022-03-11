# Bot Implementation

## Bot Platform

We are using the ```Discord``` platform to implement our Reward bot. Also, we integrated the bot with GitHub to monitor the activities occuring on the Github repository (eg. commits, issues, comments, etc) and link it to our Discord platform. Hence, we were able to integrate the Github bot to our project as well with the use of some private key tokens shared between Discord and Github through Webhook.

- Generating Discord Webhook URL

![Screenshot 2022-03-10 200717](https://media.github.ncsu.edu/user/22719/files/80f44e2d-1f9f-49ca-ab3c-329aa324002c)

- Integrating the bot to GitHub
 
![Screenshot 2022-03-10 200135](https://media.github.ncsu.edu/user/22719/files/6a63b7ac-f24c-4552-acfc-66af22f56416)

- GitHub bot linked to Discord Platform

![image](https://media.github.ncsu.edu/user/22719/files/a448c50b-4b04-4926-8c16-6c6bcaaa3c84)

- Reward Bot created by the name "Team 20"

![image](https://media.github.ncsu.edu/user/22719/files/240a368c-6847-4802-9b20-fd201fa0ac2a)


## Bot Integration

### USE CASE #1: Rewards for Commits

The Reward Bot is designed to reward points for every commit which a user does to the GitHub repo. The use case flow is as follows:

- Suppose the user "sshubha" makes a commit to GitHub

![image](https://media.github.ncsu.edu/user/22719/files/62f280fc-1f29-4723-80e1-3bdbd44168db)

- The GitHub Bot catches the user activity and posts it on the common ```#github``` channel.

![image](https://media.github.ncsu.edu/user/22719/files/80810107-796c-4ba5-88e7-5e5b7da06282)

- The Reward Bot rewards the user for making the commit and saves the user database.

![image](https://media.github.ncsu.edu/user/22719/files/da868f84-1944-4b7a-a492-6d6fdbd36d28)


### USE CASE #2: Rewards for Closing Issues

The Reward Bot is designed to reward points for every Issue which a user closes on the GitHub repo. The use case flow is as follows:

- Suppose the user "sshubha" closes an issue on GitHub

![image](https://media.github.ncsu.edu/user/22719/files/e491fb9d-4d35-4450-bc95-18f59775d930)

- The GitHub Bot catches the user activity and posts it on the common ```#github``` channel.

![image](https://media.github.ncsu.edu/user/22719/files/382904d3-1ef5-4a28-a0bd-54feb3721787)

- The Reward Bot rewards the user for closing the issue and saves the user database.

![image](https://media.github.ncsu.edu/user/22719/files/d73fb2a3-d18b-472e-a875-f2048e1b8937)











