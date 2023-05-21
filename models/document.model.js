const mongoose  = require("mongoose");

const roleSchema  = mongoose.Schema({
    name:String,
    description:String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    parent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default:null
    },
    type:{type:String,default:'Dossier'},
    extension:{type:String,default:''}
}, { timestamps: true })
const Document = mongoose.model('Document',roleSchema)
module.exports.Document = Document