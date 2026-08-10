const express = require('express');
const userController = require('../controllers/auth.controller');
const router=express.Router();

router.post("/register", userController.registerUser)


module.exports=router;