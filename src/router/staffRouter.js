const controller = require('../controller/controller');
const middleware = require('../middleware/middleware');

const router = require('express').Router();

router.post('/user-login',controller.staffLogin);

router.post('/create-expances/:Staff_id',middleware.staffMiddleWare,controller.staffExpances);

router.get('/get-expances/:Staff_id',controller.getStaffExpances);



module.exports = router;