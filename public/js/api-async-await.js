// this is the async/await version of the original api.js, which uses Promise syntax

// wrap in IIFE to control scope
(()=> {

   const baseURL = ''; //  for development, it's http://localhost:3000

   async function testAPIs(){
    // test list first
    // const testId = '';
    // const testJSON = {};
    try{
        // list
        const list = await callAPI('GET', '/api/recipes', null, null)
        console.log('\n\n**************\nlist results:');
        console.log(list);
        
        // create form data object and metadata
        // This section is for uploading a file to the REST API
        const input = document.querySelector('input[type="file"]')
        const data = new FormData()
        data.append('image', input.files[0]);
        data.append('name', 'Recipe Name');
        data.append('chef', 'Recipe Contributor');
        data.append('description','Recipe Description');
        data.append('meal', 'Recipe Type');
        data.append('preptime', 'Recipe Preptime');
        data.append('cooktime', 'Recipe Cooktime');

        
        // create
        const newRecipe = await callAPI('POST', '/api/recipes', null, data)
        recipeId = newRecipe._id;
        console.log('\n\n***************\ncreate results:');
        console.log(newRecipe);
        
        // find
        const retreivedNewRecipe = await callAPI('GET',`/api/recipes/${newRecipe._id}`, null, null)
        console.log('\n\n**************\nfind results:');
        console.log(retreivedNewRecipe);

        // update description
        retreivedNewRecipe.description += ' :appended by the AJAX API ';
        const updatedRecipe = await callAPI('PUT',`/api/recipes/${retreivedNewRecipe._id}`, null, retreivedNewRecipe)
        console.log('\n\n*************\nupdate results:');
        console.log(updatedRecipe);
        
        // now find again to confirm that the description update was changed
        const retreivedUpdatedRecipe = await callAPI('GET',`/api/recipes/${updatedRecipe._id}`, null, null)
        console.log('\n\n*************\nfind results (should contain updated description field):');
        console.log(retreivedUpdatedRecipe);

        //delete
        const deletedRecipe = await callAPI('DELETE', `/api/recipes/${retreivedUpdatedRecipe._id}`, null, null)
        console.log(deletedRecipe);

    
    } catch(err) {
        console.error(err);
    };
  }//end testAPIs

  async function callAPI(method, uri, params, body){
    jsonMimeType = {
      'Content-type':'application/json'
     }
    try{
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
        ...(method==='POST' ? {body: body} : {}),
        ...(method==='PUT' ?  {headers: jsonMimeType, body:JSON.stringify(body)} : {})
      });
      // response.json() parses the textual JSON data to a JSON object. 
      // Returns a Promise that resolves with the value of the JSON object 
      //  which you can pick up as the argument passed to the .then()
      return response.json(); 
    }catch(err){
      console.error(err);
      return "{'status':'error'}";
    }
  }
      

  // Calls our test function when we click the button
  //  afer validating that there's a file selected.
  document.querySelector('#testme').addEventListener("click", ()=>{
    const input = document.querySelector('input[type="file"]')
    if (input.value){ 
      testAPIs();
    }else{
      alert("please select an image file first");
    }
  });
})();
