const express = require("express");
const router = express.Router();
const auth = require("../middleware/authauth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book-controller");

router.get("/", auth, bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", auth, bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
