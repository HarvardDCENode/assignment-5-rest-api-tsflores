//custom router middleware to handle get requests associated with specific recipes
//this includes adding a recipe or viewing a recipe

const express = require("express");
const router = express.Router();
const multer = require("multer");
const recipeController = require("../controllers/recipeController");
const flash = require("express-flash");
const Recipe = require("../models/recipeModel");
const path = require('node:path');
const fs = require('node:fs');


//from the multer documentation on using .fields for multiple files
const upload = multer({
	storage: recipeController.storage,
	fileFilter: recipeController.imageFilter,
}).fields([
	{ name: "image", maxCount: 1 },
	{ name: "recipePDF", maxCount: 1 },
]);

router.use(flash());

//root renders the index.pug template with a display of the recipes in the database
router.get("/", (req, res, next) => {
	Recipe.find({})
		.then((recipes) => {
			res.render("index", { recipes });
		})
		.catch((err) => {
			if (err) {
				res.end("ERROR!");
			}
		});
});

//used to render the form where a user can enter a new recipe with flash message for when upload error occurs
router.get("/add-recipe", (req, res, next) => {
	res.render("form", { flashMsg: req.flash("fileUploadError") });
});

//post action when the form is submitted by the user to update documents within the collection
router.post("/submit-recipe", upload, (req, res, next) => {
	const imagepath = `/static/images/${req.files.image[0].filename}`;
	const pdfpath = req.files.recipePDF
		? `/static/pdfs/${req.files.recipePDF[0].filename}`
		: null;

	const recipeData = {
		name: req.body.name,
		chef: req.body.chef,
		description: req.body.description,
		meal: req.body.meal,
		preptime: req.body.preptime,
		cooktime: req.body.cooktime,
		image: imagepath,
		recipePDF: pdfpath,
	};

	const recipe = new Recipe(recipeData);
	recipe
		.save()
		.then(() => {
			res.redirect("/");
		})
		.catch((err) => {
			if (err) {
				console.log(err);
				throw new Error("RecipeSaveError", recipe);
			}
		});
});

//renders the recipe pug template based on the id stored in the recipes array (index of the array)
router.get("/recipe/:recipeid", (req, res, next) => {
	Recipe.findOne({ _id: req.params.recipeid })
		.then((recipe) => {
			res.render("recipe", { recipe });
		})
		.catch((err) => {
			if (err) console.log(err);
		});
});

//route handler to that renders from to allow user to edit meta-data on an existing recipe
router.get("/recipe/:recipeid/edit-recipe", (req, res, next) => {
	console.log(`finding ${req.params.recipeid}`);
	Recipe.findOne({ _id: req.params.recipeid })
		.then((recipe) => {
			res.render("recipeUpdate", { recipe });
		})
		.catch((err) => {
			if (err) console.log(err);
		});
});

//route handler to update the database document if user has updated any meta-data on an existing recipe
router.post("/recipe/:recipeid/update-recipe", (req, res, next) => {
	Recipe.findOne({ _id: req.params.recipeid })
		.then((recipe) => {
			const data = {
				name: req.body.name,
				chef: req.body.chef,
				description: req.body.description,
				meal: req.body.meal,
				preptime: req.body.preptime,
				cooktime: req.body.cooktime,
			};
			recipe.set(data);
			recipe.save().then(() => {
				res.redirect(`/recipe/${req.params.recipeid}`);
			});
		})
		.catch((err) => {
			if (err) console.log(err);
		});
});

//route handler to delete a recipe from the database using the findById methods
//the handler will also delete the image and, if available, the pdf version of the recipe
router.post("/recipe/:recipeid/delete-recipe", (req, res, next) => {
	
	Recipe.findById(req.params.recipeid)
		.then((recipe) => {
			const imagePath = path.join(__dirname, '..', 'public', recipe.image.replace('/static/', ''));
			//use the filesystem unlink method to remove the image based on absolute path
			fs.unlink(imagePath, (err) => {
				if (err && err.code !== 'ENOENT') {
				  console.log('Error deleting image:', err);
				}else if(err === 'ENOENT'){
					console.log('File does not exist', err);
				}
			});
			//remove pdf if available
			if(recipe.recipePDF) {
				const pdfPath = path.join(__dirname, '..', 'public', recipe.recipePDF.replace('/static/', ''));
				console.log(pdfPath);
				fs.unlink(pdfPath, (err) => {
					if (err && err.code !== 'ENOENT') {
					  console.log('Error deleting image:', err);
					}else if(err === 'ENOENT'){
						console.log('File does not exist', err);
					}
				});
			}
			//finally, remove the documents from the collection
			Recipe.findByIdAndDelete(req.params.recipeid)
				.then(() =>{
					res.redirect("/");
				}).catch((err) => {
					if (err) console.log(err);
				});
		})
		.catch((err) => {
			if (err) console.log(err);
		});
});

//error handling to display flash message for either an incorrect image extension or an incorrect .pdf extension
router.use((err, req, res, next) => {
	console.error(err.stack);
	if (err.message === "OnlyImageFilesAllowed") {
		req.flash(
			"fileUploadError",
			"Please select an image with an extension of jpg, png, jpeg, gif, or webp.",
		);
		res.redirect("/add-recipe");
	} else if (err.message === "InvalidFileType") {
		req.flash(
			"fileUploadError",
			"Please select a pdf document that contains the recipe.",
		);
		res.redirect("/add-recipe");
	} else if (err.message === "RecipeSaveError") {
		req.flash("fileUploadError", "There was a problem saving your recipe.");
		res.redirect("/add-recipe");
	} else {
		next(err);
	}
});

module.exports = router;
