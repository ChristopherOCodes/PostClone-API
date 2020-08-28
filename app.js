const express = require('express')
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Location = require('./models/location.js')
const User = require('./models/user.js')

const app = express();

app.use(bodyParser.json())

app.use('/graphql',
graphqlHTTP({
    schema: buildSchema(`
        type Location {
            name: String!
            address: String!
        }

        type User {
            email: String!
            password: String
            
        }

        input LocationInput {
            name: String!
            address: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            locations: [Location!]!
        }

        type RootMutation {
            createLocation(locationInput: LocationInput): Location
            createUser(userInput: UserInput) : User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        locations: () => {
            return Location.find().then(locations => {
                return locations.map(location => {
                    return {...location._doc}
                })
            }).catch(err => {
                throw err
            })
        },
        createLocation: (args) => {
            const location = new Location({
                name: args.locationInput.name,
                address: args.locationInput.address
            })
            return location.save().then(result => {
                console.log(result)
                return {...result._doc}
            }).catch(err => {
                console.log(err)
                throw err
            })
        },
        createUser: (args) => {
            return bcrypt.hash(args.userInput.password, 12).then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save()
            })
            .then(result => {
                return {...result._doc}
            })
            .catch(err => {
                throw err
            })
        }
    },
    graphiql: true
}))
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true)
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@postapi.bwlcr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
    app.listen(3000)
}).catch(err => {
    console.log(err)
})

