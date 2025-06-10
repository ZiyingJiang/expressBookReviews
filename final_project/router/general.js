const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Extract username and password
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password){
    return res.status(400).json({ message: "Username or password not provided" });
  } 
  
  // Check if username already exists in the users array
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Create and store new user
  const newUser = {
    username : username,
    password : password
  }
  users.push(newUser);
  return res.status(201).json({message: `Welcome, ${username}. Please loggin to proceed.`});
 
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Extract the ISBN from the URL parameters
  const isbn= req.params.isbn;

  // Look up the book using the ISBN key
  const isbn_book = books[isbn];

  // Check if the book exists
  if (isbn_book){
      return res.send(JSON.stringify(isbn_book,null,2));
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Normalize input author string
  const author = req.params.author.replace(/\s+/g, "").toLowerCase();

  //Convert books object to array and filter by normalized author name
  /*const author_books = Object.values(books).filter(book => book.author.replace(/\s+/g, "").toLowerCase().includes(author));
  if (author_books.length > 0) {
    return res.json(author_books);
  } else {
    return res.status(404).json({message: "Book not found"});
  }*/
  
  // Get all keys of the books object
  const bookKeys = Object.keys(books);

  const filteredBooks = {};
  //Iterate through the keys and match author
  bookKeys.forEach( key => {
    const book = books[key];
    const normalizedAuthor = book.author.replace(/\s+/g, "").toLowerCase();
    if (normalizedAuthor.includes(author)){
        filteredBooks[key] = book;
    }
  });

  if (Object.keys(filteredBooks).length > 0) {
    return res.json(filteredBooks);
  } else {
    return res.status(404).json({message: "Book not found"});
  }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Normalize input title string
  const inputTitle = req.params.title.replace(/\s+/g, "").toLowerCase();

    // Get all keys of the books object
    const bookKeys = Object.keys(books);

    const filteredBooks = {};
    //Iterate through the keys and match author
    bookKeys.forEach( key => {
        const book = books[key];
        const normalizedTitle = book.title.replace(/\s+/g, "").toLowerCase();
        if (normalizedTitle.includes(inputTitle)){
            filteredBooks[key] = book;
        }
    });

    if (Object.keys(filteredBooks).length > 0) {
        return res.json(filteredBooks);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Extract the isbn
  const isbn = req.params.isbn;

  //Look up the book using ISBN key
  const book = books[isbn];
  if (book) {
    if (!book.reviews) {
       return res.send(book.reviews); 
    } else {
        return res.send(`No reviews are available for ${book.title}. Consider to be the first reviewer.`)
    }
    
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
