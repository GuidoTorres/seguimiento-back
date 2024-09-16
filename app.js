require("dotenv").config();
const express = require("express");
var cors = require("cors");
const cookieParser = require("cookie-parser");

const sequelize = require("./config/database");
const sequelize1 = require("./config/database1");

const ordenCompraRouter = require("./src/routes/ordenCompra");
const usuarioRouter = require("./src/routes/usuarios");
const authRouter = require("./src/routes/auth");
const patrimonioRouter = require("./src/routes/bienesPatrimonio");
const bienesRouter = require("./src/routes/bienes");


const app = express();
const port = 3001;
const port2 = 3002;

app.use(cors({origin:'http://10.30.1.46:8086',credentials: true}));
app.use(express.json())
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/orden", ordenCompraRouter);
app.use("/api/v1/usuarios", usuarioRouter);
app.use("/api/v1/patrimonio", patrimonioRouter);
app.use("/api/v1/bienes", bienesRouter);



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
