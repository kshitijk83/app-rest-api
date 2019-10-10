const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next)=>{
    Post.find()
    .then(posts=>{
        res.status(200).json({
            message: 'posts fetched succesfully',
            posts: posts
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
    const post = new Post({
        title: title,
        content: content,
        imageUrl: req.file.path,
        creator:{
            name: 'Kshitiz Kumar'
        },
    })
    post.save()
    .then(result=>{
        res.status(201).json({
            message: "post created successfully",
            post: result
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

const clearImage = filePath=>{
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err=>console.log(err));
}