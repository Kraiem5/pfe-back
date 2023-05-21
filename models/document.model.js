const mongoose  = require("mongoose");
const fileschema= mongoose.Schema({
    size:{type:String,default:''},
    path:{type:String,default:''}
})
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
    file:{
        type:fileschema,
        default:null
    }
}, { timestamps: true })
const Document = mongoose.model('Document',roleSchema)
module.exports.Document = Document