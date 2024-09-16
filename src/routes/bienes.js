const router = require("express").Router();
const bienes = require("../controllers/bienes");
const VerificarPermisos = require("../middleware/verificarPermisos");

router.get("/", bienes.getBienes);
router.get("/recepcionados", VerificarPermisos(['recepcion']), bienes.getBienesRecepcionados);
router.get("/conformidad", VerificarPermisos(['conformidad']), bienes.getBienesConConformidad);
router.get("/registrar", bienes.registrarBienesEnBd);
router.get("/completados", VerificarPermisos(['seguimiento']), bienes.getBienesCompletado);
router.get("/cantidad", VerificarPermisos(['dashboard']), bienes.estadisticasEstados);
router.get("/estadisticas/conformidad", VerificarPermisos(['dashboard']), bienes.estadisticasConformidad)
router.get("/estadisticas/recepcionadas",VerificarPermisos(['dashboard']), bienes.estadisticasRecepcionadas)
router.get("/estadisticas/patrimonio",VerificarPermisos(['dashboard']), bienes.estadisticasPatrimonio)

module.exports = router;
