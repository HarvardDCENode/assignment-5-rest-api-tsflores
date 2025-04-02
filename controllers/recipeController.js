const multer = require('multer');

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

module.exports.storage = storage;
module.exports.imageFilter = imageFilter;