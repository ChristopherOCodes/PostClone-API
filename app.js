const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Location = require("./models/location.js");
const User = require("./models/user.js");

const app = express();

app.use(bodyParser.json());

app.use(
	"/graphql",
	graphqlHTTP({
		schema: buildSchema(`
        type Location {
            _id: ID!
            name: String!
            address: String!
            creator: User!
        }

        type User {
            email: String!
            password: String
            createdOrders: [Location!]
            
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
				return Location.find()
					.populate("creator")
					.then((locations) => {
						return locations.map((location) => {
							return {
								...location._doc,
								_id: location.id,
								creator: { ...location._doc.creator._doc, _id: location.id },
							};
						});
					})
					.catch((err) => {
						throw err;
					});
			},
			createLocation: (args) => {
				const location = new Location({
					name: args.locationInput.name,
					address: args.locationInput.address,
					creator: "5f4c5e66047ac44040e4b68c",
				});
				let createdOrder;
				return location
					.save()
					.then((result) => {
						createdOrder = { ...result._doc, id: result._doc._id.toString() };
						return User.findById("5f4c5e66047ac44040e4b68c");
						console.log(result);
						return { ...result._doc, id: result._doc._id.toString() };
					})
					.then((user) => {
						if (!user) {
							throw new Error("User Not Found");
						}
						user.createdOrder.push(location);
						return user.save();
					})
					.then((result) => {
						return createdOrder;
					})
					.catch((err) => {
						console.log(err);
						throw err;
					});
			},
			createUser: (args) => {
				return User.findOne({ email: args.userInput.email })
					.then((user) => {
						if (user) {
							throw new Error("User Exists Already");
						}
						return bcrypt.hash(args.userInput.password, 12);
					})
					.then((hashedPassword) => {
						const user = new User({
							email: args.userInput.email,
							password: hashedPassword,
						});
						return user.save();
					})
					.then((result) => {
						return { ...result._doc, password: null, _id: result.id };
					})
					.catch((err) => {
						throw err;
					});
			},
		},
		graphiql: true,
	})
);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@postapi.bwlcr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
