const { Schema, model } = require("mongoose");
const { randomBytes, createHmac } = require("crypto");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],  //enum means only two values are allowed
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

//this code willl run automatically right before the user is ssaved to mongodb

userSchema.pre("save", function () {
  //this refers when usename, profileImageUrl is change then this below line will execute coz password is still untouched so no need to hash it again and again
  if (!this.isModified("password")) return;
  //this is random 32 character string which is used to hash the password and this will be stored in database so that when user login then we can use this salt to hash the password again and match it with the hashed password stored in database
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");
    //hashed password will alwasy 64 character long and this is the password which will be stored in database and this is the password which will be matched with the user provided password when user login

  this.salt = salt;
  this.password = hashedPassword;
});

userSchema.static("matchPassword", async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) throw new Error("User not found");

  //here for user provided that password we will hash it with the salt stored in database and then we will match it with the hashed password stored in database
//if hashed value will match that means user provided password is correct

  const userProvidedHash = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (user.password !== userProvidedHash) {
    throw new Error("Incorrect password");
  }
 
  return user;
});

const User = model("user", userSchema);
module.exports = User;