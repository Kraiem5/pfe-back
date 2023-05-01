const mongoose  = require("mongoose");

const roleSchema  = mongoose.Schema({
    name:String,
    description:String
})
const Role = mongoose.model('Role',roleSchema)
module.exports.Role =Role