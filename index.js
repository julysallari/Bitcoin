var p2p = require('bitcore-p2p');
var Pool = p2p.Pool;
var Networks = require('bitcore-lib').Networks;
var Messages = p2p.Messages;

require('events').EventEmitter.defaultMaxListeners = Infinity;

var pool = new Pool(Networks.livenet);

pool.connect();

pool.on('peerinv', function(peer, message){
	console.log(peer.host);
	console.log(peer.version);
	peer.on('ready', function(){
		console.log("ready");
		//var msg = new Messages;
		//peer.sendMessage(msg.GetAddresses());
	});
	/*peer.on('addr', function(info){
		info.addresses.forEach(function(addr){
			pool._connectPeer(addr);
			console.log("address:"+addr.message);
		});
		console.log("info:"+info.addresses.count);
	});*/
	peer.connect();
});
