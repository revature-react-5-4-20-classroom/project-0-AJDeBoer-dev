import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {User} from "./classes"
import * as pg from 'pg';
const { Pool } = pg;
//const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'appAdmin',
  host: 'localhost',
  database: 'ERSapp',
  password: 'ERSpass',
  port: 5432,
});

//parameterise the query to avoid string literals escaping mid query
//POSTGRES sanitizes subsituted parameter inputs while maintaining original query unaltered
//just replace compared variable with $1,$2,$3... then pass arrayed variables ",[variable1,variable2,variable3]," before (error,results)
//results are returned as strings, must do type conversion after recieving every time

export const userAuth = (request: Request, response: Response) => {
  pool.query('SELECT "userId", "username", "firstName", "lastName", "email", "role" FROM "Users" WHERE "username" = $1 AND "password" = $2',
  [request.body.username,request.body.password], (error: any, results: any) => {
    if (error) {
      throw error;
    } 
    if (results.rows.length===0){
      response.status(400).send("Invalid Credentials");
    }else{
      // set cookie
      console.log("We signed the JSON Web Token");
      let {userId,username,firstName,lastName,email,role} = results.rows[0];
      let user = new User(userId,username,firstName,lastName,email,role);
      //console.log(user);
      const token = jwt.sign(JSON.stringify(user), 'shhhsecret');
      console.log(token);
      // assign jwt to cookie
      response.cookie('jwtoken', token, {
        maxAge: 60*60*1000,
        httpOnly: false,
        secure: false,
        sameSite: true
      }).redirect(`/users/${userId}`);
    }
  });
}

export const getSoloUser = (request: Request, response: Response) => {
  //console.log("user is " + id);
  let id=request.params.userId;
  pool.query('SELECT * FROM "Users" WHERE "userId" = $1',[id], (error: any, results: any) => {
    if (error) {
      throw error;
    }
    if (results.rows.length===0){
      response.status(404).json("No such user");
    } else {
      response.status(200).json(results.rows);
    }
  });
}

export const getAllUsers = (request: Request, response: Response) => {
  pool.query('SELECT * FROM "Users" ORDER BY "userId" ASC', (error: any, results: any) => {
    if (error) {
      throw error;
    }
    if (results.rows.length===0){
      response.status(404).json("Error no users in database.");
    } else {
      response.status(200).json(results.rows);
    }
  });
}

export const getReimByUser = (request: Request, response: Response) => {
  let id = request.params.userId;
  let search = JSON.stringify(request.query);
  let selectQ = 'SELECT * FROM "Reim" WHERE "author" = $1';
  let startDate = search.slice(search.indexOf("startDate")).split('"')[2];
  let endDate = search.slice(search.indexOf("endDate")).split('"')[2];
  let values = [id];
  // console.log(startDate); //ugh NaN is not equal === to NaN NaN = Number use Number.isNaN(var) -.-
  // console.log(Date.parse(startDate));
  // // let x = Date.parse(startDate);
  // console.log(Number.isNaN(Date.parse(startDate)));
  // // console.log(endDate);
  // // console.log(selectQ);
  // // console.log(values[1]);
  if (!startDate && !endDate) {
    selectQ += ' ORDER BY "dateSubmitted" ASC';
  } else if (startDate && !endDate) {
      selectQ += ' AND "dateSubmitted" >= to_date($2,$3) ORDER BY "dateSubmitted" ASC';
      values.push(startDate);
      values.push('YYYYMMDD');
  } else if (!startDate && endDate) {
      selectQ += ' AND "dateSubmitted" <= to_date($2,$3) ORDER BY "dateSubmitted" ASC';
      values.push(endDate);
      values.push('YYYYMMDD');
  } else if (startDate && endDate) {
      selectQ += ' AND "dateSubmitted" BETWEEN to_date($2,$3) AND to_date($4,$5) ORDER BY "dateSubmitted" ASC';
      values.push(startDate);
      values.push('YYYYMMDD');
      values.push(endDate);
      values.push('YYYYMMDD');
  }
  // console.log(selectQ);
  // console.log(values);
  pool.query(selectQ,values, (error: any, results: any) => {
    if (error) {
      throw error;
    }
    if (results.rows.length===0){
      response.status(404).send(`No Reimbursements from user: ${id} found`);
    } else {
      response.status(200).send(results.rows);
    }
  });
}


