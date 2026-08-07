const express = require('express');
const noteModel = require('./models/note_model');
const app = express();
app.use(express.json());

app.post('/notes',async (req,res)=>{
     const data = req.body;
     await noteModel.create({
        title: data.title,
        description: data.description
     })
     res.status(200).json({
        message: "Note created successfully"
     })
})

app.get('/notes',async (req,res)=>{
    const notes = await noteModel.find();
    res.status(200).json({
        notes: notes,
        message: "Notes fetched successfully"
    })
})

app.delete('/notes/:id',async (req,res)=>{
    const id = req.params.id;
    await noteModel.findOneAndDelete({
        _id:id
    })
    res.status(200).json({
        message: "Note deleted successfully"
    })
})

app.patch('/notes/:id',async (req,res)=>{
    const id = req.params.id;
    const data = req.body;
    await noteModel.findOneAndUpdate({
        _id:id
    },{
        title: data.title,
        description: data.description
    })
    res.status(200).json({
        message: "Note updated successfully"
    })
})

module.exports = app;