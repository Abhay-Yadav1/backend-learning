const express = require('express');
const postModel = require('./Models/post_model');
const multer = require('multer');
const uploadImage=require('./services/storage.service');
const app = express();
const cors = require("cors")
app.use(cors());
app.use(express.json());
const upload = multer({storage: multer.memoryStorage()});

app.post('/create-post', upload.single('image_uri'), async (req, res) => {
    const result = await uploadImage(req.file.buffer);
    const post = new postModel({
        image_uri: result.url,
        caption: req.body.caption
    });
    await post.save();
    res.status(201).json({
        post: post,
        message: "Post created successfully"
    });
});

app.get('/get-posts',async(req,res)=>{
    const posts = await postModel.find();
    res.status(200).json({
        posts: posts,
        message: "Posts fetched successfully"
    })
})


module.exports = app;
