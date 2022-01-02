import { createRequire } from 'module';
const require=createRequire(import.meta.url);
require("dotenv").config();
const cloudinary=require('cloudinary').v2;
const {CloudinaryStorage}=require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage=new CloudinaryStorage({
    cloudinary,
    params:{
    folder:'YelpCamp',
    allowedFormats:['jpeg','png','jpg']
    }
    
});
export{cloudinary,storage};