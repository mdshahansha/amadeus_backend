const express=require('express');
const Router=express.Router();

const Controller=require('../controller/flightController')



Router.post('/search-flight',Controller.searchFlight );//search-flight
Router.post('/book-flight',Controller.bookFlight)
Router.get('/booking',Controller.bookDetail);//booking

module.exports =Router;

