const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next)=>{
    const currentPage = req.query.page;
    const perPage = 2;
    let totalItems;
    Post.find()
    .countDocuments()
    .then(count=>{
        totalItems = count;
        return Post.find()
                .skip((currentPage-1)*perPage)
                .limit(perPage)
    })
    .then(posts=>{
        res.status(200).json({
            message: 'posts fetched succesfully',
            posts: posts,
            totalItems
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}

exports.createPost = (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const err = new Error('No image provided');
        err.statusCode = 422;
        throw err;
    }
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: req.file.path,
        creator: req.userId,
    })
    post.save()
    .then(result=>{
        return User.findById(req.userId)
    })
    .then(user=>{
        user.posts.push(post);
        creator = user;
        return user.save();
    })
    .then(result=>{
        res.status(201).json({
            message: "post created successfully",
            post: post,
            creator: {_id: creator._id, name: creator.name}
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.getPost = (req, res, next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            const err = new Error('No Post of this id found');
            err.statusCode = 404;
            throw err;
        }
        return res.status(200).json({
            message: 'post fetched successfully',
            post: post
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}

exports.updatePost = (req, res, next)=>{
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw err;
    }
    if(req.file){
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const err = new Error('No image provided');
        err.statusCode = 422;
        throw err;
    }

    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw err;
        }
        if(imageUrl!==post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then(result=>{
        res.status(200).json({
            message: 'post updated successfully',
            post: result,
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req, res, next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw err;
        }
        if(post.creator.toString()!==req.userId){
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndDelete(postId);
    })
    .then(result=>{
        return User.findById(req.userId)
    })
    .then(user=>{
        user.posts.pull(postId);
        return user.save();
    })
    .then(result=>{
        res.status(200).json({
            message: 'post deleted succesfully.'
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getStatus = (req, res, next)=>{
    User.findById(req.userId)
    .then(user=>{
        res.status(200).json({
            message: 'status fetched.',
            status: user.status
        })
    })
}

exports.updateStatus = (req, res, next)=>{
    const status = req.body.status;
    User.findById(req.userId)
    .then(user=>{
        user.status = status;
        return user.save();
    })
    .then(result=>{
        res.status(200).json({
            message: 'status updated.'
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

const clearImage = filePath=>{
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err=>console.log(err));
}