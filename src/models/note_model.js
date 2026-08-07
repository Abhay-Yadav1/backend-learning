const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: String,
    description: String
})

const noteModel = mongoose.model('Note', noteSchema);  // notemodel ka kaam hai taaki hum database me data ko store kar sakein.

module.exports = noteModel;