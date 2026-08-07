const dns = require('dns');
// Force Node.js to use Cloudflare and Google DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);  
const mongoose=require('mongoose');

async function connectDB(){
    await mongoose.connect("mongodb+srv://yt-backend:OyYWGwWh0lXHl13D@backend-cluster.zgb2fvk.mongodb.net/halley")
    console.log("Database connected successfully");
}

module.exports=connectDB;