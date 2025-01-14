require("dotenv").config();
const express = require("express");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const sequelize = require("./config/database");
const sequelize1 = require("./config/database1");

const ordenCompraRouter = require("./src/routes/ordenCompra");
const usuarioRouter = require("./src/routes/usuarios");
const authRouter = require("./src/routes/auth");
const patrimonioRouter = require("./src/routes/bienesPatrimonio");
const bienesRouter = require("./src/routes/bienes");
const cotizacionesRouter = require("./src/routes/cotizaciones");
const recepcionRouter = require("./src/routes/recepcion");


const app = express();
const port = 3001;
const port2 = 3002;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3003', 'http://10.30.1.46:8086'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));
app.use(express.json())
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/orden", ordenCompraRouter);
app.use("/api/v1/usuarios", usuarioRouter);
app.use("/api/v1/patrimonio", patrimonioRouter);
app.use("/api/v1/bienes", bienesRouter);
app.use("/api/v1/cotizaciones", cotizacionesRouter);
<<<<<<< HEAD
app.use("/api/v1/recepcion", recepcionRouter);

=======
>>>>>>> 822dfc0ef4f6c6f154a1d1f915957c0000e84b48

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

sequelize1
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    app.listen(port2, () => {
      console.log(`Server is running on http://localhost:${port2}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
