const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const { upload, handleMulterError } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
	"/upload",
	// authMiddleware,
	upload.array("images", 5), // Permitir hasta 5 imágenes
	handleMulterError,
	uploadImage
);

module.exports = router;
