"use strict";

let express = require('express');
let router = express.Router();
let Blog = require('../model/Blog');
let Admin = require('../model/admin');
let upload = require('../model/upload');
let check = require('../model/rightCheck');
var async = require('async');

// 根据标签查找博客列表
router.get('/technology', (req, res, next) => {
    let tag = req.query.tag;

    async.series({
        blogs: function (cb) {

            Blog.findByTag(tag, (blogs) => {

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

                cb(null, [blogs, blogsForDate])
            })
        },
        orderedTechRecords: (cb) => {
            Blog.orderByReadQuality(1, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {
                cb(null, orderedTechRecords)
            })
        }
    }, function (err, record) {
        res.render('technology', {
            title: '关于【' + tag + '】的博客',
            blogs: record.blogs[0],
            blogsForDate: record.blogs[1],
            nav: tag,
            orderedTechRecords: record.orderedTechRecords,
            user: req.session.user
        })
    });
});

// 根据分类查找技术博客
router.get('/innerclassify', (req, res, next) => {

    let innerClassify = req.query.type;

    async.series({
        blogs: function (cb) {
            Blog.findTechByType(innerClassify, (blogs) => {
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

                cb(null, [blogs, blogsForDate])
            })
        },
        orderedTechRecords: (cb) => {
            Blog.orderByReadQuality(1, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {
                cb(null, orderedTechRecords)
            })
        }
    }, function (err, record) {
        res.render('technology', {
            title: innerClassify,
            blogs: record.blogs[0],
            blogsForDate: record.blogs[1],
            nav: innerClassify,
            orderedTechRecords: record.orderedTechRecords,
            user: req.session.user
        })
    });
});

// 查看博客
router.get('/article', (req, res, next) => {
    let id = req.query.id || req.query.blog_id;

    async.series({
        blog: (cb) => {
            Blog.findById(id, (blog) => {
                cb(null, blog[0]);
            })
        },
        inc: (cb) => {
            Blog.inc(id, () => {
                cb(null)
            })
        },
        orderedTechRecords: (cb) => {
            Blog.orderByReadQuality(1, [0, 9], 'read_quality', 'desc', ['title', 'read_quality', 'id'], (orderedTechRecords) => {
                cb(null, orderedTechRecords)
            })
        },
        nextAndPre: (cb) => {
            Blog.findPreAndNext(id, (nextAndPre) => {
                cb(null, nextAndPre)
            })
        }
    }, (err, record) => {
        try {
            let tag = record.blog.tag,
                inner = record.blog.inner_classify,
                site = record.blog.site_classify;

            Blog.findRelateBlogs(site, inner, tag, (relateBlogs) => {
                res.render('article', {
                    title: '【' + record.blog.title + '】',
                    blog: record.blog,
                    user: req.session.user,
                    orderedTechRecords: record.orderedTechRecords,
                    nextAndPre: record.nextAndPre,
                    relateBlogs: relateBlogs,
                });
            });
        } catch (err) {
            console.log(err)
        }
    });
});

// 为博客点赞
router.post('/goodInc', (req, res, next) => {
    let id = req.body.id;
    console.log(id);
    Blog.incGood(id, () => {
        res.json({code: 10010});
    });
});

// 博客管理
router.get('/manage', (req, res, next) => {

    var data = req.query;
    async.series({
        blogs: (cb) => {
            Blog.flexQuery(data, (blogs) => {
                if(blogs === 'sqlInject'){
                    res.render('error', {
                        message:'开个网站不容易，就不要互相伤害了！',
                        error:{stack:'察觉到用户可能想使用sql注入的方式攻击'}
                    });
                    return;
                }else if(blogs === 'xss'){
                    res.render('error', {
                        message:'开个网站不容易，就不要互相伤害了！',
                        error:{stack:'察觉到用户可能想使用xss的方式攻击'}
                    });
                    return;
                }
                cb(null, blogs);
            });
        },
    }, (err, records) => {
        Admin.findUncheckedMessageAmount((message) => {
            res.render('manage', {
                title: '博客管理',
                blogs: records.blogs,
                user: req.session.user,
                message_amount: message[0].message_amount
            });
        })
    });
});

