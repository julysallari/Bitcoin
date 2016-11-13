var UPDATE_FREQUENCY_MINUTES = 20;

//Database initiailzation
var Datastore = require('nedb')
var db = new Datastore({ filename: 'database/database', autoload: true });
db.ensureIndex({ fieldName: 'collection', unique: true }, function (err) {});
db.persistence.setAutocompactionInterval(1000*60);

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
var peers = {};

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

function updateCurrentHosts() {
	for(var k in nodes.nodes) {
		getInfoFromIp(k);
	}
}

function getInfoFromIp(ip) {
	if (shouldUpdateNode(ip)) {
		var peer = new Peer({host: ip});
		getInfoFromPeer(peer);
	}
}

function getInfoFromPeer(peer) {
	peers[peer.host] = {'peer': peer, 'ready': false, 'addr': false};
	peer.on('ready', function(){
		console.log("Updating node info from " + peer.host);
		nodes.nodes[peer.host] = {version: peer.version, updated: new Date()};
		persistNodes();
		peers[peer.host]['ready'] = true;
		tryDisconnectPeer(peer.host);
	});
	peer.on('addr', function(info){
		info.addresses.forEach(function(addr) {
			if (shouldUpdateNode(addr.ip.v4)) {
				getInfoFromIp(addr.ip.v4);
			}
		});
		peers[peer.host]['addr'] = true;
		tryDisconnectPeer(peer.host);
	});
	peer.connect();
	var msg = new Messages;
	peer.sendMessage(msg.GetAddr());
}

function tryDisconnectPeer(ip) {
	if (peers[ip] && peers[ip]['ready'] && peers[ip]['addr'] && peers[ip]['peer'].status != Peer.STATUS.DISCONNECTED) {
		peers[ip].peer.disconnect();
	}
	if (peers[ip] && peers[ip]['peer'].status == Peer.STATUS.DISCONNECTED) {
		delete peers[ip];
	}
}

//Data methods
function shouldUpdateNode(ip) {
	//If already exists an open peer to that ip return false
	if (peers[ip] && peers[ip]['peer'].status != Peer.STATUS.DISCONNECTED) {
		return false;
	}
	//If node does not exists returns true
	if (!nodes.nodes[ip]) {
		return true;
	}
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
		console.log("Nodes database loaded " + JSON.stringify(nodes));
		updateCurrentHosts();
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