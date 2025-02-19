const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "**",
    secretAccessKey: "**",
  },
});

async function getObjectURL(key) {
  const command = new GetObjectCommand({
    Bucket: "securedocument",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
}

async function putObject(filename, contentType) {
  const command = new PutObjectCommand({
    Bucket: "securedocument",
    Key: `/uploads/user-uploads/${filename}`,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
}

async function init() {
  console.log(
    await getObjectURL("/uploads/user-uploads/image-1739966348935.jpeg")
  );
  //console.log(await putObject(`image-${Date.now()}.jpeg`, "image/jpeg"));
}

init();
