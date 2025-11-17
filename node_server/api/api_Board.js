const router = require("express").Router();
const mySQL = require("../mysql_db/index");
const { uuid } = require("../util/generateKey");
const multer = require("multer");
const path = require("path");

// Multer 설정: 파일 저장 위치를 /data/uploads로 지정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/data/uploads/'); // Object Storage에 연결될 경로
  },
  filename: function (req, file, cb) {
    // 파일명 중복을 피하기 위해 타임스탬프와 원본 파일명을 조합
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET: 모든 게시글 조회 (단순화)
router.get("/", async (req, res) => {
  try {
    // cm_board_t 테이블에서 image_path 컬럼을 image로 alias하여 클라이언트와 필드명을 맞춥니다.
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
// upload.single('image') 미들웨어: 'image'라는 필드 이름으로 전송된 파일을 처리
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const imagePath = req.file ? path.join('uploads', req.file.filename).replace(/\\/g, '/') : null; // 업로드된 파일의 URL 경로

    if (!name || !description || !price || !imagePath) {
      return res.status(400).json({ message: "상품명, 상세글, 가격, 이미지를 모두 입력해주세요." });
    }

    const postId = uuid();
    // 클라이언트에서 사용하는 필드명(name, description)을 DB 컬럼(title, content)에 맞게 매핑합니다.
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
        image_path: imagePath
    };

    return res.status(201).send(newPost);
  } catch (err) {
    console.error("api_Board / POST (with file): ", err);
    return res.status(500).json({ message: "게시글 등록에 실패했어요." });
  }
});

module.exports = router;
