const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdOrder: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Location'
    }]
})

module.exports = mongoose.model('User', userSchema)