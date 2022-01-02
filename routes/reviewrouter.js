import express from 'express';
import { createRequire } from 'module';
import { reviewSchema } from '../models/review.js';
import { campSchema } from '../models/campground.js';
import {ExpressError} from '../utils/ExpressError.js';
import catchAsync from '../utils/catchAsync.js';
import { isLoggedIn,isReviewAuthor } from '../middleware.js';
const require=createRequire(import.meta.url);

const reviewrouter=express.Router({mergeParams:true});
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
const validateReview=(req,res,next)=>{
    const schema = Joi.object({ 
        review: Joi.string().required().escapeHTML(),
        rating:Joi.number().required().min(0).max(5), 
        
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

reviewrouter.post('/',isLoggedIn,validateReview,catchAsync(async(req,res,next)=>{
    console.log(req.params);
    const campground=await campSchema.findById(req.params.id);
    const review=new reviewSchema(req.body);
    review.author=req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();

req.flash('success','Successfully made a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
reviewrouter.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res,next)=>{
    const {id,reviewId}=req.params;
    await campSchema.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await reviewSchema.findByIdAndDelete(reviewId);
    req.flash('warning','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}))
export{reviewrouter};
