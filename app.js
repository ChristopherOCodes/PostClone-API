const express = require('express')
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose')

const Location = require('./models/location.js')

const app = express();

const locations = []

app.use(bodyParser.json())

app.use('/graphql',
graphqlHTTP({
    schema: buildSchema(`
        type Location {
            name: String!
            address: String!
        }

        input LocationInput {
            name: String!
            address: String!
        }

        type RootQuery {
            locations: [Location!]!
        }

        type RootMutation {
            createLocation(locationInput: LocationInput): Location
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
        }
    },
    graphiql: true
}))
mongoose.set('useNewUrlParser', true);
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@postapi.bwlcr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
    app.listen(3000)
}).catch(err => {
    console.log(err)
})

