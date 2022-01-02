import mongoose from 'mongoose';
import { createRequire } from 'module';
const require=createRequire(import.meta.url);
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');
const userSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model('User',userSchema);
export{User};
