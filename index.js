const express = require("express");
var morgan = require('morgan');
const bodyparser = require("body-parser");
const PORT = 3011;
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const apigateway_Server = async()=>{
    const app = express();

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({extended:true}));

    app.use(morgan('combined'));

    const limiter = rateLimit({
        windowMs: 2 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        
    });

    app.use(limiter);

    app.use('/bookingservice' , async(req ,res ,next) =>{
        try {
            const obj = await axios.get(`http://localhost:3001/api/v1/isAuthenticated` , {
                headers : {
                    'x-access-token' : req.headers["x-access-token"],
                }
            });
            if(obj.data){
                next();
            }
            else {
                throw {error : "Login required to use this service"};
            }
        } catch (error) {
            return res.status(404).json({
                message : "Login required to use this service",
                success : false,
                err : error
            })
        }     
        
    })
    app.use('/bookingservice' , createProxyMiddleware({ target: 'http://localhost:3002/', changeOrigin: true }))
    app.get('/home' , (req,res)=>{
        return res.status(201).json({
            message : "Status Ok"
        })
    });
    app.listen(PORT , ()=>{
        console.log("Server started at " , PORT);
    })
}

apigateway_Server();