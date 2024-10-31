const router = require("express").Router();
const cotizaciones = require("../controllers/cotizaciones");

router.get("/bienes", cotizaciones.getCotizacionBienes)
router.get("/servicios", cotizaciones.getCotizacionServicios)

module.exports = router