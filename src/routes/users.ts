import express from 'express';
import {Router, Request, Response, NextFunction } from 'express';
import {getAllUsers,getSoloUser} from '../queries';
import {jwtCheck,isManager,currEmpOrHigher, checkQueryParams} from "../middleware/auth";

export const router : Router = express.Router();

// router.get('/idtest/:id/dateSubmitted', checkQueryParams, (req: Request, res: Response) => {
//     let id=req.params.id;
//     let search=JSON.stringify(req.query);
//     console.log(id);
//     console.log(search);
//     console.log(search.slice(search.indexOf("startDate")).split('"')[2]);
//     console.log(search.slice(search.indexOf("endDate")).split('"')[2]);
//     res.status(200).send(`url is: ${id} & query is: ${JSON.stringify(search)}`);
// });

router.use(jwtCheck); // middleware authentication here 
// router.use(checkQueryParams); //check query Params if passed 

router.get('/', isManager, getAllUsers);
router.get('/:userId', currEmpOrHigher, getSoloUser);
router.post('/id',(req: Request, res: Response) => {
    let id=req.body.userid;
    console.log(id);
    res.redirect(`/users/${id}`);
});


export default router;