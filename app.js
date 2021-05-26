const express=require("express");
const app=express();
const http=require("http");
const https=require("https");
const alert=require("alert");
app.set("view engine","ejs");
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const dotenv = require('dotenv');
dotenv.config();
const port=process.env.PORT;
const key1=process.env.key1;
const key2=process.env.key2;
var city,day,week,currentData,mintemp=[],maxtemp=[],humidity=[],pressure=[],icon=[],description=[];
app.get("/",function(req,res){
    res.render("city");
})
app.get("/city",function(req,res){
    res.render("report",{city:city,day:day,week:week,currentData:currentData,
        mintemp:mintemp,maxtemp:maxtemp,humidity:humidity,pressure:pressure,icon:icon,description:description})
})
app.post("/",function(req,res){
    city=req.body.city;
    const url="http://api.positionstack.com/v1/forward?access_key="+key1+"&query="+city+"&limit=1&output=json";
    http.get(url,function(response){
        //console.log(response.statusCode);
        if(response.statusCode!=200){
            res.render("error");
        }else{
        let rawData = '';
        response.on("data",function(chunk){
        rawData += chunk;
        })
        response.on('end', () => {
            const placeData=(JSON.parse(rawData));
            if(placeData.data.length==0){
                res.render("error");
        }
        else{
            const lat=placeData.data[0].latitude;
            const lon=placeData.data[0].longitude;
            const url2="https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly&units=metric&appid="+key2;
            https.get(url2,function(resp){
                //console.log(resp.statusCode);
                resp.on("data",function(data){
                    const weatherData=JSON.parse(data);
                    currentData={
                            temp:weatherData.current.temp,
                            pressure:weatherData.current.pressure,
                            humidity:weatherData.current.humidity,
                            description:weatherData.current.weather[0].description,
                            icon:"http://openweathermap.org/img/wn/"+weatherData.current.weather[0].icon+"@2x.png",
                    }
                    for(var i=0;i<=5;i++)
                    {
                        mintemp.push(weatherData.daily[i].temp.min);
                        maxtemp.push(weatherData.daily[i].temp.max);
                        humidity.push(weatherData.daily[i].humidity);
                        pressure.push(weatherData.daily[i].pressure);
                        icon.push("http://openweathermap.org/img/wn/"+weatherData.daily[i].weather[0].icon+"@2x.png");
                        description.push(weatherData.daily[i].weather[0].description);
                    }
                    
                    day = new Date(weatherData.current.dt*1000);
                    week = new Array("Sunday","Monday","Tuesday", "Wednesday","Thursday","Friday","Saturday" );
                    /*res.render("report",{flag:flag,city:city,day:day,week:week,currentData:currentData,
                        mintemp:mintemp,maxtemp:maxtemp,humidity:humidity,pressure:pressure,icon:icon,description:description});*/
                        res.redirect("/city");
                }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      })})}
        })}
    })
})


app.listen(port,function(){
    console.log("Server up and running on port "+port);
})