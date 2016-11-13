var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/v1/nodes', function(req, res, next) {
	req.app.get('db').findOne({collection:"nodes"}, function (err, data) {
		if (err) {console.log("Find Error " + err);rs.send('Error');}
		if (data) {
			nodes = _updateNodes(data);
		}
		res.setHeader('Content-Type', 'application/json');
		if (nodes) {
			res.send(JSON.stringify(nodes.nodes));
		} else {
			res.send('{}')
		}
	});
});

function _updateNodes(data) {
	var nodes = {_id: data._id, collection:"nodes", nodes: {}};
	for (var k in data.nodes) {
		nodes.nodes[replaceAll(k,'_','.')] = data.nodes[k];
	}
	return nodes;
}

function replaceAll(s1, s2, s3) {
	return s1.split(s2).join(s3);
}

module.exports = router;