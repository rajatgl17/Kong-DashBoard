var raw_data = {};
var kong_url = {
	"staging":"http://10.19.0.45:8001/",
	"production":"http://10.19.10.236:8001/"
};
var operation = {
	"apis":["apis/", 1],
	"consumers":["consumers/", 1],
	"plugins":["plugins/", 1],
	"oauth2":["oauth2/", 1],
	"p4a":["apis/{}/plugins/", 1],
	"k4c":["consumers/{}/key-auth", 1],
	"keys":["consumers/", 2, "consumers/{}/key-auth"]
}

$('#button').click(function(){
	$('#raw').html('Please wait ...');
	var base_url = kong_url[$('#url').find(":selected").val()];
	var selected_op = $('#operation').find(":selected").val();
	if(operation[selected_op][1] == 1){
		var op_url = operation[selected_op][0];
		if(op_url.includes('{}')){
			op_url = op_url.replace('{}', $('#field').val());
		}
		var url = base_url + op_url;
		call(url, false);
		print();
	} else if(operation[selected_op][1] == 2){
		var op_url = operation[selected_op][0];
		var url = base_url + op_url;
		call(url, false);
		var ids = [];
		raw_data['data'].forEach(function(res){
			ids.push(res['id']);
		});
		raw_data['data'] = [];
		ids.forEach(function(id){
			url = base_url + operation[selected_op][2].replace('{}', id);
			call(url, true);
		});
		print();
	}
});

function call(url, recursive){
	return $.ajax({
		url : url,
		type : "GET",
		async: false,
		success : function(data){
			if(!recursive){
				raw_data['total'] = data['total'];
				raw_data['data'] = data['data'];
			} else {
				data['data'].forEach(function(res){
					raw_data['data'].push(res);
				});
			}
			if(data.hasOwnProperty('next')){
				call(data['next'], true);
			}
			return;
		},
		error: function(data){
			$('#raw').html(JSON.stringify(data, null, 5));
			return;
		}
	});
}

function print(){
	$('#raw').html('');
	if(!raw_data)
		return;
	var count = 1;
	$('#raw').append('<b>Total : ' + raw_data['total'] + '</b><br><br>');
	raw_data["data"].forEach(function(res){				
		$('#raw').append('<br>--------------------------');
		$('#raw').append('----------------------<br><br>');
		$('#raw').append(count + ' -> ' +JSON.stringify(res, null, 5));
		count++;
	});
}