exports.getPosts = (req, res, next)=>{
    res.status(200).json({
        title: 'First Post',
        content: 'This is the first post!'
    })
}

exports.createPost = (req, res, next)=>{
    const title = req.body.title;
    const content = req.body.content;
    // created post in db
    
    res.status(201).json({
        message: "post created successfully",
        post:[{
            id: Date.now(),
            title: title,
            content: content,
        }]
    })
}