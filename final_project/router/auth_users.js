const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; //user ={username: username, password: password, review:[ISBN....]}
const JWT_SECRET = 'my-secret-key';

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return typeof username==='string' && username.trim().length >= 3;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//Check if username and password match the one we have in records.
  return users.some(user => user.username===username && user.password===password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Extract username and password from input
  const username = req.body.username;
  const password = req.body.password;

  //Save anthenticated user credentials for the session 
  if (authenticatedUser(username, password)){
      //create a token
      const token = jwt.sign(
        {username: username}, 
        JWT_SECRET, 
        {expiresIn: 60 * 60}
      );
      
      //assign the token to the session
      req.session.authorization = {
        accessToken: token,
        username: username
      };
      
      return res.status(200).json({message: "Login successful"});
      //
  } else {
      return res.status(401).json({message: "Invalid username or password"});
  }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Extract isbn and review from request
  const isbn = req.params.isbn;
  const reviewText = req.body.review;

  // Check if the ISBN exists in the books database
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  
  //Find the user from session info
  const username = req.session.authorization?.username; //The ? in req.session.authorization?.username is called the optional chaining operator in JavaScript. It allows you to safely access nested properties of an object without causing a runtime error if one of the properties in the chain is undefined or null.
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No user session found." });
  }
  
  //add or update the review with the reviewer's name: reviewText pair
  books[isbn].reviews[username] = reviewText;

  const user = users.find(user => user.username === username);
  const bookTitle = books[isbn].title;
  const bookAuthor = books[isbn].author;

    //Ensure the reviewed isbn is recorded for the user
  if (user.review.includes(isbn)){ 
      return res.status(200).json({message: `Dear ${username}, your review of ${bookAuthor}'s ${bookTitle} has been updated.`});
  } else { 
      //add the isbn to the user review array
      user.review.push(isbn);  
      return res.status(201).json({message: `Dear ${username}, thank you for your review of ${bookAuthor}'s ${bookTitle}.`});
  }
 
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Check if the ISBN exists in the books database 
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  
  //Find the user from session info
  const username = req.session.authorization?.username; //The ? in req.session.authorization?.username is called the optional chaining operator in JavaScript. It allows you to safely access nested properties of an object without causing a runtime error if one of the properties in the chain is undefined or null.
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No user session found." });
  }

  const user = users.find(user => user.username === username);
  const bookTitle = books[isbn].title;
  const bookAuthor = books[isbn].author;  
  
  //Check if the review by the user exists
  if (books[isbn].reviews[username]){ 
    //remove the username:reviewText 
    delete books[isbn].reviews[username];

    // Remove the ISBN from the user's review array
    const index = user.review.indexOf(isbn);
    if (index!== -1){
      user.review.splice(index, 1); //remove the isbn from the array of review
    }
    return res.status(200).json({message: `Dear ${username}, your review of ${bookAuthor}'s ${bookTitle} has been deleted.`});
  } else {
      return res.status(404).json({message: `Review of ${bookAuthor}'s ${bookTitle} not found.`});
  }
 
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
