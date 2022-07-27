const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../modules/mailer");
const User = require("../models/user");

const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 86400,
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User alredy exists" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
 
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    //
    if (user == null) {
      console.log("User not found");
      return res.status(400).send({ error: "User not found" });
    } else {
      //
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(400).send({ error: "Invalid password" });
      } else {
        user.password = undefined;
        //Generate token
        return res.send({ user, token: generateToken({ id: user.id }) });
      }
    }

});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    //Cria um token e define um tempo de expiração de 1 hora
    const token = crypto.randomBytes(20).toString("hex");
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    mailer.sendMail(
      {
        to: email,
        from: "contato@gabrielserejo.com.br",
        template: "auth/recuperacao",
        context: { token },
      },
      (err) => {
        if (err)
          // Se tudo der errado, retorna um erro
          return res
            .status(400)
            .send({ error: "Cannot send forgot password email" });
        // Se tudo der certo, retorna um status 200
        return res.status(200);
      }
    );
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: "Invalid token" });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res
        .status(400)
        .send({ error: "Token expired, generate a new one" });

    user.password = password;
    await user.save();
    res.status(200);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Error on reset password, try again" });
  }
});

module.exports = (app) => app.use("/auth", router);
