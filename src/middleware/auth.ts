import { Request, Response, NextFunction, request } from "express";
import jwt from "jsonwebtoken";
import {User} from "../classes";

//cookie is an [object Object] which must be parsed to string to display
//JSON.stringify(var) turns it into json compatible viewing
//both queries and tokens return results as string, must do type conversion after recieving


export const jwtCheck = (req: Request, res: Response, next: NextFunction) => {
    // We can obtain the session token from the requests cookies, which come with every request
    const token = req.cookies.jwtoken;
    //console.log(token);
    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).send({message: "You are not authorized"});
    }
    let payload;
    
    try {
        // Parse the JWT string and store the result in payload.
        // Note that we are passing the key in this method as well. This method will throw an error
        // if the token is invalid (if it has expired according to the expiry time we set on sign in),
        // or if the signature does not match
        payload = jwt.verify(token, 'shhhsecret');
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            // JWT is unauthorized, return a 401 error
            return res.status(401).end();
        }
            // otherwise, return a bad request error
            return res.status(400).end();
    }
    //Only checks if token is set and real
    //console.log(payload);
    //console.log(payload instanceof User);
    //res.send(`Welcome ${JSON.stringify(payload)}!`);
    console.log(`Welcome ${JSON.stringify(payload)}!`)
    next();
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwtoken;
    console.log(token);
    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).end();
    }
    let payload;
    try {
        payload = jwt.verify(token, 'shhhsecret');
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            // JWT is unauthorized, return a 401 error
            return res.status(401).end();
        }
            // otherwise, return a bad request error
            return res.status(400).end();
    }
    let {userId,username,firstName,lastName,email,role} = JSON.parse(JSON.stringify(payload));
    let user = new User(userId,username,firstName,lastName,email,role);
    if (user.roleId()===1){
        // Check role id 
        res.send(`Welcome Admin: ${user.username}!`);
    } else{
        res.status(400).send("You are not an Admin");
    }
}

export const isManager = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwtoken;
    console.log(token);
    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).end();
    }
    let payload;
    try {
        payload = jwt.verify(token, 'shhhsecret');
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            // JWT is unauthorized, return a 401 error
            return res.status(401).end();
        }
            // otherwise, return a bad request error
            return res.status(400).end();
    }
    let {userId,username,firstName,lastName,email,role} = JSON.parse(JSON.stringify(payload));
    let user = new User(userId,username,firstName,lastName,email,role);
    if (user.roleId()===2||user.roleId()===1){
        // Check role id 
        //res.send(`Welcome Manager: ${user.username}!`);
        console.log((`Welcome Manager: ${user.username}!`));
        next();
    } else{
        res.status(400).send("You are not a manager");
    }
}

export const isEmployee = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwtoken;
    console.log(token);
    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).end();
    }
    let payload;
    try {
        payload = jwt.verify(token, 'shhhsecret');
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            // JWT is unauthorized, return a 401 error
            return res.status(401).end();
        }
            // otherwise, return a bad request error
            return res.status(400).end();
    }
    let {userId,username,firstName,lastName,email,role} = JSON.parse(JSON.stringify(payload));
    let user = new User(userId,username,firstName,lastName,email,role);
    if (user.roleId()===3||user.roleId()===2||user.roleId()===1){
        // Check role id 
        res.send(`Welcome Employee: ${user.username}!`);
    } else{
        res.status(400).send("You are not an employee");
    }
}

export const currEmpOrHigher = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwtoken;
    let id=req.params.userId;
    console.log(token);
    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).end();
    }
    let payload;
    try {
        payload = jwt.verify(token, 'shhhsecret');
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            // JWT is unauthorized, return a 401 error
            return res.status(401).end();
        }
            // otherwise, return a bad request error
            return res.status(400).end();
    }
    let {userId,username,firstName,lastName,email,role} = JSON.parse(JSON.stringify(payload));
    userId=parseInt(userId,10);
    let user = new User(userId,username,firstName,lastName,email,role);
    //console.log(id);
    //console.log(userId);
    //console.log(parseInt(id,10));
    //console.log(user.roleId());
    //console.log(typeof user.userId);
    if (user.roleId()===2||user.roleId()===1){
        //if manager or admin then next
        next();
    } else if (user.roleId()===3 && user.userId===parseInt(id,10)) {
        //if user is an employee and is same user being requested as logged in then next
        next();
    } else{
        res.status(400).send("You are not authorized to view this user");
    }
}

export const logout = (req: Request, res: Response) => {
    let cookie = req.cookies;
    if (cookie.jwtoken!==undefined){
        console.log("loggin out" + JSON.stringify(cookie.jwtoken));
        res.clearCookie('jwtoken');
        res.status(200).send('<html><body>User is now logged out, but JWT is still valid until expiry...</br><a href="/"><button type="button">Homepage</button></a></body></html>');
    } else {
        console.log("No JWToken found. User already logged out.")
        res.status(200).send('<html><body>No JWToken found. User already logged out.</br><a href="/"><button type="button">Homepage</button></a></body></html>');
    }
}
export const checkQueryParams = (req: Request, res: Response, next: NextFunction) => {
    let search = JSON.stringify(req.query);
    let startDate = search.slice(search.indexOf("startDate")).split('"')[2];
    let endDate = search.slice(search.indexOf("endDate")).split('"')[2];
    // console.log(startDate); //ugh NaN is not equal === to NaN NaN = Number use Number.isNaN(var) -.-
    // console.log(Date.parse(startDate));
    // console.log(Number.isNaN(Date.parse(startDate)));
    // console.log(endDate);
    // console.log(selectQ);
    // console.log(values[1]);
    if (!search || (!startDate && !endDate)) {
        next();
    } else if (startDate && !endDate) {
        if (Number.isNaN(Date.parse(startDate))){
            res.status(400).send({message: "Error startDate must be in YYYY-MM-DD format"});
        } else {
            next();
        }
    } else if (!startDate && endDate) {
        if (Number.isNaN(Date.parse(endDate))){
            res.status(400).send({message: "Error endDate must be in YYYY-MM-DD format"});
        } else {
            next();
        }
    } else if (startDate && endDate) {
        if (Number.isNaN(Date.parse(startDate))){
            res.status(400).send({message: "Error startDate must be in YYYY-MM-DD format"});
        } else if (Number.isNaN(Date.parse(endDate))){
            res.status(400).send({message: "Error endDate must be in YYYY-MM-DD format"});
        } else {
        next();
        }
    } else {
        next();
    }
}