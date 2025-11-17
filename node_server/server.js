// 환경변수 선언
require("dotenv").config();

// 서버 개방
const compression = require("compression");
const express = require("express"); // express 프레임워크 객체 생성
const app = express(); // express의 새 인스턴스 할당
app.use(compression()); // 보다 빠른 API 응답 위해 Express에서 JSON 같은 API 응답을 압축 실행
const cookieParser = require("cookie-parser");

// 쿠키 파서 미들웨어
app.use(cookieParser());
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded

// '/uploads' 경로로 들어오는 요청에 대해 '/data/uploads' 디렉토리의 정적 파일을 제공합니다.
app.use('/uploads', express.static('/data/uploads'));

// MySQL과 연결
const mySQL = require("./mysql_db/index.js");
mySQL
  .connect()
  .then(() => {
    console.log("server ::: MySQL connected");
  })
  .catch((err) => {
    console.log("server ::: MySQL Failed: " + err.message);
  });

// 라우터 처리
const route = require("./route/classA.js");
app.use("/", route);

// 동작 확인 (health check endpoint - 쿠버네티스 연결 테스트)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.NODE_DOCKER_PORT || 5000;

// 배포 환경: HTTP 서버 실행
// main branch 들어갈 때 삭제 필수
app.listen(PORT, () => {
  console.log(`HTTP Server running at ${PORT}`);
});
