const { Router } = require("express");
const Blog = require("../models/blog");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve(`./public/uploads/${req.user._id}`);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Open add blog page
router.get("/add-new", (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  return res.render("addBlog", {
    user: req.user,
  });
});
router.get('/:id',async (req, res)=>{
  const blog = await Blog.findById(req.params.id);
  return res.render("blog",{
    user: req.user,
    blog,
  })

})
// Handle form submit and save blog
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    console.log("===== BLOG POST HIT =====");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    console.log("req.user:", req.user);

    if (!req.user) {
      console.log("No req.user found");
      return res.redirect("/user/signin");
    }

    const { title, body } = req.body;

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: req.file
        ? `/uploads/${req.user._id}/${req.file.filename}`
        : "/images/default-blog.png",
    });

    console.log("BLOG CREATED:", blog);

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.log("Blog creation error:", error);
    return res.status(500).send("Error creating blog");
  }
});

// OPEN SINGLE BLOG
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    return res.render("blog", {
      user: req.user,
      blog,
    });
  } catch (error) {
    console.log("Error fetching blog:", error);
    return res.status(500).send("Error loading blog");
  }
});

module.exports = router;