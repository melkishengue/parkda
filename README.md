# Parkda!

This node application is a RESTfull demo app. It helps to find parking places in train Stations in Germany.

## Install

First clone the repo
```
git clone https://github.com/melkishengue/parkda.git
```

Then install the app:

```
cd parkda
npm install
```

Next thing to do is to create a .env file which contains the environment variables needed by the app.

```
touch .env
```

Fill in the file as follows:

```
# this the app configuration file
# all these variables are being loaded and available as env variables in the app

# user
DB_USER=
# password
DB_PASSWORD=
# host
DB_HOST=localhost
# port
DB_PORT=
# database name
DB_NAME=parkplatz
# port the server runs on
PORT=3000
```

Fill the infos for your mongodb server.

After this populate the database by running:

```
node populatedb.js
```

and finally run the app:

```
npm start
```

You have now the app up and running. Visit http://localhost:3000
