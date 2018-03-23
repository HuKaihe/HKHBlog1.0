"use strict";

let express = require('express');
let router = express.Router();
let Blog = require('../model/Blog');
let Admin = require('../model/admin');
let upload = require('../model/upload');
let check = require('../model/rightCheck');
var async = require('async');

router.get('/gettag', (req, res) => {
    var tag = req.query.tag;
    Blog.findByTag(tag, (blogs) => {
        res.json(blogs);
    });
});

router.get('/flex', (req, res) => {
    Blog.flexQuery(req.query, (blogs) => {
        res.json(blogs);
    });
});

module.exports = router;
