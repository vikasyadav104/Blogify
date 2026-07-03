const express= require("express");
const path= require("path");
const mongoose= require("mongoose");
const app =express();
const PORT= 8000;
const userRouter= require("./routes/user");


mongoose.connect("mongodb://127.0.0.1:27017/blogify").then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo Error:", err));




app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/user", userRouter);
app.get("/", (req,res)=>{
    return res.render("home");
})

app.listen(PORT, ()=>console.log(`Server Started at PORT: ${PORT}`));