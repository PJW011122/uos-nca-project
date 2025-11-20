const router = require("express").Router();
const mySQL = require("../mysql_db/index");
const { uuid } = require("../util/generateKey");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const path = require("path");

const s3 = new aws.S3({
  endpoint: process.env.NCLOUD_ENDPOINT,
  region: process.env.NCLOUD_REGION,
  credentials: {
    accessKeyId: process.env.NCLOUD_ACCESS_KEY,
    secretAccessKey: process.env.NCLOUD_SECRET_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.NCLOUD_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        "uploads/" +
          file.fieldname +
          "-" +
          uniqueSuffix +
          path.extname(file.originalname)
      );
    },
  }),
});

// Multer 오류 처리를 위한 커스텀 미들웨어
const uploadMiddleware = (req, res, next) => {
  const uploader = upload.single("image");
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer 관련 오류 처리
      console.error("Multer Error:", err);
      return res
        .status(500)
        .json({
          message: "파일 업로드 중 Multer 오류가 발생했습니다.",
          error: err.message,
        });
    } else if (err) {
      // 기타 오류 처리 (예: S3 연결 오류)
      console.error("Unknown Error during upload:", err);
      return res
        .status(500)
        .json({
          message: "파일 업로드 중 알 수 없는 오류가 발생했습니다.",
          error: err.message,
        });
    }
    // 오류가 없으면 다음 미들웨어로 진행
    next();
  });
};

// GET: 모든 게시글 조회 (단순화)
router.get("/", async (req, res) => {
  try {
    const sql = `SELECT post_id, title, content, price, image_path as image, created_at FROM cm_board_t ORDER BY created_at DESC`;
    const { rows } = await mySQL.query(sql);

    return res.status(200).send({
      data: rows,
    });
  } catch (err) {
    console.error("api_Board / GET (simplified): ", err);
    return res.status(500).json({ message: "게시글 조회에 실패했어요." });
  }
});

// POST: 새 게시글과 이미지 파일 등록
router.post("/", uploadMiddleware, async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const { name, description, price } = req.body;
    const imagePath = req.file ? req.file.location : null;

    if (!name || !description || !price || !imagePath) {
      console.log("Validation Failed: Missing required fields.");
      return res
        .status(400)
        .json({ message: "상품명, 상세글, 가격, 이미지를 모두 입력해주세요." });
    }

    const postId = uuid();
    const query = `
      INSERT INTO cm_board_t (post_id, title, content, price, image_path)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [postId, name, description, Number(price), imagePath];

    await mySQL.query(query, values);

    const newPost = {
      post_id: postId,
      title: name,
      content: description,
      price: Number(price),
      image_path: imagePath,
    };

    console.log("Successfully created new post:", newPost);
    return res.status(201).send(newPost);
  } catch (err) {
    console.error("api_Board / POST (with file): ", err);
    return res.status(500).json({ message: "게시글 등록에 실패했어요." });
  }
});

module.exports = router;
