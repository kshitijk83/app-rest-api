const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.signup = (req, res, next)=>{
    const error = validationResult(req);
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    if(!error.isEmpty()){
        const err = new Error('Validation Failed.');
        err.statusCode = 422;
        err.data = error.array();
        throw err;
    }
    bcrypt.hash(password, 12)
    .then(hashedPsw=>{
        const user = new User({
            email,
            password: hashedPsw,
            name
        });
        return user.save();
    })
    .then(result=>{
        res.status(200).json({
            message: 'User created!',
            userId: result._id
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}

exports.login = (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email})
    .then(user=>{
        if(!user){
            const err = new Error('email does not exist.');
            err.statusCode = 401;
            throw err;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password)
    })
    .then(isEqual=>{
        if(!isEqual){
            const err = new Error('password is incorrect.');
            err.statusCode = 401;
            throw err;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        },
        'secretkey',
        {
            expiresIn: '1h'
        });
        res.status(200).json({
            token,
            userId: loadedUser._id.toString()
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}