# SDE-PROJECT
Service Design application to generate and manage meal plans.

## Features
### 🍽️ Meal Plan
- Save your dietary preferences
- Given dietary restrictions and other filters(for ex. caloric intake), return multiple proposals for a weekly meal plan

### 🛒 Shopping List
- Once chosen the meal plan, generate the shopping list for that week

## How it works (For now)
Quick explanation on set up and project components.

### Directories
There are 2 main directories to refer to.

#### Client
It is the directory containing the **Vue.js** frontend for authentication process. Auth0 is used as the authentication service.  

#### Express
It is the directory containing the Express server that will coordinate all the Telegram bot interactions with the user. For now it should at least orchestrate the following external services: Telegram Bot, Spoonacular, our Database, authentication process.  
