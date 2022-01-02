import { campSchema } from "./models/campground.js";
import { reviewSchema } from "./models/review.js";
const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
{
    req.session.returnTo=req.originalUrl;
   // console.log(req.session.returnTo);
    req.flash('error','You must be sign in first');
    return res.redirect('/login')
}
else{
    next();
}
}
const isAuthor=async(req,res,next)=>{
    const {id}=req.params;
    const camp=await campSchema.findById(id);
    if(!camp.author.equals(req.user._id))
    {
        req.flash('error','You dont have permission for that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
const isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
   // console.log(req.params);
    const review=await reviewSchema.findById(reviewId);
    //console.log(review);
    if(!review.author.equals(req.user._id))
    {
        req.flash('error','You dont have permission for that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
export{isLoggedIn,isAuthor,isReviewAuthor};