var UPDATE_FREQUENCY_MINUTES = 20;

//Database initiailzation
var Datastore = require('nedb')
var db = new Datastore({ filename: 'database/database', autoload: true });
db.ensureIndex({ fieldName: 'collection', unique: true }, function (err) {});

//Bitcore initialization
var p2p = require('bitcore-p2p');
var Peer = require('bitcore-p2p').Peer;
var Networks = require('bitcore-lib').Networks;
require('events').EventEmitter.defaultMaxListeners = Infinity;

var Pool = p2p.Pool;
var Messages = p2p.Messages;

//Model structures
var nodes = {};
var dataNodes = {};

//On connection closed exception catch
process.on('uncaughtException', function(err) {
	console.log(err);
});

//Discover methods
function discover() {
	var pool = new Pool(Networks.livenet);
	pool.connect();
	pool.on('peerinv', function(peer, message){
		getInfoFromPeer(peer);
	});
}

function getInfoFromIp(ip) {
	console.log("GetInfoFromIp " + ip);
	var peer = new Peer({host: ip});
	getInfoFromPeer(peer);
}

function getInfoFromPeer(peer) {
	peer.on('ready', function(){
		if (!nodes.nodes[peer.host] || shouldUpdateNode(peer.host)) {
			console.log("Adding peer " + peer.host);
			nodes.nodes[peer.host] = {version: peer.version, updated: new Date()};
			persistNodes();
		}
		//console.log("UPDATING NODES\n---------------------------------\n" + JSON.stringify(nodes));
	});
	peer.on('addr', function(info){
		// console.log(JSON.stringify(info));
		// if (nodes[peer.host]) {
		// 	nodes[peer.host]['addresses'] = info.addresses;
		// }
		// if (peer.status != Peer.STATUS.DISCONNECTED) {
		// 	peer.disconnect();
		// }
		info.addresses.forEach(function(addr) {
			// pool._connectPeer(addr.ip.v4)
			if (!nodes.nodes[addr.ip.v4] || shouldUpdateNode(addr.ip.v4)) {
				getInfoFromIp(addr.ip.v4);
			}
		});
		// info.addresses.forEach(function(addr){
		// 	pool._connectPeer(addr);
		// 	console.log("address:"+addr.message);
		// });
		// console.log("info:"+info.addresses.count);
	});
	var msg = new Messages;
	peer.sendMessage(msg.GetAddr());
	peer.connect();
}

//Data methods
function shouldUpdateNode(ip) {
	var timeDiff = Math.abs(new Date().getTime() - nodes.nodes[ip].updated.getTime());
	return ((timeDiff / 1000) / 60 > UPDATE_FREQUENCY_MINUTES);
}

function persistNodes() {
	dataNodes = _updateDataNodes();
	db.update({_id: dataNodes._id}, dataNodes, function () {});
}

function _updateDataNodes() {
	var dataNodes = {_id: nodes._id, collection:"nodes", nodes: {}};
	for (var k in nodes.nodes) {
		dataNodes.nodes[replaceAll(k,'.','_')] = nodes.nodes[k];
	}
	return dataNodes;
}

function _updateNodes() {
	var nodes = {_id: dataNodes._id, collection:"nodes", nodes: {}};
	for (var k in dataNodes.nodes) {
		nodes.nodes[replaceAll(k,'_','.')] = dataNodes.nodes[k];
	}
	return nodes;
}

function replaceAll(s1, s2, s3) {
	return s1.split(s2).join(s3);
}

//Model initialization
db.findOne({collection:"nodes"}, function (err, data) {
	if (err) {console.log("Find Error " + err);return;}
	if (data) {
		dataNodes = data;
		nodes = _updateNodes();
		console.log("Loading nodes " + JSON.stringify(nodes));
	} else {
		db.insert({collection:"nodes", nodes: {}}, function (err, data) {
			if (err) {console.log("Insert Error " + err);return;}
			dataNodes = data;
			nodes = _updateNodes();
		});
	}
});

//Discover init
discover();