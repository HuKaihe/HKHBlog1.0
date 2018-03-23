"use strict";

let express = require('express');
let router = express.Router();
let Blog = require('../model/Blog');
let Admin = require('../model/admin');
let fs = require('fs');
var check = require('../model/rightCheck');
var async = require('async');

// 博客首页
router.get('/', function (req, res, next) {

    async.series({
            blogs: (cb) => {
                Blog.findForIndex([0, 6], (blogs) => {
                    cb(null, blogs);
                })
            },
            orderedTechRecords: (cb) => {
                Blog.orderByReadQuality(1, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {
                    cb(null, orderedTechRecords);
                })
            },
            news: (cb) => {
                Blog.findLatestNews((news) => {
                    cb(null, news);
                })
            },
            length: (cb) => {
                Blog.findLength((record) => {
                    cb(null, record[0].length);
                })
            },
        },
        function (err, records) {
            res.render('index', {
                title: '胡凯赫的个人主页',
                blogs: records.blogs,
                orderedTechRecords: records.orderedTechRecords,
                user: req.session.user,
                news: records.news[0],
                length: records.length
            })
        }
    );
});

router.get('/more', (req, res) => {

    var min = req.query.min;

    Blog.findForIndex([min, 4], (blogs) => {
        res.json(blogs)
    });
});

// 神学探究
router.get('/theology', (req, res, next) => {
    Blog.findByType(2, function (blogs) {
        Blog.orderByReadQuality(2, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {

            var blogsForDate = {};

            blogs.forEach(function (item) {

                var date = new Date(item.pub_date),
                    dateStr = date.getFullYear() + "-" + (date.getMonth() + 1),
                    dateDetail = dateStr + '-' + date.getDate();

                if (!(dateStr in blogsForDate)) {
                    blogsForDate[dateStr] = [];
                }

                blogsForDate[dateStr].push({title: item.title, pub_date: dateDetail, id: item.id});
            });

            res.render('theology', {
                title: '神学探究',
                blogs: blogs,
                orderedTechRecords: orderedTechRecords,
                user: req.session.user,
                blogsForDate: blogsForDate,
            })
        });
    })
});

// 技术小栈
router.get('/technology', (req, res, next) => {
    Blog.findByType(1, function (blogs) {

        var blogsForDate = {};

        blogs.forEach(function (item) {

            var date = new Date(item.pub_date),
                dateStr = date.getFullYear() + "-" + (date.getMonth() + 1),
                dateDetail = dateStr + '-' + date.getDate();

            if (!(dateStr in blogsForDate)) {
                blogsForDate[dateStr] = [];
            }

            blogsForDate[dateStr].push({title: item.title, pub_date: dateDetail, id: item.id});
        });

        Blog.orderByReadQuality(1, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {
            res.render('technology', {
                title: '技术小栈',
                blogs: blogs,
                orderedTechRecords: orderedTechRecords,
                user: req.session.user,
                nav: '全部',
                blogsForDate: blogsForDate,
            })
        });
    })
});

// 生活感悟
router.get('/life', (req, res, next) => {
    Blog.findByType(3, function (blogs) {
        Blog.orderByReadQuality(2, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {

            var blogsForDate = {};

            blogs.forEach(function (item) {

                var date = new Date(item.pub_date),
                    dateStr = date.getFullYear() + "-" + (date.getMonth() + 1),
                    dateDetail = dateStr + '-' + date.getDate();

                if (!(dateStr in blogsForDate)) {
                    blogsForDate[dateStr] = [];
                }

                blogsForDate[dateStr].push({title: item.title, pub_date: dateDetail, id: item.id});
            });

            res.render('life', {
                title: '生活感悟',
                blogs: blogs,
                user: req.session.user,
                blogsForDate: blogsForDate,
            })
        });
    })
});




// 测试路由
router.get('/test', function (req, res, next) {
    // commonModule.findLengthByCase('blog', [{
    //     field:'site_classify',
    //     relation:'=',
    //     value:'1'
    // }], (records) => {
    //     console.log(records);
    // });

    async.series({
        a: function (cb) {
            setTimeout(function () {
                console.log('1 step');
                cb(null)
            }, 2000)
        },
        b: function (cb) {
            setTimeout(function () {
                console.log('2 step');
                cb(null);
            }, 1000)
        }
    }, function () {
        console.log('done')
    });


    res.render('test', {
        title: '测试页'
    })
});

router.post('/test', function (req, res, next) {
    // do something
    // console.log(req.body);
    // fs.writeFile('./test.txt', req.body.myfile, function (err) {
    //     console.log('写入成功！')
    // });
    console.log(req.session.user);
    res.json(req.session.user);
});

module.exports = router;
