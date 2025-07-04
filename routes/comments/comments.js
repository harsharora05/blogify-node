const { Router } = require("express");
const isUser = require("../../middlewares/userMiddleware.js");
const { z } = require("zod");
const { commentModel } = require("../../db.js");
const Types = require("mongoose");
const { populate } = require("dotenv");








const Comment = Router();
Comment.use(isUser);

// multilevel comments population
// async function populateReplies(comment) {
//     await comment.populate({ path: 'by', select: 'username' });
//     await comment.populate({
//         path: 'reply',
//         populate: { path: 'by', select: 'username' },
//     });

//     for (let reply of comment.reply) {
//         await populateReplies(reply); // recursive step
//     }
// }

Comment.get('/:pid', async function (req, res) {

    // give all post comments
    try {
        let postId = req.params.pid;
        const comments = await commentModel.find({ post: postId, parentComment: null })
            .populate({
                path: "by",
                select: "username",
            })
            .populate({
                path: "reply",
                populate: {
                    path: "by",
                    select: "username",
                },
            })
            .sort({ createdAt: -1 });
        // for (const comment of comments) {
        //     await populateReplies(comment);
        // }
        if (comments) {
            return res.status(200).json({ comments: comments });
        } else {
            return res.status(400).json({});
        }

    } catch (e) {

        console.log(e);

        return res.status(500).json({});
    }



});


Comment.post('/:pid', async function (req, res) {


    try {

        const pid = req.params.pid;

        const commentSchema = z.object({
            content: z.string().min(5, "Too Short").max(300, "Too Long")
        });

        const validatedData = commentSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({ "message": validatedData.error.format() });
        }

        const postComment = await commentModel.create({
            by: req.id,
            post: pid,
            content: validatedData.data.content
        });
        const comment = await commentModel.findOne({ _id: postComment._id }).populate({ path: "by", select: "username" });

        if (postComment) {
            res.status(200).json({ "message": "comment posted successfully", "comment": comment });
        } else {
            res.status(400).json({ "message": "Some Error occured" });
        }



    } catch (e) {
        console.log(e);
        return res.status(500).json({});

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
            return res.status(400).json({ message: "comment not found" });
        }

        const childComment = await commentModel.create({ post: pid, by: req.id, parentComment: parentComment._id, content: validatedData.data.content });

        if (!childComment) {
            return res.status(400).json({ message: "can't comment now ... Try again Later!!!" });
        } else {
            parentComment.reply.push(childComment._id);
            await parentComment.save();
            return res.status(200).json({ message: "comment posted successfully" });
        }







    } catch (e) {
        console.log(e);
        return res.status(500).json({});

    }



});





Comment.put('/:cid', async function (req, res) {

    const cid = req.params.cid;

    try {

        const newCommentSchema = z.object({
            content: z.string().min(10, "Too Short").max(300, "Too Long")
        });

        const CommentValidation = newCommentSchema.safeParse(req.body);

        if (!CommentValidation.success) {
            res.json({
                message: CommentValidation.error.format()
            })
        }

        const oldComment = await commentModel.findOneAndUpdate({ _id: cid, by: req.id }, {
            content: CommentValidation.data.content
        });

        if (!oldComment) {
            return res.json({
                message: "you can't update comment...Try again!!"
            });
        } else {
            return res.json({
                message: "comment updated"
            })
        }

    } catch (e) {
        console.log(e)
    }



});


Comment.delete('/:cid', async function (req, res) {

    const cid = req.params.cid;


    const result = commentModel.deleteMany({
        $or: [
            { _id: cid },
            { parentComment: cid }
        ]
    });

    console.log(result);

});








module.exports = Comment;
