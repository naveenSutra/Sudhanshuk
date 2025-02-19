const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
const admin = require("firebase-admin");

const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const moment = require("moment");
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require("pdf-parse");
const { default: signUpRouter } = require("./routes/signup.routes");

const app = express();
app.use(express.json());
app.use(cors());
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//  Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-admin-sdk.json")),
});

//  Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/signup", async (req, res) => {
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

app.post("/verify-token", async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ message: "Successfully logged in", user: decodedToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication token" });
  }
});

//Generate Secure Upload Link
app.post("/generate-upload-link", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authorization.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userEmail = decodedToken.email.replace(/[@.]/g, "_");

    //Generate Unique File Name
    const fileName = `uploads/${userEmail}/${moment().format(
      "YYYY-MM-DD_HH-mm-ss"
    )}.pdf`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      ContentType: "application/pdf",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    res.json({ uploadUrl, filePath: fileName });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate upload link" });
  }
});

// List User's Uploaded Files
app.get("/list-user-files", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authorization.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userEmail = decodedToken.email.replace(/[@.]/g, "_");

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `uploads/${userEmail}/`,
    });

    const data = await s3.send(command);

    const files = await Promise.all(
      data.Contents.map(async (file) => {
        const getUrlCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: file.Key,
        });

        const signedUrl = await getSignedUrl(s3, getUrlCommand, {
          expiresIn: 900,
        });
        return { fileName: file.Key.split("/").pop(), url: signedUrl };
      })
    );

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve files" });
  }
});

app.post("/chat-with-document", async (req, res) => {
  const { authorization } = req.headers;
  const { message } = req.body;

  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const token = authorization.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userEmail = decodedToken.email.replace(/[@.]/g, "_");

    //  console.log(" Fetching latest medical report for:", userEmail);

    // List all files uploaded by the user
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `uploads/${userEmail}/`,
    });

    const data = await s3.send(listCommand);
    if (!data.Contents || data.Contents.length === 0) {
      return res.json({
        reply: "No recent medical report found. Please upload a report first.",
      });
    }

    // Sort files
    const sortedFiles = data.Contents.sort(
      (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
    );

    //  Get the most recent file
    const recentFileKey = sortedFiles[0].Key;
    //console.log(" Most recent medical report:", recentFileKey);

    //  Download the latest PDF from S3
    const getUrlCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: recentFileKey,
    });

    const pdfResponse = await s3.send(getUrlCommand);
    const pdfBuffer = Buffer.from(
      await pdfResponse.Body.transformToByteArray()
    );

    // Extract text from the PDF
    const pdfText = await pdf(pdfBuffer);
    //console.log(" Extracted Text from PDF:", pdfText.text.substring(0, 500));

    if (!pdfText.text) {
      return res.json({
        reply:
          "The medical report could not be read. Please try again with a different file.",
      });
    }

    // Gemini AI to Process the Extracted Text
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const response = await model.generateContent(
      `${message} this is my medical report: ${pdfText.text} based on this report give response`
    );

    res.json({ reply: response.response.text() });
  } catch (error) {
    console.error(" Gemini Chat Processing Failed:", error);
    res.status(500).json({
      error: "Chat processing failed. Please check Google Gemini API setup.",
    });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
