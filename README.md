# Instructions to run OnTask
## Before anything!
* Create a .env file in OnTask\backend with provided access credentials
* Ensure that .env PORT and frontend\package.json’s proxy are the same (eg. PORT=4006 means "proxy": "http://localhost:4006" in frontend)

## How to run Frontend:
* cd OnTask\frontend
* npm install
* npm start

## In a new terminal, run Backend:
* cd OnTask\backend
* npm install
* npm start