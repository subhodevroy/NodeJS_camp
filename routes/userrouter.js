import {createRequire} from 'module';
const require=createRequire(import.meta.url);
import express from 'express';
import {User} from '../models/user.js';
import {ExpressError} from '../utils/ExpressError.js';
import catchAsync from '../utils/catchAsync.js';
import passport from 'passport';

const userRouter=express.Router();

userRouter.get('/register',async(req,res)=>{
    res.render('users/register');
})
userRouter.post('/register',catchAsync(async(req,res,next)=>{
    try{
        const{email,username,password}=req.body;
      
       const user=new User({email,username});
        const registereduser=await User.register(user,password);
       req.login(registereduser,err=>{
           if(err)
           {
               return nextTick(err)
           }
       })
        req.flash('success','Welcome to Camp');
        res.redirect('/campgrounds');
    
    }
    catch(e)
    {
        req.flash('error',e.message);
        res.redirect('/register');
    }
    
}));
userRouter.get('/login',async(req,res)=>{
    res.render('users/login');
})
userRouter.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),async(req,res)=>{
    const redirectUrl=req.session.returnTo ||'/campgrounds';
    //console.log(redirectUrl);
    delete req.session.returnTo;
    req.flash('success','Welcome to Camp');
        res.redirect(redirectUrl);
})
userRouter.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','GoodBye!You successfully logged out');
    res.redirect('/login');
})
export{userRouter};