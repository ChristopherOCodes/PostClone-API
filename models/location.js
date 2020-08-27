const mongoose = require('mongoose');
const { isRequiredArgument } = require('graphql');
const Schema = mongoose.Schema;

const locationSchema =  new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Location', locationSchema);