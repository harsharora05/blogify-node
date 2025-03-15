const { Router } = require("express");
const isUser = require("../../middlewares/userMiddleware");
const { postModel } = require("../../db.js");
const { z, object } = require("zod");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');




const blogRouter = Router();


blogRouter.get("/blogs", async function (req, res) {

    const blogs = await postModel.find({});
    return res.json({ blogs: blogs });


});

blogRouter.use(isUser);


blogRouter.post("/blog", upload.single('image'), async function (req, res) {
    cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret
    });

    const postSchema = z.object({
        title: z.string().max(70, "Title length should not be greater than 70 chars"),
        content: z.string().min(50, "content too short").max(1000, "content too long"),
    });

    // console.log(req.body);
    // console.log(req.file);

    try {
        const validatedData = postSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.json(validatedData.error.format());
        }


        if (!req.file) {
            return res.status(400).json({ error: 'No Image uploaded' });
        }
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(req.file.mimetype)) {
            let stream = cloudinary.uploader.upload_stream(
                { folder: 'Blogify' }, // Optional folder in Cloudinary
                async (error, result) => {
                    if (error) return res.status(500).json({ error: error.message });

                    try {

                        const post = await postModel.create({
                            title: validatedData.data.title,
                            by: req.id,
                            content: validatedData.data.content,
                            image: result.secure_url
                        });

                        return res.json({ post: post });

                    } catch (e) {

                        const key = Object.keys(e.errorResponse.keyValue)
                        return res.json({ message: `A post with same ${key} already exits ` });

                    }




                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        } else {
            res.json({ message: "this image type is not allowed" });
        }





    } catch (err) {
        res.status(500).json({ error: err });
    }


});

blogRouter.put("/blog/:id", upload.single('image'), async function (req, res) {

    const id = req.params.id;

    const postSchema = z.object({
        title: z.string().max(70, "Title length should not be greater than 70 chars"),
        content: z.string().min(50, "content too short").max(1000, "content too long"),
        image: z.string().nullish()
    });

    const validatedData = postSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.json({ message: validatedData.error.format() });
    }

    try {
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!req.body.image) {

            if (!req.file) {
                return res.json("please provide an image");
            }

            if (allowedTypes.includes(req.file.mimetype)) {

                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret
                });

                const stream = cloudinary.uploader.upload_stream({ folder: 'Blogify' }, async function (err, result) {
                    if (err) {
                        return res.json({ message: "can't upload image" });
                    }

                    try {

                        const updatedPost = await postModel.updateOne({ _id: id }, {
                            title: validatedData.data.title,
                            by: req.id,
                            content: validatedData.data.content,
                            image: result.secure_url
                        });

                        if (updatedPost.modifiedCount > 0) {
                            return res.json({ message: " post updated successfully" });

                        } else {
                            return res.json({ message: "can't update" });
                        }



                    } catch (e) {

                        const key = Object.keys(e.errorResponse.keyValue)
                        return res.json({ message: `A post with same ${key} already exits ` });

                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);



            }
        } else {
            const updatedPost = await postModel.updateOne({ _id: id }, {
                title: req.body.title,
                content: req.body.content,
                image: req.body.image,
                by: req.id,
            });

            if (updatedPost.modifiedCount > 0) {
                return res.json({ message: "post updated successfully" });
            } else {
                return res.json({ message: "can't update" });
            }

        }
    } catch (e) {

        res.status(500).json({ error: err });

    }



});


blogRouter.delete("/blog/:id", async function (req, res) {

    const id = req.params.id;

    if (!id) {
        return res.json("no blog id provided");
    }

    try {
        const post = await postModel.deleteOne({ _id: id });
        if (post.deletedCount === 1) {
            return res.json({ message: "deleted successfully" });
        } else {
            return res.json({ message: "post doesn't exists" });
        }


    } catch (e) {
        console.log(e);

        return res.json({ message: "can't delete post!! Try Again" });
    }


});

module.exports = blogRouter;