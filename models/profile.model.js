const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({

    avatar: {
        type: String,
    }


}, { timestamps: true }
)


module.exports = Profil = mongoose.model('profile', userSchema)