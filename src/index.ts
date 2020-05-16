import express from 'express';
import { Application, Request, Response, NextFunction } from "express";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
//import * as path from 'path';
//const express = require('express');
//const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');
const app = express();
const port = 6996;
import {userAuth} from './queries';

import {logout} from './middleware/auth'
import usersRouter from './routes/users';
import reimRouter from './routes/reimbursements';

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));

//app.use(auth.evalCookies);
app.use('/users', usersRouter);
app.use('/reimbursements', reimRouter);
app.use(express.static('/public'));

app.get('/', (req: Request, res: Response) => {
    let cookie = req.cookies;
    if (cookie.jwtoken===undefined){
        console.log("No cookie set. Waiting for user login");
        res.sendFile('./public/index.html', { root: __dirname });
    } else {
        console.log('Current user is: ' + JSON.stringify(cookie));
        res.sendFile('./public/index.html', { root: __dirname });
    }
    //res.json({ info: 'Node.js, Express, and Postgres API' });
    //res.send("LOOK OUT WORLD! My server is running!");
});
app.post('/login', userAuth);
app.get('/logout', logout);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);

});