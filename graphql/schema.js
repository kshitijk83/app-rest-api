const {buildSchema} = require('graphql');

module.exports = buildSchema(`
    type Post{
        _id: String!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt:String!
    }

    type User {
        _id: String!
        name:String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }

    input UserInputData{
        email: String!
        password: String!
        name:String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    type RootQuery{
        hello: String!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)