import express from 'express'
import { createEmployee } from '../controllers/createEmployee.js';
import hasToken from '../middlewares/hasToken.js';
import canCreateEmployee from '../middlewares/canCreateEmployee.js';

const router = express.Router();


router.post('/newEmployee', hasToken, canCreateEmployee,  createEmployee)

export default router;