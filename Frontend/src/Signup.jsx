import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const signUpWithEmail = async () => {
    try {
      const response = await axios.post("http://localhost:5000/signup", {
        email,
        password,
      });
      setMessage(response.data.message);
      navigate("/home");
    } catch (error) {
      setMessage("Sign-up failed: " + error.response?.data?.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

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
          onClick={signUpWithEmail}
          className="w-full bg-green-500 text-white py-2 rounded-md mb-2"
        >
          Sign Up
        </button>

        <button onClick={() => navigate("/")} className="w-full text-blue-500">
          Go to Login
        </button>

        <p className="mt-4 text-center text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Signup;
