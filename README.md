# Sangini-Backend

## Local Setup
#### run command in postgres terminal
`CREATE DATABASE sangini WITH OWNER postgres;`

#### to run local server commands

`npm install`

`cp app/config/example.config.js app/config/db.config.js` 

configure `db.config.js`

`npm start`

### For creating the test database 
`CREATE DATABASE sangini_test WITH OWNER postgres;`

### Deployed URL:
https://sangini-backend.herokuapp.com



# For spotify

- user will signup/login on spotify account
- spotify will give accesstoken & refreshtoken 
- now user have to click on button to sync the songs this will call 
- sync api (/api/playlist/sync)
