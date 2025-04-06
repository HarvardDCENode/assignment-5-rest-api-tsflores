

const express = require('express');
const path = require('node:path');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const api_recipes = require('./routes/api/api-recipes');
require('dotenv').config();

const app = express();

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@clustere31.bxve7.mongodb.net/recipeApp?retryWrites=true&w=majority&appName=ClusterE31`, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
  console.log('connected to database.');
})
.catch((err)=>{
  console.error(`database connection error: ${err}`);
  process.exit();
});

//middleware to add body to the request handler
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.json());

//serve up any static files in the public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

//have Express automatically deliver index.html from public directory for purposes of testing API
app.use('/', express.static(path.join(__dirname, 'public')));

//set up middleware for the api route
app.use('/api/recipes', api_recipes);

//custom 404 error static page middleware to serve error.html when appropriate
 app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'templates', 'error.html'));
}) 

module.exports = app;