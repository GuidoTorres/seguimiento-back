const router = require("express").Router();
const bienesPatrimonio = require("../controllers/bienesPatrimonio");
const VerificarPermisos = require("../middleware/verificarPermisos");

router.get("/bienes", VerificarPermisos(['alta_bienes']), bienesPatrimonio.getBienesPatrimonio);
router.get("/historial", VerificarPermisos(['alta_bienes']), bienesPatrimonio.getBienesPatrimonalizado);

router.post(
    "/bienes/:id",
    bienesPatrimonio.actualizarEstadoPatrimonio
  );

module.exports = router;
