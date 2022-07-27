const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Conecta no MongoDB
mongoose.connect(process.env.MONGO_ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true } /* "mongodb://localhost:27017/User" */);
mongoose.Promise = global.Promise;

module.exports = mongoose;