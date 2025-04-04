

const express = require('express');
const path = require('node:path');
const recipe_router = require('./routes/recipes');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
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

app.use(cookieParser('recipe-secret'));
app.use(session({
  secret:"recipeapp",
  resave: "true",
  saveUninitialized: "true"
}));

//middleware to add body to the request handler
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.json());

//use pug to generate html from templates stored in views directory
app.set('view engine', 'pug');
app.set('views', './views');

//serve up any static files in the public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

//have Express automatically deliver index.html from public directory for purposes of testing API
// app.use('/', express.static(path.join(__dirname, 'public')));

//use the recipe router module as the primary root when application is launched
app.use('/', recipe_router);

//set up middleware for the api route
app.use('/api/recipes', api_recipes);

//custom 404 error static page middleware to serve error.html when appropriate
 app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'templates', 'error.html'));
}) 

module.exports = app;