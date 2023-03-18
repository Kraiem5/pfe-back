const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require("dotenv").config();

const roles = ['ADMIN', 'TECHNICIEN', 'INGENIEUR']

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    role: {
        type: String,
        required: true,
        enum: roles,
        default: ''
    },
    avatar: {
        type: String,
    }
    ,
    cv: {
        type: String,
    }
    ,
    cin: {
        type: String,
    },
    specialite: {
        type: String,
    },

}, { timestamps: true }
)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash(this.password, salt)
    } catch (error) {
        return next(error)
    }
})

module.exports = User = mongoose.model('user', userSchema)