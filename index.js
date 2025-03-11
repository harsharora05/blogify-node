const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config()
const user = require("./routes/authentication/user.js");
const blog = require("./routes/blogs/blog.js");

const app = express();
app.use(express.json());

app.use('/user', user);
app.use('/', blog);



app.listen(3001, () => {
    mongoose.connect(process.env.connection);
    console.log("Server Running on port 3001");
})