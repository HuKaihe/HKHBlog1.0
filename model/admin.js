"use strict";

let db = require('./db');
let moment = require('moment');

let findAll = (callback) => {
    db.query('select id, name, portrait from admin', callback);
};

let login = (loginInfo, callback) => {
    db.query('select * from admin where id = ? and password = ?', [loginInfo.id, loginInfo.password], callback)
};

let sendMessage = (message, callback) => {
    message.date = moment().format('YYYY-MM-DD HH:mm:ss');
    db.insert('insert into message set ?', [message], callback)
};

let getMessages = (cb) => {
    db.query('select * from message order by date desc', cb);
};

let deleteMessage = (id, cb) => {
    db.delete('delete from message where id = ?',id,cb)
};

let cancelMessage = (id, cb) => {
    db.update('update message set status = 0 where id = ?',id,cb)
};

let findUncheckedMessageAmount = (cb) => {
    db.query('select count(*) as message_amount from message where status = 1',cb);
};

exports.findAll = findAll;
exports.login = login;
exports.sendMessage = sendMessage;
exports.getMessages = getMessages;
exports.deleteMessage = deleteMessage;
exports.cancelMessage = cancelMessage;
exports.findUncheckedMessageAmount = findUncheckedMessageAmount;