import express from 'express'
import { createEmployee } from '../controllers/createEmployee.js';
import hasToken from '../middlewares/hasToken.js';
import canCreateEmployee from '../middlewares/canCreateEmployee.js';
import { createDepartment } from '../controllers/createDepartment.js';
import canCreateDepartment from '../middlewares/canCreateDepartment.js';
import { updateDepartment } from '../controllers/updateDepartment.js';

const router = express.Router();


router.post('/employee', hasToken, canCreateEmployee,  createEmployee);
router.post('/department', hasToken, canCreateDepartment, createDepartment);
router.patch('/department', hasToken, canCreateDepartment, updateDepartment);
// router.post('/employee', hasToken, canUpdateEmployee,  createEmployee);

export default router;