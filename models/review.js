var mongoose =  require("mongoose");
var schema = new mongoose.Schema({
    offense_type:String,
    date:{
      type:Date
    },
    limage:{
      data:Buffer,
      contentType:String
    },
    carimage:{
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

module.exports = mongoose.model("review",schema);
