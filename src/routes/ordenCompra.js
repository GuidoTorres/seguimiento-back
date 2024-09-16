const router = require("express").Router();
const ordenCompra = require("../controllers/ordenCompra");

router.get("/bienes", ordenCompra.getBienes);
router.get("/bienes/recepcionados", ordenCompra.getBienesRecepcionados);
router.get("/bienes/conformidad", ordenCompra.getBienesConConformidad);

router.get("/servicios", ordenCompra.getServicios);
router.get("/bienes/registrar", ordenCompra.registrarBienesEnBd);
router.post(
  "/bienes/recepcionado/:id",
  ordenCompra.actualizarEstadoRecepcionado
);
router.post(
  "/bienes/conformidad/:id",
  ordenCompra.actualizarEstadoConformidad
);

module.exports = router;

