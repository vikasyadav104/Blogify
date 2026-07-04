const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const app = express();
const PORT = 8000;

const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./midddlewares/authentication");

app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/blogify")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo Error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// static files for css/images/uploads
app.use(express.static(path.resolve("./public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve('./public')));
app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });

  return res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));