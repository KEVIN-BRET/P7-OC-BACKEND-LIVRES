const express = require("express");
const auth = require('auth');
const router = express.Router();

const bookCtrl = require("../controllers/book-controller");

router.get("/", auth, bookCtrl.getAllBooks);
router.post("/", auth, bookCtrl.createBook);
router.get("/:id", auth, bookCtrl.getOneBook);
router.put("/:id", auth, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
