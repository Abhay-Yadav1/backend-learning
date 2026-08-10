const dns = require('dns');
// Force Node.js to use Cloudflare and Google DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose=require('mongoose');


async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB connected');
    }catch(err){
        console.log(err);
    }
}

module.exports = connectDB;
