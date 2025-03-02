import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username:{type:String,required:[true,"Please provide a username"],unique:true},
    email:{type:String,required:[true,"Please provide a email"],unique:true},
    password :{type:String,required:[true,"Please provide a password"],},
    isVerified :{type:Boolean ,default:false},
    total_points : {
        type:Number,default:0
    },
    badges :{type:[String],default:[]},
    hosted_quizzes : [ {type: mongoose.Schema.Types.ObjectId ,ref:"Quiz"}]

}, { timestamps: true})  

const User  = mongoose.models.User || mongoose.model("User",userSchema);

export default User;