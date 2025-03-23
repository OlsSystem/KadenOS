const { Schema, model } = require('mongoose');

let StrikeSchema = new Schema({
    GuildID: String,
    UserID: String,
    UserTag: String,
    Content: Array
});

module.exports = model('strikeSchema', StrikeSchema)