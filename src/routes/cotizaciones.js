const router = require("express").Router();
const cotizaciones = require("../controllers/cotizaciones");
const upload = require("../middleware/multer");

router.get("/", cotizaciones.getCotizaciones)
router.post('/pdf', upload.single('pdf'), cotizaciones.updatePdf);

module.exports = router