// echart图表加载
router.get('/getAmount', (req, res) => {
    Blog.getSiteClassifyLength((info) => {
        res.json(info);
    })
});

router.get('/managenew', check, (req, res, next) => {
    var user = req.session.user;
    Blog.findUncheckedBlogs(function (blogs) {
        res.render('manage', {
            title: '博客审核',
            uncheckedBlogs: blogs,
            user: user,
        });
    })
});


// 审核博客
router.get('/pass', (req, res, next) => {
    var id = req.query.id;
    Blog.pass(id, () => {
        res.json({code: 100100})
    });
});

// 删除博客
router.get('/delete', check, (req, res, next) => {

    let id = req.query.id;
    let url = '.' + req.query.url;

    if (url !== './public/images/blog/u2091.jpg') {

        Blog.getAllPicUrls((pic_urls) => {

            let length = 0;

            pic_urls.forEach((el) => {
                if ('.' + el.pic_url === url) {
                    length++;
                }
            });

            if (length > 1) {
                Blog.deleteById(id, () => {
                    res.json({code: 100100})
                })
            } else {
                Blog.deleteBlogPic(url, function () {
                    Blog.deleteById(id, () => {
                        res.json({code: 100100})
                    })
                });
            }
        });

    } else {
        Blog.deleteById(id, () => {
            res.json({code: 100100})
        })
    }
});

// 博客发布与修改

// 管理员博客发布
router.get('/new', check, (req, res, next) => {
    var user = req.session.user;
    res.render('edit', {
        title: '发表博客',
        user: user,
    })
});

// 游客发布博客（不能上传图片，所发表博客需审核）
router.get('/visitnew', function (req, res, next) {
    res.render('edit', {title: '游客发表博客'});
});

// 编辑博客（管理员权限）
router.get('/edit', check, (req, res, next) => {
    let id = req.query.id;
    Blog.findById(id, (blog) => {
        res.render('edit', {
            title: '编辑【' + blog[0].title + '】',
            blog: blog[0],
            user: req.session.user,
        })
    })
});

// 图片上传
router.post('/upload', upload.single('img-preview-input'), function (req, res, next) {
    var pic_url = req.file.path;
    res.json({code: 100100, pic_url: '\\' + pic_url});
});

// 获得所有图片的URL
router.post('/getPicUrls', (req, res) => {
    Blog.getAllPicUrls((pic_urls) => {
        let picArr = [];

        pic_urls.forEach((el) => {

            let url = el.pic_url;

            if (url&&picArr.indexOf(url) === -1) {
                picArr.push(url)
            }
        });

        res.json(picArr);
    })
});

// 发布博客
router.post('/publish', (req, res, next) => {

    var blog = req.body;

    blog.read_quality = 0;
    blog.good_amount = 0;
    blog.comment_amount = 0;

    // 如果后台收到博客作者字段，则为游客发布的博客，否则作者为登陆者
    if (blog.author) {
        blog.status = 0;
    } else {
        blog.author = req.session.user.name;
        blog.status = 1;
    }

    Blog.publish(blog, () => {
        res.json({code: 100100})
    });
});


// 修改博客
router.post('/change', check, (req, res, next) => {

    var user = req.session.user,
        blog = req.body,
        id = blog.id,
        delete_pic_url = blog.org_pic_url,
        author = blog.author || user.name;

    blog.author = author;

    delete blog.org_pic_url;
    delete blog.id;

    if (delete_pic_url && delete_pic_url !== '/public/images/blog/u2091.jpg') {

        delete_pic_url = '.' + delete_pic_url;

        // console.log(delete_pic_url);

        Blog.getAllPicUrls((pic_urls) => {

            let length = 0;

            pic_urls.forEach((el) => {
                if ('.' + el.pic_url === delete_pic_url) {

                    length++;
                }
            });

            // console.log(length);

            if (length > 1) {
                Blog.editBlog(id, blog, () => {
                    res.json({code: 100100})
                });

            } else {
                Blog.deleteBlogPic(delete_pic_url, () => {
                    Blog.editBlog(id, blog, () => {
                        res.json({code: 100100})
                    });
                })
            }
        });
    } else {
        Blog.editBlog(id, blog, () => {
            res.json({code: 100100})
        });
    }
});

module.exports = router;
