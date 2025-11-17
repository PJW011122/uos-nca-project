/*
 * 작성자: 박준우
 * 작성일: 24.08.07
 * 설명: server.js의 가독성을 향상시키위해 router 파트 분리
 * 부모 연결: server.js
 * 자식 연결: class* , api_*
 */
const router = require("express").Router();

// 연결 페이지 설정
const api_Board = require("../api/api_Board.js");

router.use("/board", api_Board);

module.exports = router;
