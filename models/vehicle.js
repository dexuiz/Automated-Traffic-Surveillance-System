var mongoose =  require("mongoose");
var schema = new mongoose.Schema({
    liplate:String,
    offense_type:String,
    date:{
      type:Date
    },
    image:{
      data:Buffer,
      contentType:String
    },
    vehicle_type:{
      type:String
    },
    coords:{
      lat:Number,
      lng:Number
    }
})

module.exports = mongoose.model("vehicle",schema);
