const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config()
const user = require("./routes/authentication/user.js");
const blog = require("./routes/blogs/blog.js");
const comment = require("./routes/comments/comments.js")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1/user', user);
app.use('/v1/', blog);
app.use('/v1/postComment', comment);



app.listen(3001, async () => {
    await mongoose.connect(process.env.connection);

    console.log("Server Running on port 3001");
})