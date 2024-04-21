const controller = require('../controller/controller');
const middleWare = require('../middleware/middleware');

const router = require('express').Router();

router.post('/create-admin',controller.createSuperAdmin);

router.post('/admin-login',controller.superAdminLogin);

router.get('/get-admin',middleWare.superAdminMiddleWare,controller.getSuperAdminById);

router.get('/get-admin-role',middleWare.superAdminMiddleWare,controller.getSuperAdminWithRole);

router.put('/edit-admin',middleWare.superAdminMiddleWare,controller.editSuperAdminById);

router.put('/delete-admin',middleWare.superAdminMiddleWare,controller.deleteSuperAdminById);

router.post('/create-role/:_id',middleWare.superAdminMiddleWare,controller.createRole);

module.exports = router;