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

router.post('/role/new',async (req,res)=>{
    try {
        console.log(req.body)
    const role = new Role(req.body)
   return await  role.save()
    } catch (error) {
        console.log(error)
    }
})
router.get('/users/all',async (req,res)=>{
    try {
        return await User.find()
    } catch (error) {
        
    }
})

router.get('/users/new',async (req,res)=>{
    try {
        console.log(req.body)
    const role = new User(req.body)
   return await  role.save()
    } catch (error) {
        console.log(error)
    }
})
module.exports = router