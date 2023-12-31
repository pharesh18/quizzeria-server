const mongoose = require('mongoose');

mongoose.connect(process.env.DBSTR);
mongoose.connection.on('connected', () => { console.log("Database connected!") });
mongoose.connection.on('disconnected', () => { console.log("Database disconnected!") });
mongoose.connection.on('error', () => { console.log("Connection error!") });