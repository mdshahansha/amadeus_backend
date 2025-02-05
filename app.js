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

//test
const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});
app.get('/data', async (req, res) => {
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: 'JFK',
        destinationLocationCode: 'LAX',
        departureDate: '2025-02-10',
        adults: 1
      });
  
      const flights = response.data;
  
      // Flights data ko HTML content mein embed karna
      let flightDetails = '';
      flights.forEach(flight => {
        flightDetails += `
          <div class="flight">
            <p>Airline: ${flight.itineraries[0].segments[0].carrierCode}</p>
            <p>Flight Number: ${flight.itineraries[0].segments[0].number}</p>
            <p>Departure: ${flight.itineraries[0].segments[0].departure.at}</p>
            <p>Arrival: ${flight.itineraries[0].segments[0].arrival.at}</p>
            <p>Price: ${flight.price.total} ${flight.price.currency}</p>
          </div>
          <hr>
        `;
      });
  
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flight Search Results</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              margin: 0;
              padding: 20px;
            }
            .flight {
              background-color: #fff;
              padding: 15px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              margin-bottom: 20px;
            }
            hr {
              border: none;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <h1>Flight Search Results</h1>
          ${flightDetails}
        </body>
        </html>
      `;
  
      res.send(htmlContent);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching flight data.');
    }
  });
  

app.use("/users", userRouter);
app.use("/flight", authMiddleware, flightRouter);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is working on port ${PORT}`);
});
