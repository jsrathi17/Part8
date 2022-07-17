const { ApolloServer, gql, UserInputError } = require("apollo-server");
const config = require("./utils/config");
const mongoose = require("mongoose");
const Book = require("./models/Book");
const Author = require("./models/Author");
const User = require("./models/User");
const jwt = require('jsonwebtoken');

const JWT_SECRET = config.SECRET;

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
      ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
      bookCount: () => Book.collection.countDocuments(),
      authorCount: () => Author.collection.countDocuments(),
      allBooks: async (root, args) => {
            
            let author=null
            try{  
              if(args.author && args.genre){
          
                author = await Author.findOne({ name: args.author });
                return await Book.find({ $and: [{ author: { $in: author.id } },{ genres: { $in: args.genre }},],}).populate("author");
          
              }else if(args.author){
          
                author = await Author.findOne({ name: args.author });
                return await Book.find({ author: { $in: author.id } }).populate("author");
          
              }else if(args.genre){
          
                return await Book.find({ genres: { $in: args.genre } }).populate("author");
          
              }else{
          
                let books= await Book.find({}).populate("author");
                return books
          
              }
            }catch(error){
              throw new UserInputError(error.message, { invalidArgs: args });
            }
        },
      allAuthors: async () => {return await Author.find({}).populate("books");},
      me: (root, args, { currentUser }) => {
        const user = {username: currentUser.username, favoriteGenre: currentUser.favoriteGenre[0], id: currentUser._id}
        return user;
      },
  },
  Author:{
      bookCount: (root) => root.books.length,
  },
  
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new UserInputError("Please login first!");
      }
      try{
        let author = await Author.findOne({ name: args.author });
        
        if(!author){
            author = new Author({ name: args.author });
            author.born = null;
        }

        const book = new Book({ ...args, author });
        const savedBook = await book.save();
        author.books = author.books.concat(savedBook._id);
        await author.save();

        return savedBook
    }catch(error){
      throw new UserInputError(error.message, { invalidArgs: args });
    }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new UserInputError("Please login first!");
      }
      try{
        let authorUpdated = await Author.findOne({ name: args.name });
        if(!authorUpdated){
            return null
        }
        authorUpdated.born = args.setBornTo;
        const savedAuthor = await authorUpdated.save();

        return savedAuthor
      }catch(error){
        throw new UserInputError(error.message, { invalidArgs: args });
      }
    },
    createUser: async (root, args) => {
      const user = new User({...args})
      try{
        return await user.save()
      }catch(error) {
          throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },

  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer")) {
      const decoded = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      return { currentUser };
    }
  },
})

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log('Connected to db at '+mongoUrl)).catch(err => {
  console.error('Error connecting to mongo', err)
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})