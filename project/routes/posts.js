var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');

var url = 'mongodb://localhost/4770TeamProject';

var Post = require('../models/post');

router.get('/', function(req, res){
	res.render('index');
});

router.post('/post', function(req, res){
	var text = req.body.postField;
	var date = Post.getCurrentDate();
	var image = 0;
	var userId = req.user.id;
	var author = req.user.name;
	req.checkBody('postField', 'Post must not be empty').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('index',{
			errors:errors
		});
	} else {
		var newPost = new Post({
			userId: userId,
			author: author,
			text: text,
			date: date,
			image: image,
			visible: 0,
		});

		Post.createPost(newPost, function(err, post){
			if(err) throw err;
			console.log(post);
		});

		req.flash('success_msg', 'Post was posted.');

		res.redirect('/');
	}
});

router.get('/loadPosts', function(req, res, next) {
	var resultArray = [];
	var commentsArray = [];
	mongo.connect(url, function(err, db){
		var cursor = db.collection('posts').find();
		var cursorComments = db.collection('comments').find();
		cursor.forEach(function(doc, err){
			resultArray.push(doc);
		}, function(){
			//db.close();
			//res.render('index', {posts: resultArray});
		});

		cursorComments.forEach(function(doc, err){
			commentsArray.push(doc);
		}, function(){
			db.close();
			res.render('index', {comments: commentsArray, posts:resultArray, myID: req.user.id});
		});

	});
	//res.redirect('/');
});

module.exports = router;
