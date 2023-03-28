const mongoose = require('mongoose')
require("dotenv").config();

const userSchema = new mongoose.Schema({
    nom_projet: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    begin: {
        type: String,

    },
    end: {
        type: String,

    },
    user: {
        type: String,
    }
    ,
    code_postal: {
        type: String,
    }
    ,
    contrat: {
        type: String,
    }

}, { timestamps: true }
)


module.exports = Projet = mongoose.model('projet', userSchema)