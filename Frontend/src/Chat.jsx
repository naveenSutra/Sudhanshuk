import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [recentFile, setRecentFile] = useState(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentFile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await axios.get(
          "http://localhost:5000/list-user-files",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const files = response.data.files;
        if (files.length > 0) {
          setRecentFile(files[files.length - 1]); // Get most recent file
        }
      } catch (error) {
        console.error("Error fetching recent file:", error);
      }
    };

    fetchRecentFile();
  }, []);

  const handleChat = async () => {
    if (!recentFile) {
      setResponse("No recent document found. Please upload a document first.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setResponse("User not authenticated. Please log in.");
        return;
      }

      const token = await user.getIdToken();
      console.log("🔹 Firebase Token:", token); // ✅ Debugging token

      const response = await axios.post(
        "http://localhost:5000/chat-with-document",
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResponse(response.data.reply);
    } catch (error) {
      console.error("🔴 Chat API Error:", error);
      setResponse(
        "Failed to get response from document. Please check authentication."
      );
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Chat with Your Report</h2>

      <button
        onClick={() => navigate(-1)}
        className="bg-gray-700 text-white px-4 py-2 rounded-md mb-4"
      >
        Go Back
      </button>

      {recentFile ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg text-center">
          <p className="text-gray-600 mb-2">Chatting with:</p>
          <a
            href={recentFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline block mb-4"
          >
            {recentFile.fileName}
          </a>

          <textarea
            className="w-full border p-2 rounded-md"
            placeholder="Ask something about your document..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button
            onClick={handleChat}
            className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mt-2 hover:bg-purple-600"
          >
            Send
          </button>

          <p className="mt-4 text-gray-700">{response}</p>
        </div>
      ) : (
        <p className="text-gray-500">No recent document found.</p>
      )}
    </div>
  );
};

export default Chat;
