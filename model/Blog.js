"use strict";

let db = require('./db');
let moment = require('moment');
let fs = require('fs');
let async = require('async');

// 增

let publish = (blog, cb) => {
    blog.pub_date = moment().format('YYYY-MM-DD HH:mm:ss');
    db.insert('insert into blog set ?', blog, cb);
};

// **************查******************

// 查找所有博客
let findAll = (cb) => {
    db.query('select * from blog', cb)
};

let findLength = (cb) => {
    db.query('select count(*) as length from blog where status = 1',cb);
};

let findWithLimit = (limit, cb) => {
    db.query('select * from blog where status=1 limit'+limit[0]+','+limit[1], cb);
};

// 查找加载到主页的博客列表
let findForIndex = (limit, cb) => {
    let sql = db.queryMaker('blog', 'status', ['id','pub_date','author','title','read_quality','tag','pic_url','intro','site_classify'], limit, ['order by pub_date desc']);
    db.query(sql, 1, cb);
};

// 根据标签查询
let findByTag = (tag, cb) => {
    let sql = db.queryMaker('blog', ['tag', 'status'],'*',null,['order by pub_date desc']);
    db.query(sql, [tag, 1], cb);
};

// 根据站内分类查询
let findByType = (type, cb) => {
    let sql = db.queryMaker('blog', ['site_classify', 'status'],['id','pub_date','author','title','read_quality','tag','pic_url','intro'],null,['order by pub_date desc']);
    db.query(sql, [type, 1], cb);
};

let findLatestNews = (cb) => {
    db.query("select id,pub_date,author,title,read_quality,tag,pic_url,intro from blog where site_classify=3 and tag='动态' and status=1 order by pub_date desc",cb);
};

// 根据分类查询技术博客
let findTechByType = (innerClassify, cb) => {
    let sql = db.queryMaker('blog', ['site_classify','inner_classify','status'],['id','pub_date','author','title','read_quality','tag','pic_url','intro'],null,['order by pub_date desc']);
    db.query(sql, [1, innerClassify, 1], cb);
};


let findById = (id, cb) => {
    db.query('select * from blog where id = ?', [id], cb);
};

let findUncheckedBlogs = (cb) => {
    db.query('select * from blog where status = 0', cb);
};

let orderByReadQuality = (type, limit, orderingField, orderType, fields, cb) => {

    var fields_str = '*';

    limit = limit || [0, 9999999];

    if (orderType === 'lowToHigh') {
        orderType = 'asc'
    } else {
        orderType = 'desc'
    }

    if (fields && fields.constructor == Array) {
        fields_str = fields.join(',')
    } else if (fields) {
        fields_str = fields
    }

    db.query('select ' + fields_str + ' from blog where site_classify=? and status=1 order by ' + orderingField + ' ' + orderType + ' limit ?,?', [type, limit[0], limit[1]], cb)
};

// 动态查询
let flexQuery = (data, cb) => {

    let sql,
        query,
        value,
        order = data.order || 'pub_date';

    for (var i in data) {
        if (data.hasOwnProperty(i) && i !== 'order') {
            query = i;
            value = data[i]
        }
    }

    if(!query){
        query = 'status';
        value = 1;
    }

    if(query === 'tag' || query === 'author' || query === 'title'){

        console.log(value);

        if(/--|or.+=.+/g.test(value)){
            cb('sqlInject');
            return;
        }else if(/<script>|<\/script>|<img>|<\/img>/g.test(value)){
            cb('xss');
            return;
        }

        sql = db.queryMaker('blog', query, '*', null, 'order by ' + order + ' desc').replace('?', "'%"+value+"%'").replace('=','like ');
        db.query(sql, cb);
    }else{
        sql = db.queryMaker('blog', query, '*', null, 'order by ' + order + ' desc');
        db.query(sql, value, cb);
    }
};

