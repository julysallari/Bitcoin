var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/v1/nodes', function(req, res, next) {
	if (req.app.get('nodes')) {
		res.send(JSON.stringify(req.app.get('nodes').nodes));
	} else {
		res.send('{}')
	}
});

module.exports = router;