export const getReimByStatus = (request: Request, response: Response) => {
  let reimStatus=request.params.statusId;
  let search = JSON.stringify(request.query);
  let selectQ = 'SELECT * FROM "Reim" WHERE "status" = $1';
  let startDate = search.slice(search.indexOf("startDate")).split('"')[2];
  let endDate = search.slice(search.indexOf("endDate")).split('"')[2];
  let values = [reimStatus];
  // console.log(startDate); //ugh NaN is not equal === to NaN NaN = Number use Number.isNaN(var) -.-
  if (!startDate && !endDate) {
      selectQ += ' ORDER BY "dateSubmitted" ASC';
  } else if (startDate && !endDate) {
      selectQ += ' AND "dateSubmitted" >= to_date($2,$3) ORDER BY "dateSubmitted" ASC';
      values.push(startDate);
      values.push('YYYYMMDD');
  } else if (!startDate && endDate) {
      selectQ += ' AND "dateSubmitted" <= to_date($2,$3) ORDER BY "dateSubmitted" ASC';
      values.push(endDate);
      values.push('YYYYMMDD');
  } else if (startDate && endDate) {
      selectQ += ' AND "dateSubmitted" BETWEEN to_date($2,$3) AND to_date($4,$5) ORDER BY "dateSubmitted" ASC';
      values.push(startDate);
      values.push('YYYYMMDD');
      values.push(endDate);
      values.push('YYYYMMDD');
  }
  // console.log(selectQ);
  // console.log(values);
  pool.query(selectQ,values, (error: any, results: any) => {
    if (error) {
      throw error;
    }
    if (results.rows.length===0){
      response.status(404).json(`No Reimbursements of status: ${reimStatus} found`);
    } else {
      response.status(200).json(results.rows);
    }
  });
}

export const updateUser = (request: Request, response: Response) => {
  let user1 = [request.body.firstName, request.body.lastName,request.body.email,request.body.username,request.body.password,request.body.role,request.body.userId];
  let col = ['"firstName"','"lastName"','"email"','"username"','"password"','"role"'];
  let query1 = 'UPDATE "Users" SET '
  let count=1;
  let paramCount=1;
  let returnVal=[];
  if (request.body.userId===undefined||request.body.userId===null){
    response.status(400).json("Error must include reimbursementId");
  }
  else {
    for (let i of user1){
      if ((count<user1.length-1) && i!==undefined){
        query1+=col[(count-1)]+"= $"+paramCount+",";
        paramCount++;
        returnVal.push(user1[count-1]);
      }
      if (count===user1.length){
        query1=query1.slice(0,-1);
        query1+=' WHERE "userId= $'+paramCount+' RETURNING *';
        returnVal.push(user1[count-1]);
      }
      count++;
    }
    pool.query(query1,returnVal, (error: any, results: any) => {
      if (error) {
        throw error;
      }
      if (results.rows.length===0){
        response.status(404).json("Not sure you would ever see this before an error.");
      } else {
        response.status(200).json(results.rows);
      }
    });
  }
}
export const updateReim = (request: Request, response: Response) => {
  let reim = [request.body.amount, request.body.description,request.body.status,request.body.type,request.body.dateSubmitted,request.body.author,request.body.dateResolved,request.body.reimbursementId];
  let col = ['"amount"','"description"','"status"','"type"','"dateSubmitted"','"author"','"dateResolved"'];
  let query1 = 'UPDATE "Reim" SET '
  let count=1;
  let paramCount=1;
  let returnVal=[];
  if (request.body.reimbursementId===undefined||request.body.reimbursementId===null){
    response.status(400).json("Error must include reimbursementId");
  }
  else {
    for (let i of reim){
      if ((count<reim.length-1) && i!==undefined){
        query1+=col[(count-1)]+"= $"+paramCount+",";
        paramCount++;
        returnVal.push(reim[count-1]);
      }
      if (count===reim.length){
        query1=query1.slice(0,-1);
        query1+=' WHERE "reimbursementId= $'+paramCount+' RETURNING *';
        returnVal.push(reim[count-1]);
      }
      count++;
    }
    pool.query(query1,returnVal, (error: any, results: any) => {
      if (error) {
        throw error;
      }
      if (results.rows.length===0){
        response.status(404).json("Still not sure you would ever see this before an error.");
      } else {
        response.status(200).json(results.rows);
      }
    });
  }
}

export const subReim = (request: Request, response: Response) => {
  pool.query('INSERT INTO "Reim" (amount, description, status, type, dateSubmitted, author) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [request.body.amount, request.body.description,request.body.status,request.body.type,request.body.dateSubmitted,request.body.author], 
    (error: any, results: any) => {
    if (error) {
      throw error;
    }
    if (results.rows.length===0){
      response.status(404).json("Shouldn't see this before an error either.");
    } else {
      response.status(200).json(results.rows);
    }
  });
}