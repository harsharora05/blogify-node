const mongoose = require("mongoose");
const { Schema, Types } = mongoose;


const userSchema = new Schema({
    name: { type: String },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
}, { timestamps: true });

const categories = ["Sports",
    "Business",
    "Entertainment",
    "Life",
    "Food",
    "Others"];

const postSchema = new Schema({
    title: { type: String, unique: true, required: true, maxLength: 70 },
    by: { type: Types.ObjectId, ref: 'users', required: true },
    content: { type: String, minLength: 50, maxLength: 1000, required: true },
    category: { type: String, enum: categories },
    image: { type: String, required: true },
    likes: { type: Number, default: 0 }
}, { timestamps: true });




const commentSchema = new Schema({
    by: { type: Types.ObjectId, required: true, ref: 'users' },
    post: { type: Types.ObjectId, required: true, ref: 'posts' },
    parentComment: { type: Types.ObjectId, default: null, ref: 'comments' },
    content: { type: String, required: true, maxLength: 300 },
    reply: [{ type: Types.ObjectId, ref: 'comments' }]
}, { timestamps: true });

// commentSchema.pre("find", function (next) {
//     this.populate({
//         path: "reply",
//         populate: { path: "by" }
//     })
//     next()
// });

const favPostSchema = new Schema({
    likedBy: { type: Types.ObjectId, required: true, ref: 'users' },
    post: { type: Types.ObjectId, required: true, ref: 'posts' }
});

favPostSchema.index({ likedBy: 1, post: 1 }, { unique: true });



const userModel = mongoose.model('users', userSchema);
const postModel = mongoose.model('posts', postSchema);
const commentModel = mongoose.model('comments', commentSchema);
const FavPostModel = mongoose.model('favPosts', favPostSchema);

module.exports = { userModel, postModel, commentModel, FavPostModel };