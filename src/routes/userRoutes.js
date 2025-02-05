const express=require('express');
const Router=express.Router();

const Controller=require('../controller/userController.js')



Router.post('/register',Controller.register);//register
Router.post('/login',Controller.login);//login

module.exports =Router;

