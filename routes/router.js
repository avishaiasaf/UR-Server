const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require("../controllers/userControllers.js")

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
var cpUpload = upload.fields([{ name: 'iniFile', maxCount: 1 }, { name: 'bkmvFile', maxCount: 1 }])

router.post('/analyze_report', cpUpload, userController.explore_data);
router.get('/', userController.index);
router.get('/explore', userController.explore)
router.get('/about', userController.about)
router.use('/', userController.not_found)

module.exports = router;