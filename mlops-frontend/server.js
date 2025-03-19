const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const serverUrl = process.env.NEXT_PUBLIC_SERVER_NODE_API || 'http://localhost:4000';  // 기본값을 설정
const { hostname, port } = new URL(serverUrl);  // URL 객체를 사용하여 hostname과 port 추출

// 🟢 모든 요청을 localhost:3000에서 허용
app.use(cors({ origin: "http://localhost:3000" }));

// 폴더가 존재하지 않으면 생성
const uploadDir = "public/model-thumbnails";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer를 사용하여 원본 파일 이름으로 이미지를 저장하도록 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 이미지를 public/model-thumbnails 폴더에 저장
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 파일 이름을 원본 이름으로 저장
  },
});

const upload = multer({ storage: storage });

// 이미지 업로드 API
app.post("/api/upload-thumbnail", upload.single("image_file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  const filePath = `/model-thumbnails/${req.file.originalname}`; // 이미지의 정확한 경로
  res.status(200).json({ filePath });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 ${serverUrl}에서 실행 중입니다.`);  // 전체 URL을 출력
});
