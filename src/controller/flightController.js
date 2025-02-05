const   axios  = require('axios');
const Booking=require('../models/Booking.js');
const winston = require("winston");


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



async function getAmadeusToken() {
    try {
      logger.info("Fetching Amadeus access token");
      const response = await axios.post(
        "https://test.api.amadeus.com/v1/security/oauth2/token",
        new URLSearchParams({  //  Correct way to send form data
          grant_type: "client_credentials",
          client_id: process.env.AMADEUS_CLIENT_ID,
          client_secret: process.env.AMADEUS_CLIENT_SECRET,
        }).toString(), 
  
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      logger.info("Amadeus token received");
    //   console.log("amadeus token_______", response.data.access_token);
      return response.data.access_token;
    } catch (err) {
      logger.error("Amadeus Token error: ", err);
      throw new Error("Failed to get Amadeus token");
    }
  }


const searchFlight=async (req,res)=>{ 
    try {
    logger.info("Search flights request received", {
      body: req.body,
      user: req.user,
    });
    const { origin, destination, date, adults } = req.body;
    const token = await getAmadeusToken();
    console.log("amadeus token_______",  token);

    const response = await axios.get(
      "https://test.api.amadeus.com/v2/shopping/flight-offers",
      {
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: date,
          adults,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    logger.info("Flights search response", { response: response.data });
    res.json(response.data);
  } catch (err) {
    logger.error("Search Flights error: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


const bookFlight=async (req,res)=>{
    try {
        logger.info("Book flight request received", {
          body: req.body,
          user: req.user,
        });
        const { flightDetails } = req.body;
        const token = await getAmadeusToken();
        const response = await axios.post(
          "https://test.api.amadeus.com/v1/booking/flight-orders",
          { data: flightDetails },
          { headers: { Authorization: `Bearer ${token}` } } 
        );
        const booking = new Booking({
          user: req.user.userId,
          details: response.data,
        });
        await booking.save();
        logger.info("Flight booked successfully", { bookingId: booking._id });  
        res.json(response.data);
      } catch (err) {
        logger.error("Book Flight error: ", err);
        console.log("errr_____  ",err)
        res.status(500).json({ error: "Internal Server Error" });
      }
    
}

const bookDetail=async (req,res)=>{

    try {
        logger.info("Get bookings request received", { user: req.user });
        const bookings = await Booking.find({ user: req.user.userId });
        logger.info("User bookings retrieved", { count: bookings.length });  
        res.json(bookings);
      } catch (err) {
        logger.error("Get Bookings error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    

}

module.exports={searchFlight,bookFlight,bookDetail};