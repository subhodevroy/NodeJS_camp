

import { createRequire } from 'module';
const require=createRequire(import.meta.url);
require('dotenv').config();

const multer=require('multer');
import {cloudinary, storage} from '../cloudinary/index.js';
import express from 'express';
import { campSchema } from '../models/campground.js';
import {ExpressError} from '../utils/ExpressError.js';
import catchAsync from '../utils/catchAsync.js';
import { isLoggedIn,isAuthor } from '../middleware.js';
const upload=multer({storage});
var methodOverride=require('method-override');

const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken})
const camprouter=express.Router();
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)
const validateSchema=(req,res,next)=>{
    const schema = Joi.object({ 
        title: Joi.string().required().escapeHTML(),
        price:Joi.number().required().min(0), 
      //  image:Joi.string().required(),
        location:Joi.string().required().escapeHTML(),
        description:Joi.string().required().escapeHTML(),
        deleteImages:Joi.array()
    });

        const {error} = schema.validate(req.body);
        if(error)
        {
            const msg=error.details.map(el=>el.message).join(',');
            throw new ExpressError(msg,400);
        }
        else{
            next();
        }
}

camprouter.get('/',async(req,res)=>{
    const camps=await campSchema.find({});
    res.render('campgrounds/index',{camps});
})
camprouter.post('/',isLoggedIn,upload.array('image'),validateSchema,catchAsync(async(req,res,next)=>{
    //if(!req.body) throw(new ExpressError("Invalid Data",404));
    const geodata=await geocoder.forwardGeocode({
        query:req.body.location,
        limit:1
    }).send()
    
   
    const camp=new campSchema(req.body);
    camp.geometry=geodata.body.features[0].geometry;
    camp.images=req.files.map(f=>({url:f.path,filename:f.filename}));
    camp.author=req.user._id
       await camp.save();
   //    console.log(camp);
       req.flash('success','Successfully made a new campground!');
        res.redirect(`campgrounds/${camp.id}`);
}))

camprouter.get('/new',isLoggedIn,(req,res)=>{
    
    res.render('campgrounds/new');
})

camprouter.get('/:id',catchAsync(async(req,res,next)=>{
   
    const{id}=req.params;
    const camp=await campSchema.findById(id).populate({
        path:'reviews',
    populate:{
        path:'author'
    }}).populate('author');
    //console.log(camp);
    if(!camp)
    {
        req.flash('error','Cannot find a campground!!');
        res.redirect('/campgrounds');
    }
   // console.log(camp);
    res.render('campgrounds/show',{camp});
}))
camprouter.get('/:id/edit',isLoggedIn,isAuthor,async(req,res,next)=>{
    
    const {id}=req.params
   
    const camp=await campSchema.findById(id);
    if(!camp)
    {
        req.flash('error','No campground found!');
        return res.redirect(`/campgrounds/${id}`);
    }
    
    
    res.render('campgrounds/edit',{camp});
})

camprouter.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateSchema,catchAsync(async(req,res,next)=>{
    const {id}=req.params;
    
    const val=req.body;
    const camp=await campSchema.findByIdAndUpdate(id,val,{new:true});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    
    camp.images.push(...imgs);
    await camp.save();
    //console.log(camp);
    if(req.body.deleteImages)
    {
       for(let filename of req.body.deleteImages)
       {
           await cloudinary.uploader.destroy(filename);
       }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
       
    }
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${camp._id}`)
}))
camprouter.delete('/:id',isLoggedIn,isAuthor,catchAsync(async(req,res,next)=>{
    const {id}=req.params;
    await campSchema.findByIdAndDelete(id);
    req.flash('warning','Successfully deleted campground!');
    res.redirect('/campgrounds');
}))
export{camprouter};