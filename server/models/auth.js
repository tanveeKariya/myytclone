import mongoose from "mongoose";
const userSchema = mongoose.Schema({

email:{type:String,require:true},
name :{type:String},
desc :{type:String},
joinedOn:{type:String,default:Date.now},

points:{type:Number,default:0}

})

export default mongoose.model("User",userSchema)