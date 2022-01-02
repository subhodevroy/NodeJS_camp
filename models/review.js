import mongoose from 'mongoose';
const Schema=mongoose.Schema;
const reviewschema=new Schema({
    rating:Number,
    review:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
});
const reviewSchema=mongoose.model("reviewSchema",reviewschema);
export {reviewSchema};