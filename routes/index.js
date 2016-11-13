var express = require('express');
var router = express.Router();
var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', { title: "Index" });
});

router.get('/bitnodes', function(req, res, next) {
  	res.render('bitnodes', { title: "Bitnodes" });
});
module.exports = router;
