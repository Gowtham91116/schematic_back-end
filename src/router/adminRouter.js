const controller = require('../controller/controller');
const middleWare = require('../middleware/middleware');

const router = require('express').Router();

router.post('/create-admin',controller.createSuperAdmin);

router.post('/admin-login',controller.superAdminLogin);

router.get('/get-admin',middleWare.superAdminMiddleWare,controller.getSuperAdminById);

router.get('/get-admin-role',middleWare.superAdminMiddleWare,controller.getRoles);

router.put('/edit-admin-role/:_id',middleWare.superAdminMiddleWare,controller.editRole);

router.put('/delete-admin-role/:_id',middleWare.superAdminMiddleWare,controller.deleteRole);

router.get('/get-admin-role/:_id',middleWare.superAdminMiddleWare,controller.getSingleRole);

router.put('/edit-admin',middleWare.superAdminMiddleWare,controller.editSuperAdminById);

router.put('/delete-admin',middleWare.superAdminMiddleWare,controller.deleteSuperAdminById);

router.post('/create-role',middleWare.superAdminMiddleWare,controller.createRole);

router.post('/create-user',middleWare.superAdminMiddleWare,controller.createUser);

router.get('/get-users',middleWare.superAdminMiddleWare,controller.getUsers);

router.post('/create-expances',middleWare.superAdminMiddleWare,controller.createExpanseSchema);

router.get('/get-expances/:isApproved',middleWare.superAdminMiddleWare,controller.getExpensesData);

router.get('/get-single-expances/:_id',middleWare.superAdminMiddleWare,controller.getExpancesById);




module.exports = router;