import express from 'express'
import { createEmployee } from '../controllers/createEmployee.js';
import hasToken from '../middlewares/hasToken.js';

const router = express.Router();


router.post('/newEmployee', hasToken,  createEmployee)

export default router;