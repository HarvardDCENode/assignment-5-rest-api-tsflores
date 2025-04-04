const express = require("express");
const router = express.Router();
const multer = require("multer");
const recipeController = require("../../controllers/recipeController");

const RecipeService = recipeController.RecipeService;
// const path = require('node:path');
// const fs = require('node:fs');

//from the multer documentation on using .fields for multiple files
const upload = multer({
	storage: recipeController.storage,
	fileFilter: recipeController.imageFilter,
}).fields([
	{ name: "image", maxCount: 1 },
	{ name: "recipePDF", maxCount: 1 },
]);

router.use((req, res, next) => {
	res.set({
		// allow any domain, allow REST methods we've implemented
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers",
		"Content-type": "application/json"
	});
	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}
	next();
});

// create a new document in the database
router.post("/", upload, async (req, res, next) => {
	const imagepath = req.files.image
		? `/static/images/${req.files.image[0].filename}`
		: null;
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

	try {
		const recipeCreate = await RecipeService.create(recipeData);
		res.status(201);
		res.send(JSON.stringify(recipeCreate));
	} catch (error) {
		console.log(error);
		res.status(500).send(JSON.stringify({ error: error.message }));
	}
});

// return all of the documents in the database
router.get("/", (req, res, next) => {
	RecipeService.list().then((recipes) => {
		res.status(200);
		res.send(JSON.stringify(recipes));
	});
});

// find a specific document by id in the database
router.get("/:recipeid", (req, res, next) => {
	RecipeService.find(req.params.recipeid)
		.then((recipe) => {
			res.status(200);
			res.send(JSON.stringify(recipe));
		})
		.catch((err) => {
			res.status(404);
			res.send(err);
		});
});

// update properties within a specific document by id in the database
router.put("/:recipeid", (req, res, next) => {
	const put_data = req.body;
	console.log("Here is the body of the request");
	console.log(put_data.name);
	RecipeService.update(req.params.recipeid, put_data)
		.then((updatedRecipe) => {
			res.status(200);
			res.set({ "Content-type": "application/json" });
			res.send(JSON.stringify(updatedRecipe));
		})
		.catch((err) => {
			res.status(404);
			res.send(end);
		});
});

// delete a document from the database by id
router.delete("/:recipeid", (req, res, next) => {
	RecipeService.delete(req.params.recipeid)
		.then((deletedRecipe) => {
			res.status(200);
			res.send(JSON.stringify(deletedRecipe));
		})
		.catch((err) => {
			res.status(404);
			res.send(end);
		});
});

// error
router.use((err, req, res, next) => {
	console.error(err);
	res.status(500);
	res.end();
});

module.exports = router;
