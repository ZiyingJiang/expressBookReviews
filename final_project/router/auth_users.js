const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
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
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
