var colors = ["#ECF0F1", "#3FC380", "#EB9532", "#F89406", "#36D7B7", "#DADFE1", "#D24D57", "#2ABB9B", "#52B3D9", "#90C695", "#4183D7", "#68C3A3", "#F2F1EF", "#6C7A89", "#EF4836", "#EEEEEE", "#D64541", "#E9D460", "#E74C3C", "#C5EFF7", "#E4F1FE", "#03C9A9", "#ABB7B7", "#E87E04", "#E67E22", "#16A085", "#26A65B", "#BDC3C7", "#E26A6A", "#AEA8D3", "#F2784B", "#DCC6E0", "#EB974E", "#F64747", "#F9BF3B", "#19B5FE", "#2ECC71", "#00B16A", "#D35400", "#03A678", "#F9690E", "#9A12B3", "#D2D7D3", "#BF55EC", "#C8F7C5", "#049372", "#86E2D5", "#D2527F", "#66CC99", "#BFBFBF", "#F5AB35", "#4ECDC4", "#6BB9F0", "#26C281", "#E08283", "#81CFE0", "#F4B350", "#1BBC9B", "#87D37C", "#65C6BB", "#ECECEC", "#FDE3A7", "#1BA39C", "#F1A9A0", "#59ABE3", "#F39C12", "#F62459", "#019875", "#BE90D4", "#3498DB", "#F27935", "#A2DED0", "#EC644B", "#95A5A6"];
updateNodes();

function updateNodes() {
	$.ajax({
		method: 'GET',
		url: 'api/v1/nodes',
		success: function (nodesData) {
			initializeGraphs(JSON.parse(nodesData));
		}
	});
}

function initializeGraphs(nodesData) {
	var maxVersionCount = {v:0,count:0};
	var nodes = 0;
	var versions = {};
	for (var k in nodesData) {
		var version = nodesData[k]['version'];
		if (versions[version]) {
			versions[version] = versions[version] + 1;
		} else {
			versions[version] = 1;
		}
	}
	console.log(versions)
	var labels = [];
	var dataValues = [];
	for (var v in versions) {
		labels.push(v);
		var count = versions[v];
		dataValues.push(count);
		nodes += count;
		if (count > maxVersionCount.count) {
			maxVersionCount = {v:v,count:count}
		}
	}
	$('#nodes').text('Total nodes scanned: ' + nodes)
	$('#maxVersionCount').text('Most used version: ' + maxVersionCount.v + ' (' + maxVersionCount.count + ')');
	var data= {
		labels: labels,
		datasets: [{
			data: dataValues,
			backgroundColor: colors
		}]
	}
	var myPieChart = new Chart($('#nodesPieChart'),{
	    type: 'pie',
	    data: data
	});
	var myBarChart = new Chart($('#nodesBarChart'), {
		type: 'bar',
		data: data
	})
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}