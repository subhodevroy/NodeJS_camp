
import mongoose from 'mongoose';
import { createRequire } from 'module';
const require=createRequire(import.meta.url);
require('dotenv').config();
import { campSchema } from '../models/campground.js';
import {data} from './cities.js';
import {descriptors,places} from './seedHelpers.js';
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken})
mongoose.connect('mongodb://localhost:27017/camp',{useNewUrlParser:true,useUnifiedTopology:true});
const db=mongoose.connection;
db.on('error',console.error.bind(console,"Connection error"));
db.once("open",()=>{
    console.log("Database connected");
})
const sample=array=>array[Math.floor(Math.random()*array.length)]
console.dir(sample);
const seedDB=async()=>{
    await campSchema.deleteMany();
    for(var i=0;i<200;i++)
    {
        
        var rand=Math.floor(Math.random()*1000);
        var price=Math.floor(Math.random()*1000+500);
        const location=`${data[rand].city},${data[rand].state}`;
      //   const geodata=await geocoder.forwardGeocode({
      //     query:location,
      //     limit:1
      // }).send()
        const camp=new campSchema({
            author:"61b316665cf1fb706dd5a452",
            location:location,
            title:`${sample(descriptors)},${sample(places)} `,
            geometry: {
              type: "Point",
              coordinates: [
                  data[rand].longitude,
                  data[rand].latitude,
              ]
          },
           // geometry:geodata.body.features[0].geometry,
            images: [
                {
                  url: 'https://res.cloudinary.com/dlwuqiplq/image/upload/v1640803159/YelpCamp/sxiiwimx4o73k88ylabd.jpg',
                  filename: 'YelpCamp/sxiiwimx4o73k88ylabd'
                 
                },
                {
                  url: 'https://res.cloudinary.com/dlwuqiplq/image/upload/v1640803160/YelpCamp/ggsrwuh9ge967cww9dpo.jpg',
                  filename: 'YelpCamp/ggsrwuh9ge967cww9dpo'
                 
                }
              ],
            description:'Camping, forest, campfire, food over fire, coffee, mist, woods, sunsets, lakes, leaves and trees',
            price:price
        })
        
        await camp.save();
        
    }
}
seedDB().then(()=>
mongoose.connection.close());