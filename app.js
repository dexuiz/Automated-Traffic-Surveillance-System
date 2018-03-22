/*

Project name:     Automated Traffic surveillance system
Author List:      deval Srivastava
Filename:         app.js
Functions:        None
Global Variables: express,app,server,bodyParser,mongoose,io,multer,upload,fs,dateTime,request,parser,del,methodOverride,vehicle

*/




var express = require('express')
var app = express()
var server  = require("http").createServer(app)
var bodyParser = require('body-parser')
var mongoose =  require('mongoose')
var io = require('socket.io')(server);
var multer = require('multer');
var upload = multer({dest:"uploads/"})
var fs = require("fs");
var dateTime = require('date-and-time');
var request = require("request");
var parser = require('xml2js').parseString;
var del = require("del")
var methodOverride = require("method-override")

//server configuration
var vehicle = require("./models/vehicle.js")
var review = require("./models/review.js")

//twilio configuration for sending SMSs

const accountSid = 'ACa241242dc141e1080a32356d9995ac6d';
const authToken = 'e2da70825afdd3745029197b19ab41fe';
const client = require('twilio')(accountSid, authToken);

//offenses
offenses={
  "SIGNAL":"Breaking the Red light",
  "SPEED":"Overspeeding",
  "HELMET":"Without wearing a helmet"
}


mongoose.connect("mongodb://dexuiz:deval1997@ds113775.mlab.com:13775/trafficanalysis")
app.use(express.static(__dirname+"/public"))
app.set('view engine','ejs')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride("_method"))

var port = process.env.PORT||3000;

//listens for client on this port
server.listen(port,()=>{
  console.log("server has started listening on port "+port);
})

//data request when client goes to /home
app.get("/home/json",(req,res)=>{
  vehicle.find({}).exec(function(err,data){
    if (err) {
      res.status(400)
      res.send("there was an error while looking up data in mongoDB")
    }else {
      console.log("data retrieved");
      console.log(data.length);
      data.forEach((element)=>{
        if (!element.coords.lat || !element.coords.lng) {
            console.log("err",element.liplate);
        }
        element.image ={};
      })
      res.send(data)
    }
  })
})

//sockets.io config
io.sockets.on('connection',function(socket){
  console.log("the map is connected");

  socket.on("works",function(data){
    console.log(data);
  })

  socket.emit('success',{hello:'world'})
})

// client requests for /home
app.get("/home",(req,res)=>{
  res.render("home")
})

//handling post requests to /new for adding new data by python script
app.post("/new",(req,res)=>{
  console.log("python script data recieved");
  // console.log(req.body);
  var originaldata = new Buffer(req.body.image, 'base64');
  console.log(originaldata);
  console.log(req.body.lat);
  console.log(req.body.lng);
  var car =  new vehicle();
  car.liplate=req.body.liplate;
  car.offense_type = req.body.offense_type;
  car.coords.lat = req.body.lat;
  car.coords.lng = req.body.lng;
  car.vehicle_type = req.body.vehicle_type
  car.date = req.body.date
  res.status(200)
  res.send("ok")
  io.sockets.emit("point",car)
  car.image.data = originaldata;
  car.image.contentType = "image/jpg";
  car.phone=9699727877;
  car.save(function(err){
    console.log("ther was an error ",err);
  });
  client.messages
    .create({
      to: '+919699727877',
      from: '+12672148944',
      body: `The vehicle registered to this number was caught ${offenses[car.offense_type.toString().toUpperCase()]} on ${car.date}`,
    })
    .then(message => console.log(message.sid), error => console.error(error));

});


//handling get request to view individual edit form for each entry in database
app.get("/inf/:id/edit",(req,res)=>{
  vehicle.findById(req.params.id,(err,data)=>{
    if (err) {
        res.send("there was some error",err)
    }else {
      res.render("edit",{data:data})
    }
  })
})

//handling post request to view form to manually add offender information
app.post("/formin",upload.single('image'),(req,res,next)=>{
  console.log(req.body.body.liplate);
  console.log(req.file);
  console.log(req.body.body.coords)
  // console.log(req.file);
  var car  = new vehicle()
  car.vehicleType =
  car.image.data = fs.readFileSync(req.file.path)
  car.image.contentType="image/jpg";
  car.date = Date.now()
  car.coords = JSON.parse(req.body.body.coords)
  car.liplate = req.body.body.liplate
  car.offense_type = req.body.body.offense_type
  car.save((err,data)=>{
    if (err) {
      console.log("there was an error"+err);
    }else
    {
      del(['uploads/*']).then(paths =>{
        console.log('files and folders deleted are:\n',paths.join('\n'));
      });
      console.log(data);
      res.redirect("/home")
    }
  })
})


//handling put requests to edit each entry
app.put("/inf/:id",(req,res)=>{
  vehicle.findById(req,params.id,(err,data)=>{
    car.image.data = fs.readFileSync(req.file.path)
    car.image.contentType="image/jpg";
    car.date = Date.now()
    car.coords = JSON.parse(req.body.body.coords)
    car.liplate = req.body.body.liplate
    car.offense_type = req.body.body.offense_type
    car.save((err,data)=>{
      if (err) {
        console.log("there was an error"+err);
      }else
      {
        del(['uploads/*']).then(paths =>{
          console.log('files and folders deleted are:\n',paths.join('\n'));
        });
        console.log(data);
      }
    })
  })
})

