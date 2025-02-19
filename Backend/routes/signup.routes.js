const express = require("express");
const admin = require("firebase-admin");
const signUpRouter = express.Router();

signUpRouter.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.json({ message: "User registered successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = signUpRouter;
