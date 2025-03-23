const { Schema, model } = require('mongoose');

let dipSchema = new Schema({
    GuildID: String,
    UserID: String,
    Username: String,
    Reason: String,
    Lenth: String,
    EndTime: Date
})

module.exports = model('dipSchema', dipSchema)
