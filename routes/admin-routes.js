"use strict";

var express = require('express');
var router = express.Router();
var check = require('../model/rightCheck');
var adminModule = require('../model/admin');

/* GET users listing. */
router.get('/login', function (req, res, next) {
    adminModule.findAll(function (users) {
        res.render('login', {
            title: '管理员登录', users: users, layout: false, user: req.session.user
        });
    });
    // res.sendfile('views/static/about-me.pdf');
});

router.post('/login', function (req, res, next) {
    var loginInfo = req.body;
    adminModule.login(loginInfo, function (users) {
        if (users.length === 0) {
            res.json({code: 100000, errorMessage: '口令不正确'})
        } else {
            req.session.user = users[0];
            res.json({code: 100100})
        }
    });
});

router.get('/logoff', check, function (req, res, next) {
    req.session = null;
    res.redirect('/');
});

router.post('/sendmessage', function (req, res, next) {

    var message = req.body, value = message.content;

    if(/--|or.+=.+/g.test(value)){
        res.json({code: 100002, err:'检测到你有使用sql注入攻击的嫌疑哟'});
        return;
    }else if(/<script>|<\/script>|<img>|<\/img>/g.test(value)){
        res.json({code: 100001, err:'检测到你有使用xss攻击的嫌疑哟'});
        return;
    }

    adminModule.sendMessage(message, () => {
        res.json({code: 100100});
    });
});

router.get('/messages', check, (req, res, next) => {
    adminModule.getMessages((messages) => {
        adminModule.findUncheckedMessageAmount((message) => {
            // messages.filter((item) => {
            //     return item.status !== 0;
            // });
            // console.log(messages);
            res.render('message', {
                title: '信息处理',
                messages: messages,
                user: req.session.user,
                message_amount: message[0].message_amount
            });
        });
    });
});

router.get('/deleteMessage', check, (req, res) => {

    let id = req.query.id;

    adminModule.deleteMessage(id, () => {
        res.redirect('/admin/messages')
    });
});

router.get('/cancelMessage', check, (req, res) => {

    let id = req.query.id;

    adminModule.cancelMessage(id, () => {
        res.redirect('/admin/messages')
    });
});

module.exports = router;
