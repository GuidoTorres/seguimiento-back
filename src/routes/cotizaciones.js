const router = require("express").Router();
const cotizaciones = require("../controllers/cotizaciones");
const upload = require("../middleware/multer");

router.get("/", cotizaciones.getCotizaciones)
router.get("/publicacion", cotizaciones.updatePublicacion)
router.get("/completada", cotizaciones.getCotizacionCompleta)

router.post('/pdf', upload.single('pdf'), cotizaciones.updatePdf);

module.exports = router