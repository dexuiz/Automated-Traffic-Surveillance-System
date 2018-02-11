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
mongoose.connect("mongodb://dexuiz:deval1997@ds113775.mlab.com:13775/trafficanalysis")
app.use(express.static(__dirname+"/public"))
app.set('view engine','ejs')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride("_method"))

var port = process.env.PORT||3000;

//listens for client on this port
server.listen(port,()=>{
  console.log("server has started listening on port 8080");
})

//data request when client goes to /home
app.get("/home/json",(req,res)=>{
  vehicle.find({}).exec(function(err,data){
    if (err) {
      res.status(400)
      res.send("there was an error while looking up data in mongoDB")
    }else {
      console.log("data retrieved");
      data.forEach((element)=>{
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
  car.save();
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
        request.post("http://www.regcheck.org.uk/api/reg.asmx/CheckIndia",
        {form:{RegistrationNumber:data.liplate,username:'dexuiz11'}}, (err,response,body)=>{
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
              console.log(send);
              res.render("info",{data:data,extra:send})
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

//handling get requests to view form data
app.get("/form",(req,res)=>{
  res.render("form")
})


app.get("*",(req,res)=>{
  res.send("hello world,this seems to be working")
})
