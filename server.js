const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

const users = [];
const MYSECRETJWTKEY = "secret";

const optionsForJWTValidation = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: MYSECRETJWTKEY
};

passport.use(new JwtStrategy(optionsForJWTValidation, (payload, done) => {
  done(null, { userHandle: payload.userHandle });
}));

app.post("/signup", (req, res) => {
  const { userHandle, password} = req.body;
  if (!userHandle || !password) {
    return res.status(400).send("Invalid request body");
  } else if (userHandle.length < 6 || password.length < 6) {
    return res.status(400).send("Invalid request body");
  }

  // const existingUser = users.find(user => user.userHandle === userHandle);
  // if (existingUser) {
  //   return res.status(400).send("User already exists");
  // }

  users.push({ userHandle, password });

  return res.status(201).send("User registered successfully");
});

app.post("/login", (req, res) => {
  const { userHandle, password, ...extraFields} = req.body;

  if (Object.keys(extraFields).length > 0) {
    return res.status(400).send("Bad request: Extra fields are not allowed");
  }

  if (typeof userHandle !== "string" || typeof password !== "string") {
    return res.status(400).send("Bad request: userHandle and password must be strings");
  }

  if (!userHandle || !password) {
    return res.status(400).send("Bad request");
  }

  // Find user
  const user = users.find(user => user.userHandle === userHandle && user.password === password);

  if (!user) {
    return res.status(401).send("Unauthorized, incorrect username or password");
  }

  // Generate JWT Token
  const token = jwt.sign({ userHandle }, MYSECRETJWTKEY);

  res.json({ jsonWebToken: token });
});

posts = [];
app.post("/high-scores",
    passport.authenticate("jwt", { session: false }), 
    (req, res) => {
      if(!req.body.level || !req.body.score || !req.body.userHandle || !req.body.timestamp) { 
        return res.status(400).send("Bad request");
      }
      posts.push(req.body);
      res.status(201).send("High score posted successfully");
});

app.get("/high-scores", (req, res) => {
  const { level, page = 1 } = req.query;
  const perPage = 20;

  if (!level) {
    return res.status(400).send("Level is required");
  }

  // Filter scores by level
  const filteredScores = posts.filter(post => post.level === level);

  // Sort scores from highest to lowest
  filteredScores.sort((a, b) => b.score - a.score);

  // Paginate results
  const start = (page - 1) * perPage;
  const paginatedScores = filteredScores.slice(start, start + perPage);

  res.json(paginatedScores);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
