const express = require("express")
const musicController=require("../controllers/music.controller")
const authmiddleware = require("../middlewares/auth.middleware")
const router=express.Router()
const multer=require("multer")

const upload = multer({
    storage:multer.memoryStorage()
})
router.post('/upload',authmiddleware.authArtist,upload.single("music"),musicController.createMusic)
router.post('/album',authmiddleware.authArtist,musicController.createAlbum)



router.get("/", authmiddleware.authUser, musicController.getAllMusics)
router.get("/albums", authmiddleware.authUser, musicController.getAllAlbums)

router.get("/albums/:albumId", authmiddleware.authUser, musicController.getAlbumById)
module.exports=router;