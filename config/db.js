const mongoose=require('mongoose');

mongoose
.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongodb is connected"))
.catch((err)=>console.log("Failed to connect mognoDB ",err));

