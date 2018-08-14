
var examples = {
	objectTuples:
	{
		data: [   //      "a",       "b",       "c",       "d" <-- keys (columns)
			{ "a": 1234, "b": 5432, "c":  235, "d": 6547 }, // 0 <-- indices (rows)
			{ "a": 9876, "b": 5498, "c": 1234, "d": 6547 }, // 1
			{ "a":  754, "b":  234, "c": 5498, "d": 1234 }  // 2
		],
		config: {
			elementsAreObjects: true,
			dataContainsTuples: true
						}
	},
	objectSeries:
	{
		data: {        //   0,    1,    2 <-- indicies (rows)
			"a": [ 1234, 9876,  754 ], // "a" <-- keys (columns)
			"b": [ 5432, 5498,  234 ], // "b"
			"c": [  235, 1234, 5498 ], // "c"
			"d": [ 6547, 6547, 1234 ]  // "d"
		},
		config: {
			elementsAreObjects: true,
			dataContainsTuples: false
						}
	},
	arrayTuples:
	{
		data: [   //   0,    1,    2,    3 <-- inner array indices (columns)
			[ 1234, 5432,  235, 6547 ], // 0 <-- outer array indicies (rows)
			[ 9876, 5498, 1234, 6547 ], // 1
			[  754,  234, 5498, 1234 ]  // 2
		],
		config: {
			elementsAreObjects: false,
			dataContainsTuples: true
		        }
	},
	arraySeries:
	{
		data: [   //   0,    1,    2 <-- inner array indices (rows)
			[ 1234, 9876,  754 ], // 0 <-- outer array indices (columns)
			[ 5432, 5498,  234 ], // 1
			[  235, 1234, 5498 ], // 2
			[ 6547, 6547, 1234 ]  // 3
		],
		config: {
			elementsAreObjects: false,
			dataContainsTuples: false
						}
	}
};





function initData() {
	loadObjectTuples();
}

function loadObjectTuples() {
	document.querySelector('#dataIn').value = JSON.stringify(examples.objectTuples.data);
	document.querySelector('#config').value = JSON.stringify(examples.objectTuples.config);
}

function loadObjectSeries() {
	document.querySelector('#dataIn').value = JSON.stringify(examples.objectSeries.data);
	document.querySelector('#config').value = JSON.stringify(examples.objectSeries.config);
}

function loadArrayTuples() {
	document.querySelector('#dataIn').value = JSON.stringify(examples.arrayTuples.data);
	document.querySelector('#config').value = JSON.stringify(examples.arrayTuples.config);
}

function loadArraySeries() {
	document.querySelector('#dataIn').value = JSON.stringify(examples.arraySeries.data);
	document.querySelector('#config').value = JSON.stringify(examples.arraySeries.config);
}

function triggerView() {
	// reset page content
	document.querySelector('#dataOut').innerHTML = '';
	document.querySelector('#error').innerHTML = '';
	// extract data
	var dataElement = document.querySelector('#dataIn');
	var configElement = document.querySelector('#config');
	var data;
	try {
		data = JSON.parse(dataElement.value);
	} catch (err) {
		alert('DataIn does not contain valid json.');
		return;
	}
	var config;
	try {
		config = JSON.parse(configElement.value);
	} catch (err) {
		alert('Config does not contain valid json.');
		return;
	}
	// transfer data to component
	var inverter = document.querySelector('nds-inverter');
	inverter.setConfig(config);
	inverter.setDataIn(data);
}

document.addEventListener('cifReady', function () {
	document.querySelector('button').disabled = false;
	document.body.addEventListener('cifModelChange', function (evt) {
		console.log(evt);
		if (evt.detail.slot === 'dataOut') {
			document.querySelector('#dataOut').innerHTML = '<pre>' + JSON.stringify(evt.detail.payload, null, 2) + '</pre>';
			document.querySelector('#error').innerHTML = '';
		}
		if (evt.detail.slot === 'error') {
			document.querySelector('#error').innerHTML = '<pre>' + JSON.stringify(evt.detail.payload, null, 2) + '</pre>';
			document.querySelector('#dataOut').innerHTML = '';
		}
	});
});
