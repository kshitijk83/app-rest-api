const User = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = {
    createUser: async function({userInput}, req){
        const {email, password, name} = userInput;
        const existingUser = await User.findOne({email: email});
        if(existingUser){
            const error = new Error('User exists already!');
            throw error;
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString()};
    },
    hello(){
        return 'hello';
    }
}