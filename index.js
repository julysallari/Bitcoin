var p2p = require('bitcore-p2p');
var Peer = require('bitcore-p2p').Peer;
var Networks = require('bitcore-lib').Networks;
require('events').EventEmitter.defaultMaxListeners = Infinity;

NODE_TLS_REJECT_UNAUTHORIZED=0
var Pool = p2p.Pool;
var Messages = p2p.Messages;

var nodes = {};

discover();

function discover() {
	var pool = new Pool(Networks.livenet);
	pool.connect();
	pool.on('peerinv', function(peer, message){
		getInfoFromPeer(peer);
	});
}

function getInfoFromIp(ip) {
	var peer = new Peer({host: ip});
}

function getInfoFromPeer(peer) {
	peer.on('ready', function(){
		nodes[peer.host] = {version: peer.version, updated: new Date()};
		console.log("UPDATING NODES\n---------------------------------\n" + JSON.stringify(nodes));
	});
	peer.on('addr', function(info){
		// console.log(JSON.stringify(info));
		// if (nodes[peer.host]) {
		// 	nodes[peer.host]['addresses'] = info.addresses;
		// }
		peer.disconnect();
		info.addresses.forEach(function(addr) {
			// pool._connectPeer(addr.ip.v4)
			if (!nodes[peer.host] || shouldUpdateNode(peer.host)) {
				console.log("Updating node: " + addr.ip.v4)
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

function shouldUpdateNode(ip) {
	var timeDiff = Math.abs(new Date().getTime() - nodes[ip].updated.getTime());
	console.log("Called should update node. Returning " + (timeDiff / 1000) * 60 > 5 + " with diff:" + (timeDiff / 1000) * 60);
	return (timeDiff / 1000) * 60 > 5;
}