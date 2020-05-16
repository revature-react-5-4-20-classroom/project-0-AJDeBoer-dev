import express from 'express';
import {Request, Response, NextFunction } from "express";
import {getReimByStatus,getReimByUser} from '../queries';
import {jwtCheck,isManager,currEmpOrHigher, checkQueryParams} from "../middleware/auth";

const router = express.Router();

router.use(jwtCheck); // middleware authentication here 

router.get('/author/userId/:userId', currEmpOrHigher, getReimByUser);
router.get('/status/:statusId', isManager, getReimByStatus);
router.get('/author/userId/:userId/dateSubmitted', checkQueryParams, currEmpOrHigher, getReimByUser);
router.get('/status/:statusId/dateSubmitted', checkQueryParams, isManager, getReimByStatus);
router.post('/author',(req: Request, res: Response) => {
    let id=req.body.userid;
    //console.log(id);
    res.redirect(`/reimbursements/author/userId/${id}`);
});
router.post('/status',(req: Request, res: Response) => {
    let status=req.body.status;
    //console.log(status);
    res.redirect(`/reimbursements/status/${status}`);
});

export default router;