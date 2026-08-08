const Imagekit=require('@imagekit/nodejs');

const imagekit=new Imagekit({
    privateKey: process.env.IMAGE_KIT_KEY
})

async function uploadImage(buffer){
    const result = await imagekit.files.upload({
        file: buffer.toString('base64'),
        fileName: "image.jpg"
    })
    return result;
}

module.exports=uploadImage;