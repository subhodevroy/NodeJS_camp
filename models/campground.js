import mongoose from "mongoose";
import { reviewSchema } from "./review.js";
import {User} from "./user.js";
const Schema=mongoose.Schema;
const ImageSchema=new Schema({
    url:String,
    filename:String
});
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
});
const opts={ toJSON: {virtuals:true}};
const campschema=new Schema({
    title:String,
    price:Number,
    images:[ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
        
    },
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
   reviews:[{
        type:Schema.Types.ObjectId,
        ref:'reviewSchema'
    }]
},opts);
campschema.virtual('properties.popUpMarkup').get(function(){
    return  `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>`;
})
const campSchema=mongoose.model('campSchema',campschema);

campschema.post('findOneAndDelete',async(doc)=>{
    if(doc)
    {
        await reviewSchema.deleteMany({_id:{$in:doc.reviews}})
    }
})
export {campSchema};