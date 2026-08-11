const Imagekit=require('@imagekit/nodejs');
const { Folders } = require('@imagekit/nodejs/resources/index.js');

const imagekit=new Imagekit({
    privateKey: process.env.IMAGE_KIT_KEY
})

async function uploadFile(file) {
    const result=await imagekit.files.upload({
           file,
           fileName:"music_" + Date.now(),
           folder:"yt-complete-backend/music"
    })
    
     return result;
}

module.exports={ uploadFile}
