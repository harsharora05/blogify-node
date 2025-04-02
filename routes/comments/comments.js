const { Router } = require("express");
const isUser = require("../../middlewares/userMiddleware.js");
const { z, object } = require("zod");
const { commentModel } = require("../../db.js");
const Types = require("mongoose");








const Comment = Router();
Comment.use(isUser);


Comment.get('/:pid', async function (req, res) {

    // give all post comments
    let postId = req.params.pid;

    const comments = await commentModel.find({ post: postId, parentComment: null },);

    return res.json({ comments });


});


Comment.post('/:pid', async function (req, res) {


    try {

        const pid = req.params.pid;
        const commentSchema = z.object({
            content: z.string().min(10, "Too Short").max(300, "Too Long")
        })

        const validatedData = commentSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.json(validatedData.error.format());
        }

        const postComment = await commentModel.create({
            by: req.id,
            post: pid,
            content: validatedData.data.content
        });

        if (postComment) {
            res.json({ message: "comment posted successfully" });
        } else {
            res.json({ message: "Error occured" });
        }



    } catch (e) {
        console.log(e);

    }


});


Comment.post('/:cid/reply/:pid', async function (req, res) {

    try {

        const cid = req.params.cid;
        const pid = req.params.pid;
        const commentSchema = z.object({
            content: z.string().min(10, "Too Short").max(300, "Too Long")
        })

        const validatedData = commentSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.json(validatedData.error.format());
        }

        // get comment 

        const parentComment = await commentModel.findOne({ _id: cid });

        if (!parentComment) {
            return res.json({ message: "comment not found" });
        }

        const childComment = await commentModel.create({ post: pid, by: req.id, parentComment: parentComment._id, content: validatedData.data.content });

        if (!childComment) {
            return res.json({ message: "can't comment now ... Try again Later!!!" });
        } else {
            parentComment.reply.push(childComment._id);
            await parentComment.save();
            return res.json({ message: "comment posted successfully" });
        }







    } catch (e) {
        console.log(e);

    }



});





Comment.put('/:id', function (req, res) {

});


Comment.delete('/:id', function (req, res) {

});








module.exports = Comment;
