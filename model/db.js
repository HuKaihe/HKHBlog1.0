"use strict";

let mysql = require('mysql');
let mysqlInfo = require('../.config.js').mysql;
let pool = mysql.createPool(mysqlInfo);
let insert, _delete, update, query;

/**
 * case支持以下几种情况:
 * 1. "name" 代表字段的单个字符串，此时，关系默认为判等
 * 2. ["name","password"] 字段数组，此时逻辑运算符为“与”，关系默认为判等
 * 3. {'field':'name', relation:'='} 字段条件对象
 * 4. [{'field':'name', relation:'='},{'field':'name', relation:'=',logic:'or'}] 字段数组
 *
 * */
let buildCaseSqlStr = (cases) => {

    let caseStr = '';

    if (!cases) {
        return ''
    }

    // 只有一个条件的时候
    if (!Array.isArray(cases)) {

        // 传递单个字符串
        if (typeof cases === 'string') {
            caseStr += 'where ' + cases + ' =?';
        } else {

            // 传递字段对象
            caseStr += 'where ' + cases.field + ' ' + (cases.relation || '=') + ' ?';
        }

        // console.log(caseStr);
        return caseStr
    }

    // 当条件为数组时
    // 当条件为对象数组时
    if (typeof cases[0] === 'object') {
        cases.forEach((item, index) => {
            if (index === 0) {
                caseStr += 'where ' + item.field + ' ' + (item.relation || '=') + ' ?';
            } else {
                caseStr += ' ' + (item.logic ? item.logic : 'and') + ' ' + item.field + ' ' + (item.relation || '=') + ' ?';
            }

        });
    } else {
        // 当条件为字符串数组时
        cases.forEach((item, index) => {
            if (index === 0) {
                caseStr += 'where ' + item + ' ' + '= ?';
            } else {
                caseStr += ' ' + 'and' + ' ' + item + ' ' + '=?';
            }
        })
    }

    // console.log(caseStr);
    return caseStr;
};

let paramsAnalyser = (cases) => {
    let queryArr = [];
    if (Array.isArray(cases)) {
        cases.forEach((item) => {
            queryArr.push(item.value);
        })
    } else {
        queryArr.push(cases);
    }
    return queryArr;
};
/**
 * 拼接查询的sql语句
 * table 表 字符串||数组
 * cases where条件  字符串||字符串数组||对象||对象数组
 *       对象 field : 字段、relation : 关系（默认=）、logic : 逻辑关系（默认and）
 * value 查找的字段 字符串||数组
 * limit 记录截断 数组 [截断开始，截断结束]
 * extra 其他条件 字符串||数组
 * */
let queryMaker = (table, cases, value, limit, extra) => {
    let tableStr = table.toString(), // 如果是数组直接转化为以,分割的字符串, 否则则为单个字符
        valueStr = value ? value.toString() : '*',
        extraStr = extra ? extra.toString().replace(/,/g, ' ') + ' ' : '', // 其他因素, 以‘ ’分割
        caseStr = buildCaseSqlStr(cases),// 条件从句
        limitStr = limit ? ('limit ' + limit[0] + ', ' + limit[1]) : '',// 限制因素
        sql = `select ${valueStr} from ${tableStr} ${caseStr} ${extraStr} ${limitStr}`;

    // console.log(sql);
    return sql;
};

insert = _delete = update = query = (sql, params, callback) => {

    // 单个参数的情况
    if (typeof params === 'string' || typeof params === 'number' || typeof params === 'boolean') {
        params = [params]
    }

    // 没有第二个参数的情况
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    pool.getConnection(function (err, connection) {
        connection.query(sql, params, function (err, rows) {
            if (err) {
                throw err;// 抛出错误给process处理
            }
            callback(rows);
            connection.release();
        });
    });
};


exports.query = query;
exports.insert = insert;
exports.delete = _delete;
exports.update = update;
exports.paramsAnalyser = paramsAnalyser;
exports.queryMaker = queryMaker;