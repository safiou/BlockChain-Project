const express = require('express');
const usrCtrl = require('./routes/usersCtrl');
exports.router = (()=>{
    const apiRouter = express.Router();

    apiRouter.route('/register/').post(usrCtrl.register);
    apiRouter.route('/login/').post(usrCtrl.login);
    apiRouter.route('/logout/').get(usrCtrl.logout);
    apiRouter.route('/editprofil/').post(usrCtrl.editProfil);
    apiRouter.route('/editpassword/').post(usrCtrl.editPassword);

    apiRouter.route('/newtransaction/').post(usrCtrl.newTransaction);

    apiRouter.route('/usertransactions/').get(usrCtrl.userTransaction);

    apiRouter.route('/blocks/').get(usrCtrl.blocks);
    apiRouter.route('/allusers/').get(usrCtrl.allUsers);
    apiRouter.route('/depositbalance/').post(usrCtrl.depositBalance);


    return apiRouter;
})();