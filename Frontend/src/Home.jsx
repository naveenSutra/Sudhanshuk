import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [uploadUrl, setUploadUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const requestUploadLink = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return setMessage("User not authenticated");

      const token = await user.getIdToken();
      const response = await axios.post(
        "http://localhost:5000/generate-upload-link",
        { userId: user.uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUploadUrl(response.data.uploadUrl);
      setMessage("Upload link generated! You have 15 minutes.");
    } catch (error) {
      setMessage("Failed to generate upload link.");
    }
  };

  const handleFileUpload = async () => {
    if (!uploadUrl || !selectedFile) {
      setMessage("Select a file and generate an upload link first.");
      return;
    }

    try {
      await axios.put(uploadUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type },
      });

      setMessage("File uploaded successfully!");
    } catch (error) {
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">LabInsight AI</h1>
        <div>
          <button
            onClick={() => navigate("/uploads")}
            className="bg-gray-700 text-white px-4 py-2 rounded-md mx-2 hover:bg-gray-800"
          >
            View Previous Uploads
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Upload Your Medical Report
          </h2>

          <button
            onClick={requestUploadLink}
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full mt-4 hover:bg-blue-600"
          >
            Generate Upload Link
          </button>

          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="mt-4 w-full border p-2 rounded-md"
          />

          <button
            onClick={handleFileUpload}
            className="bg-green-500 text-white px-4 py-2 rounded-md w-full mt-4 hover:bg-green-600"
          >
            Upload File
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mt-4 hover:bg-purple-600"
          >
            Chat with Document
          </button>

          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