let getSiteClassifyLength = (cb) => {
    async.series({
        tech:(cb) => {
            db.query('select count(*) as length from blog where site_classify = ? and status=1',1,(record) => {
                cb(null, record[0].length);
            })
        },
        theo:(cb) => {
            db.query('select count(*) as length from blog where site_classify = ? and status=1',2,(record) => {
                cb(null, record[0].length);
            })
        },
        life:(cb) => {
            db.query('select count(*) as length from blog where site_classify = ? and status=1',3,(record) => {
                cb(null, record[0].length);
            })
        }
    }, (err, record) => {
        console.log(record);
        cb(record);
    })
};

let incGood = (id, cb) => {
    db.update('update blog set good_amount = good_amount+1 where id = ?',id, cb);
};

let findPreAndNext = (id, cb) => {
    async.series({
        pre:(cb) => {
            db.query('select id,title from blog  where id<? and status=?',[id,1],(record) => {
                record.sort((a,b) => {
                    return b.id - a.id;
                });
                // console.log(record[0].id);
                cb(null, record[0]);
            })
        },
        next:(cb) => {
            db.query('select id,title from blog  where id>? and status=? limit 1',[id,1],(record) => {
                record.sort((a,b) => {
                    return a.id - b.id;
                });
                // console.log(record[0].id);
                cb(null, record[0]);
            })
        }
    }, (err, record) => {
        cb(record);
    })
};

// 查询相关博客
let findRelateBlogs = (site_classify, inner_classify, tag, cb) => {
    db.query('select count(*) as length from blog where tag = ? and status=1', tag, (record) => {
        let length = record[0].length;
        if(length < 5){
            db.query('select count(*) as length from blog where inner_classify = ? and status=1', inner_classify, (record) => {
                let length = record[0].length;
                if(length < 5){
                    db.query('select title,id from blog where site_classify = ? and status=1 limit 0,6', site_classify, (records) => {
                        cb(records);
                    });
                }else{
                    db.query('select title,id from blog where inner_classify = ? and status=1 limit 0,6', inner_classify, (records) => {
                        cb(records);
                    });
                }
            });
        }else{
            db.query('select title,id from blog where tag = ? and status=1 limit 0,6', tag, (records) => {
                cb(records);
            });
        }
    });
};

let getAllPicUrls = (cb) => {
    db.query('select pic_url from blog', (pic_urls) => {
        cb(pic_urls);
    });
};

// 改

let inc = (id, cb) => {
    db.update('update blog set read_quality = read_quality+1  where id = ?', [id], cb)
};

let pass = (id, cb) => {
    db.update('update blog set status = 1 where id = ?', [id], cb);
};

let editBlog = (id, info, cb) => {
    db.update('update blog set ? where id = ?', [info, id], cb);
};

// 删除

let deleteById = (id, cb) => {
    db.delete('delete from blog where id = ?', [id], cb)
};

let deleteBlogPic = (url, cb) => {
    fs.unlink(url, function (err) {
        if (err) {
            console.log(err)
        }
        cb();
    })
};



exports.findAll = findAll;
exports.publish = publish;
exports.findByType = findByType;
exports.findById = findById;
exports.orderByReadQuality = orderByReadQuality;
exports.inc = inc;
exports.deleteById = deleteById;
exports.deleteBlogPic = deleteBlogPic;
exports.findUncheckedBlogs = findUncheckedBlogs;
exports.pass = pass;
exports.findForIndex = findForIndex;
exports.findByTag = findByTag;
exports.editBlog = editBlog;
exports.findTechByType = findTechByType;
exports.flexQuery = flexQuery;
exports.getSiteClassifyLength = getSiteClassifyLength;
exports.incGood = incGood;
exports.findRelateBlogs = findRelateBlogs;
exports.findPreAndNext = findPreAndNext;
exports.findLength = findLength;
exports.findWithLimit = findWithLimit;
exports.getAllPicUrls = getAllPicUrls;
exports.findLatestNews = findLatestNews;