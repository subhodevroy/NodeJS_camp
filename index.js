import express from 'express';
import { createRequire } from 'module';
const require=createRequire(import.meta.url);
import path from 'path';
import mongoose from 'mongoose';
import { camprouter } from './routes/campgroundrouter.js';
import { reviewrouter } from './routes/reviewrouter.js';
import { userRouter } from './routes/userrouter.js';
import morgan from 'morgan';
import {User} from './models/user.js';
import {ExpressError} from './utils/ExpressError.js';
import catchAsync from './utils/catchAsync.js';
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

var methodOverride=require('method-override');
const ejsmate=require('ejs-mate');//for layout


const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local')
const _dirname=path.resolve();
const mongoSanitize=require('express-mongo-sanitize');
const session=require('express-session');
const MongoDBStore = require('connect-mongo');

const secret ='thisshouldbeabettersecret!';
const dbUrl='mongodb://localhost:27017/camp'||process.env.DB_URL;
console.log(dbUrl);
const app=express();
app.set('view engine','ejs');
app.set('views',path.join(_dirname,'/views'));
mongoose.connect(dbUrl,{useNewUrlParser:true,useUnifiedTopology:true});
app.engine('ejs',ejsmate);
app.use(express.urlencoded({ extended: true}))//for parsing request body
app.use(express.static(path.join(_dirname,'/public')))
app.use(methodOverride('_method'))
app.use(mongoSanitize());

app.use(morgan('tiny'))//for logging purpose
const db=mongoose.connection;
db.on('error',console.error.bind(console,"Connection error"));
db.once("open",()=>{
    console.log("Database connected");
})



const sessionConfig = {
    
    name: 'session',
    secret:secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600 // time period in seconds
      })
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
   res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.warning=req.flash('warning');
    next();
})

app.use('/',userRouter);
app.use('/campgrounds',camprouter);
app.use('/campgrounds/:id/reviews',reviewrouter);
app.get('/',(req,res)=>{
    res.render('home');
})
app.all('*',(req,res,next)=>{ //when none of paths are valid
next(new ExpressError("Page Not Found",404));
})


app.use((err,req,res,next)=>{
    const{statuscode,message}=err;
    if(!err.message){
        err.message="Something went wrong";
    }
    if(!err.statuscode){
        err.statuscode=500;
    }
    res.status(err.statuscode).render('campgrounds/error',{err});
})
const port=process.env.PORT||3000;
app.listen(port,(req,res)=>{
    console.log(`Listening to port ${port}`);
})