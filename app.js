const express = require("express");
//  const User=require('./src/models/User.js');
require("dotenv").config();
const mongoose = require("mongoose");
const userRouter = require("./src/routes/userRoutes.js");
const authMiddleware = require("./src/middleware/authMiddleware.js");
const flightRouter = require("./src/routes/flightRoutes.js");
const winston = require("winston");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");


const app = express();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "warn.log", level: "warn" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "./swagger.yaml"), "utf8")
);
// const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(express.json());

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongodb is connected"))
  .catch((err) => console.log("Failed to connect mognoDB ", err));

app.use("/users", userRouter);
app.use("/flight", authMiddleware, flightRouter);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is working on port ${PORT}`);
});
