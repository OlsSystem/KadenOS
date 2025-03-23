const { Schema, model } = require('mongoose');

let staffprofile = new Schema({
    GuildID: String,
    UserID: String,
    UserName: String,
    Role: String,
    Strikes: Number,
    Points: Number,
    Certification: String,
    Timezone: String,
    Banner: String
});

module.exports = model('staffprofiles', staffprofile)
