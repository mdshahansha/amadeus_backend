const mongoose=require('mongoose');

const BookingSchema=new mongoose.Schema({
    user:{
      type:mongoose.Schema.Types.ObjectId
 
    },
    details:{
        type:Object,
        required:true,
      
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports=mongoose.model('Booking',BookingSchema);