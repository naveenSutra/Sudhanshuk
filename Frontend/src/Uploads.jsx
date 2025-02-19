import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await axios.get(
        "http://localhost:5000/list-user-files",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFiles(response.data.files);
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Your Uploaded Files</h2>
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-600 text-white px-4 py-2 rounded-md mt-2"
      >
        Go Back
      </button>

      <ul>
        {files.map((file, index) => (
          <li key={index} className="mt-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {file.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Uploads;
