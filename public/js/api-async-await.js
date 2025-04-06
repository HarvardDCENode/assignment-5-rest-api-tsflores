// this is the async/await version of the original api.js, which uses Promise syntax

// wrap in IIFE to control scope
(() => {
	const baseURL = ""; //  for development, it's http://localhost:3000

	async function testAPIs() {
		// find test_results ID, append results as API test runs, and output to HTML
		const results = document.getElementById("test_results");
		results.innerHTML = "<h5>Running API Tests...</h5>";
		let testOutput = "<h6>API Test Results:</h6>";

		//try-catch wrapper for the entire application
		try {
			//find ids for the image and PDF uploads and make sure no issues with either of these two file
			const inputImage = document.getElementById("image");
			const inputPDF = document.getElementById("recipePDF");

			const imageFile = inputImage.files[0];
			const pdfFile = inputPDF.files[0];

			if (!imageFile.type.startsWith("image/")) {
				throw new Error(
					"Selected file is not a valid image.  Please select a file with a jpg, jpeg, webp, png, or gif extension.",
				);
			}

			if (pdfFile && pdfFile.type !== "application/pdf") {
				throw new Error(
					"Recipe upload selection is not a valid PDF file.  Please select a valid PDF file.",
				);
			}

			/******************************************************************************************************************************/
			/***** Use REST API to get all documents that currently exist in the collection  **********************************************/
			/******************************************************************************************************************************/

			const list = await callAPI("GET", "/api/recipes", null, null);
			console.log("\n\n**************\nlist results:");
			console.log(list);

			//output results of list to the HTML by appending to testOutput
			testOutput += `<p><strong>Database List Results via GET method:</strong> Found ${list.length} ${list.length !== 1 ? "recipes" : "recipe"} in the database:</p>`;
			if (list.length > 0) {
				testOutput += "<ul>";

				// biome-ignore lint/complexity/noForEach: <explanation>
				list.forEach((recipe) => {
					testOutput += `<li> ${recipe.name} </li>`;
				});
				testOutput += "</ul>";
			}

			//output to the div tag
			results.innerHTML = testOutput;

			/*************************************************************************************************************************/
			/***** Create a new record by first getting the files that were uploaded by the user; try-catch block on series of calls */
			/*************************************************************************************************************************/
			const data = new FormData();

			data.append("image", imageFile);
			data.append("name", "Recipe Name");
			data.append("chef", "Recipe Contributor");
			data.append("description", "Recipe Description");
			data.append("meal", "Recipe Type");
			data.append("preptime", "Recipe Preptime");
			data.append("cooktime", "Recipe Cooktime");

			if (pdfFile) {
				data.append("recipePDF", pdfFile);
			}

			const newRecipe = await callAPI("POST", "/api/recipes", null, data);
			if (newRecipe) {
				recipeId = newRecipe._id;
				console.log("\n\n***************\ncreate results:");
				console.log(newRecipe);

				// logging the key-value pair of the new recipe object created through the POST API call
				testOutput +=
					"<p><strong>New Recipe created via POST method: </strong></p> <ul>";
				for (const key in newRecipe) {
					testOutput += `<li> ${key}: ${newRecipe[key]} </li>`;
				}

				testOutput += "</ul>";

				results.innerHTML = testOutput;

				/*************************************************************************************************************************/
				/***** Edit the description of the document and use find change with the REST API    *************************************/
				/*************************************************************************************************************************/

				const retreivedNewRecipe = await callAPI(
					"GET",
					`/api/recipes/${newRecipe._id}`,
					null,
					null,
				);
				console.log("\n\n**************\nfind results:");
				console.log(retreivedNewRecipe);

				// logging the id of the recipe found
				testOutput += `<p><strong>Found recipe id via GET method: </strong>: ${retreivedNewRecipe._id} </p>`;

				results.innerHTML = testOutput;

				// update description
				retreivedNewRecipe.description = "Modified by the AJAX API";
				const updatedRecipe = await callAPI(
					"PUT",
					`/api/recipes/${retreivedNewRecipe._id}`,
					null,
					retreivedNewRecipe,
				);

				console.log("\n\n*************\nupdate results:");
				console.log(updatedRecipe);

				// now find again to confirm that the description update was changed
				const retreivedUpdatedRecipe = await callAPI(
					"GET",
					`/api/recipes/${updatedRecipe._id}`,
					null,
					null,
				);
				console.log(
					"\n\n*************\nfind results (should contain updated description field):",
				);
				console.log(retreivedUpdatedRecipe);

				// logging the change to the description for the PUT method
				testOutput += `<p><strong>Updated recipe description via PUT method to: </strong>: ${retreivedUpdatedRecipe.description} </p>`;

				testOutput += "<ul>";
				for (const key in retreivedUpdatedRecipe) {
					testOutput += `<li> ${key}: ${retreivedUpdatedRecipe[key]} </li>`;
				}

				testOutput += "</ul>";

				results.innerHTML = testOutput;

				/*************************************************************************************************************************/
				/***** Delete the document that was created at the start of the process via REST API *************************************/
				/*************************************************************************************************************************/

				const deletedRecipe = await callAPI(
					"DELETE",
					`/api/recipes/${retreivedUpdatedRecipe._id}`,
					null,
					null,
				);
				console.log(deletedRecipe);
				testOutput += `<p><strong>Deleted ${deletedRecipe.deletedCount} recipe via a DELETE method with ID of ${retreivedUpdatedRecipe._id}</strong></p>`;
				results.innerHTML = testOutput;
			}
		} catch (error) {
			console.error("Test API Error: ", error);
			results.innerHTML += `${testOutput}<p class='text-danger'><strong>Error:</strong> ${err.message}</p>`;
			return;
		}
	} //end testAPIs

	async function callAPI(method, uri, params, body) {
		jsonMimeType = {
			"Content-type": "application/json",
		};
		try {
			/*  Set up our fetch.
			 *   'body' to be included only when method is POST
			 *   If 'PUT', we need to be sure the mimetype is set to json
			 *      (so bodyparser.json() will deal with it) and the body
			 *      will need to be stringified.
			 *   '...' syntax is the ES6 spread operator.
			 *      It assigns new properties to an object, and in this case
			 *      lets us use a conditional to create, or not create, a property
			 *      on the object. (an empty 'body' property will cause an error
			 *      on a GET request!)
			 */
			const response = await fetch(baseURL + uri, {
				method: method, // GET, POST, PUT, DELETE, etc.
				...(method === "POST" ? { body: body } : {}),
				...(method === "PUT"
					? { headers: jsonMimeType, body: JSON.stringify(body) }
					: {}),
			});
			// response.json() parses the textual JSON data to a JSON object.
			// Returns a Promise that resolves with the value of the JSON object
			//  which you can pick up as the argument passed to the .then()
			return response.json();
		} catch (err) {
			console.error(err);
			return "{'status':'error'}";
		}
	}

	// Calls our test function when we click the button
	//  afer validating that there's a file selected.
	document.querySelector("#testme").addEventListener("click", () => {
		const input = document.querySelector('input[type="file"]');
		if (input.value) {
			testAPIs();
		} else {
			alert("please select an image file first");
		}
	});
})();
