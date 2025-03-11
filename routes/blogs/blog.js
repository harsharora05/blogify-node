const { Router } = require("express");



const blogRouter = Router();



blogRouter.get("/blogs", function (req, res) {

});

blogRouter.post("/blog", function (req, res) {

});

blogRouter.put("/blog/:id", function (req, res) {

});


blogRouter.delete("/blog/:id", function (req, res) {

});

module.exports = blogRouter;