//handling request for each information page for a offender entry in the database
app.get("/inf/:id",(req,res)=>{
  console.log(req.params.id);
  vehicle.findById(req.params.id,(err,data)=>{
    if (err) {
      console.log("error while finding by id");
      res.render("home",)
    }else {
      if(data.liplate){
        var send = {}
        var multiple = {}
        request.post("http://www.regcheck.org.uk/api/reg.asmx/CheckIndia",
        {form:{RegistrationNumber:data.liplate,username:'dexuiz20'}}, (err,response,body)=>{
          if (response.statusCode == 200) {
            // console.log(body);
             parser(body,(err,result)=>{
              vehicleJson = JSON.parse(result.Vehicle.vehicleJson[0])
              // console.log(vehicleJson);
              for(var key in vehicleJson){
                // console.log(vehicleJson[key]);
                send[key] = vehicleJson[key]
              }
              data.img=new Buffer(data.image.data).toString('base64');
              data.image={}
              // console.log(send);
              vehicle.find({"liplate":new RegExp(data.liplate,"i")},function(err,vehicles){
                console.log(vehicles.length);
                vehicles.forEach(value=>{
                  console.log(value.liplate);
                  value["img"]=new Buffer(value.image.data).toString('base64');
                  delete value.image;
                })
                res.render("info",{data:data,extra:send,multiple:vehicles})
              })
            })

          }else{
            console.log("there was an error ",err,body,response.statusCode);
            res.send(err,body,response.statusCode)
          }
        })
      }
      else{
        console.log("data.liplate does not exist");
      }
    }
  })
})

//handling search requests
app.get("/search",(req,res)=>{
  console.log(req.query);
  vehicle.findOne({"liplate":new RegExp(req.query.q,"i")},function(err,vehicle){
    if (err) {
      console.log("there was an error in searching");
      res.status(500)
      res.send("error",err)
    }else {
      if (vehicle) {
        res.redirect("/inf/"+vehicle.id)
      }else {
        res.redirect("/home")
      }
    }
  })
})

app.get("/review",(req,res)=>{
  review.find({}).exec((err,data)=>{
    if (err) {
      console.erorr("cant find data for review");
      res.redirect("/home")
    }else {
      data.forEach((value)=>{
        value["random"] =`validate${Math.floor(Math.random()*40+10)}`
        value["img"] = new Buffer(value.carimage.data).toString("base64")
        // delete value.limage
      })
      res.render("review",{data:data})

    }
  })
})

app.post("/reviewget",(req,res)=>{
  console.log("reviewget endpoint reached")
  // console.log(req.body.limage)
  // var limage = new Buffer(req.body.limage, 'base64');
  var carimage = new Buffer(req.body.carimage,'base64');
  var rev = new review();
  // rev.limage.data = limage;
  rev.carimage.data = carimage;
  rev.offense_type = req.body.offense_type;
  rev.coords.lat = req.body.lat;
  rev.coords.lng = req.body.lng;
  rev.vehicle_type = req.body.vehicle_type
  rev.date = req.body.date
  rev.limage.contentType='image/jpg'
  rev.carimage.contentType='image/jpg'
  console.log("endpoint complete")
  rev.save();
  res.status(200)
  res.send("data save complete")
})


app.post("/review/:id",(req,res)=>{
  console.log("endpoint /review/",req.params.id,"reached");
  review.findById(req.params.id,function(err,data){
    if (err) {
      console.log("there was an error while retreiving review data");
      res.redirect("/home")
    }else {
      console.log("plate",req.body.liplate);
      if (!req.body.liplate) {
        data.remove(function(err,removed){
          if (err) {
            console.error("there was an error in deleting a review object");
          }
          else {
            console.log("succesfully removed object with license plate");
          }
        })
        res.redirect("/review")
      }else {
        console.log(`liplate${req.body}`);
        var car = new vehicle();
        car.liplate = req.body.liplate;
        car.date = data.date;
        car.image.data = data.carimage.data;
        car.image.contentType = data.carimage.contentType;
        car.coords.lat = data.coords.lat;
        car.coords.lng = data.coords.lng;
        car.vehicleType = data.vehicleType;
        car.offense_type = data.offense_type;
        console.log(car);
        car.save();
        data.remove(function(err,removed){
          if (err) {
            console.error("there was an error in deleting a review object");
          }
          else {
            console.log("succesfully removed object with license plate");
          }
        })
      }


    }
  })
})

app.get("/info2",(req,res)=>{
  res.render("info2")
})

//handling get requests to view form data
app.get("/form",(req,res)=>{
  res.render("form")
})

app.get("/",(req,res)=>{
  res.redirect("/home")
})

app.get("*",(req,res)=>{
  res.send("hello world,this seems to be working")
})
