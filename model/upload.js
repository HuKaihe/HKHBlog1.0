var multer = require('multer');

var storage = multer.diskStorage({
    //设置上传后文件路径
    'destination': function (req, file, cb) {
        cb(null, './public/images/blog')
    },
    //给上传文件重命名
    'filename': function (req, file, cb) {
        var date = new Date();
        cb(null, 'hkh' + date.getFullYear() + date.getMonth()  + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + ".jpg");
    }
});

var upload = multer({
    storage: storage
});

module.exports = upload;