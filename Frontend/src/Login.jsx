import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "./firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const verifyToken = async (token) => {
    try {
      const response = await axios.post("http://localhost:5000/verify-token", {
        token,
      });
      setMessage(response.data.message);
      navigate("/home");
    } catch (error) {
      setMessage("Backend verification failed: " + error.response?.data?.error);
    }
  };

  const loginWithEmail = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      await verifyToken(token);
    } catch (error) {
      setMessage("Login failed: " + error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await verifyToken(token);
    } catch (error) {
      setMessage("Google login failed: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-2"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
        />

        <button
          onClick={loginWithEmail}
          className="w-full bg-blue-500 text-white py-2 rounded-md mb-2"
        >
          Login
        </button>

        <button
          onClick={loginWithGoogle}
          className="w-full bg-red-500 text-white py-2 rounded-md mb-2"
        >
          Login with Google
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="w-full text-blue-500"
        >
          Go to Sign Up
        </button>

        <p className="mt-4 text-center text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Login;
