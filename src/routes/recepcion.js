const router = require("express").Router();
const recepcion = require("../controllers/recepcion");

router.get("/bienes", recepcion.getBienes)

 module.exports = router