const multer = require('multer');
const Recipe = require('../models/recipeModel');

//check the fieldname and route the uploaded file appropriately 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname === 'image'){
            cb(null, 'public/images/');
        }else if(file.fieldname === 'recipePDF'){
            cb(null, 'public/pdfs/');
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

//include a conditional that also checkds for a .pdf extension when the fieldname is recipePDF
const imageFilter = (req, file, cb)=> {
    
    if(file.fieldname === 'image' && file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)){
        cb(null, true);
    }else if(file.fieldname === 'recipePDF' && file.originalname.match(/\.(pdf)$/i)){
        cb(null, true);
    }
    else if(file.fieldname === 'image'){
        cb(new Error('OnlyImageFilesAllowed'), false);
    }else{
        cb(new Error("InvalidFileType"), false);
    }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class RecipeService {

    // method to find all of the documents in the database
    static list(){
        return Recipe.find({})
            .then((recipes)=>{
                return recipes;
            });
    }

    // method to find an individual document by its id in the database
    static find(id){
        return Recipe.findById(id)
            .then((recipe)=>{
                return recipe;
            });
    }

    // method to create a new document in the database
    static create(obj){
        const recipe = new Recipe(obj);
        return recipe.save();
    }

    //method to update a document in the database
    static update(id, data){
        return Recipe.findById(id)
            .then((recipe)=>{
                recipe.set(data);
                recipe.save();
                return recipe;
            });
        }

    //method to delete a document from the database
    static delete(id){
        return Recipe.deleteOne({_id: id})
            .then((obj)=>{
                return obj;
            })
    }
}

module.exports.storage = storage;
module.exports.imageFilter = imageFilter;
module.exports.RecipeService = RecipeService;