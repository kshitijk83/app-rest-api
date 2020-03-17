const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images/');
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString()+file.originalname);
    }
});

const filefilter = (req, file, cb)=>{
    if(
        file.mimetype=='image/png'||
        file.mimetype=='image/jpg'||
        file.mimetype=='image/jpeg'
    ){
        cb(null, true);
    } else{
        cb(null, false);
    }
}

const app = express();
app.use(bodyParser.json());
app.use(multer({storage:storage,fileFilter:filefilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method==='OPTIONS'){
        return res.sendStatus(200);
    }
    next();
})

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    formatError(err){
        if(!err.originalError){
            return err;
        }
        const data = err.originalError.data;
        const message=err.message||'An Error Ocurred';
        const code = err.originalError.code||500;
        return {
            message,
            data,
            status: code
        }
    }
}));

// app.use((error, req, res, next)=>{
//     console.log(error);
//     const status = error.statusCode||500;
//     const message = error.message;
//     const data = error.data;
//     return res.status(status).json({
//         message: message,
//         data
//     })
// })

mongoose.connect(
    'mongodb+srv://kshitijk83:451422ere@paracticing-bfzmz.mongodb.net/messages?retryWrites=true'
)
.then(res=>{
    app.listen(8080);
})
.catch(err=>{
    console.log(err);
})