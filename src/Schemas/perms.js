const { Schema, model } = require('mongoose');

let perms = new Schema({
    GuildID: String,
    Role: String
})

module.exports = model('botperms', perms)
