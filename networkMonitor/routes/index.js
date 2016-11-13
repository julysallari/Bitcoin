var express = require('express');
var router = express.Router();
var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.app.get('foo'))
	console.log(req.app.get('nodes'))
  	res.render('index', { title: "Index" });
});

module.exports = router;
