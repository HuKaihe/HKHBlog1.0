/*
 Navicat MySQL Data Transfer

 Source Server         : hkhblog
 Source Server Type    : MySQL
 Source Server Version : 50635
 Source Host           : 123.206.88.54
 Source Database       : hkhblognew

 Target Server Type    : MySQL
 Target Server Version : 50635
 File Encoding         : utf-8

 Date: 03/23/2018 11:58:01 AM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `admin`
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL,
  `portrait` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `blog`
-- ----------------------------
DROP TABLE IF EXISTS `blog`;
CREATE TABLE `blog` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(25) NOT NULL DEFAULT '',
  `author` varchar(15) NOT NULL DEFAULT '某某',
  `intro` varchar(150) NOT NULL DEFAULT '' COMMENT '博客简介',
  `pub_date` timestamp NOT NULL,
  `url` varchar(255) DEFAULT '' COMMENT '博客加载有两种方式，一是可以通过url加载html页面，二是可以直接加载到页面',
  `content` text NOT NULL,
  `read_quality` int(10) unsigned NOT NULL DEFAULT '0',
  `good_amount` int(11) NOT NULL,
  `comment_amount` int(11) NOT NULL,
  `pic_url` varchar(255) NOT NULL DEFAULT '\\public\\images\\blog\\u2091.jpg',
  `site_classify` tinyint(1) unsigned zerofill NOT NULL DEFAULT '0' COMMENT '1. 技术小栈 2. 神学研究 3. 心路历程',
  `inner_classify` varchar(255) DEFAULT '默认',
  `tag` varchar(10) NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=329 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `comment`
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `date` date NOT NULL,
  `blog_id` int(11) NOT NULL,
  `reply_obj` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `message`
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` varchar(255) NOT NULL DEFAULT '',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
