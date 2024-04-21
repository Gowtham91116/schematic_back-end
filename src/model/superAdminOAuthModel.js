const mongoose = require('mongoose');

const superAdminSchema_O_Auth= new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    image: String
});

module.exports = mongoose.model('User', superAdminSchema_O_Auth);
