const controller = require('../controller/controller');
const middleWare = require('../middleware/middleware');

const router = require('express').Router();

router.post('/create-admin',controller.createAdmin);

router.post('/admin-login',controller.adminLogin);

router.post('/create-user',middleWare.adminMiddleWare,controller.createStaff);



module.exports = router;