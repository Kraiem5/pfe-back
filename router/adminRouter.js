const express = require('express')
const router = express.Router()
const User = require('../models/user.model');
const { Role } = require('../models/role.model');

router.get('/role/all',async (req,res)=>{
    try {
        return await Role.find()
    } catch (error) {
        
    }
})

router.get('/role/new',async (req,res)=>{
    try {
        console.log(req.body)
    const role = new Role(req.body)
   return await  role.save()
    } catch (error) {
        console.log(error)
    }
})
module.exports = router