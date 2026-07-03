const { Router } = require("express");
const User = require("../models/user");

const router = Router();
//router is needed coz here it is an object which is used to handle all the routes related to user and then we will export it and use it in index.js file

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.matchPassword(email, password);

    console.log("User:", user);

    return res.redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  await User.create({
    fullname,
    email,
    password,
  });

  return res.redirect("/");
});

module.exports = router;