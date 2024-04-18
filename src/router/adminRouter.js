const controller = require('../controller/controller');
const middleWare = require('../middleware/middleware');

const router = require('express').Router();

router.post('/create-admin',controller.createSuperAdmin);

router.post('/admin-login',controller.superAdminLogin);

router.post('/create-role/:_id',middleWare.superAdminMiddleWare,controller.createRole);

module.exports = router;