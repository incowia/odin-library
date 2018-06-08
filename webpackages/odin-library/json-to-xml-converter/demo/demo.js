
var examples = {
	data: {
		"bookstore": {
			"book": [{
					"title": "Everyday Italian",
					"author": {
						"#text": "Giada De Laurentiis",
						"#attr": {
							"@_id": "name",
							"@_age": 50,
							"@_place": "States"
						}
					},
					"year": {
						"#text": "\\cdata2005",
						"#cdata": " year "
					}
				}, {
					"title": "Everyday English",
					"author": {
						"#text": "Some author",
						"#attr": {
							"@_id": "name",
							"@_age": 10,
							"@_place": "States"
						}
					},
					"year": {
						"#text": "\\cdata1970",
						"#cdata": " year "
					}
				}
			]
		}
	},
	allOptions: {
		attributeNamePrefix: '@_',
		attrNodeName: '#attr',
		textNodeName: '#text',
		ignoreAttributes: false,
		cdataTagName: '#cdata',
		cdataPositionChar: '\\cdata',
		format: true,
		indentBy: '\t',
		supressEmptyNode: false
	}
};

function initData() {
	document.querySelector('#dataIn').innerHTML = JSON.stringify(examples.data);
	loadAllOptions();
}

function loadAllOptions() {
	document.querySelector('#config').innerHTML = JSON.stringify(examples.allOptions);
}

function triggerMapping() {
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
	// config is optional
	var config;
	try {
		var configValue = configElement.value.trim();
		if (configValue) {
			config = JSON.parse(configValue);
		}
	} catch (err) {
		alert('Config does not contain valid json.');
		return;
	}
	//transfer data to slot of box
	var converter = document.querySelector('json-to-xml-converter');
	converter.setDataIn(data);
	converter.setConfig(config);
}

document.addEventListener('cifReady', function () {
	document.querySelector('button').disabled = false;
	document.body.addEventListener('cifModelChange', function (evt) {
		console.log(evt);
		if (evt.detail.slot === 'dataOut') {
			var dataOut = evt.detail.payload;
			var d = document.createElement('div');
			var t = document.createTextNode(dataOut);
			d.appendChild(t);
			document.querySelector('#dataOut').innerHTML = '<pre>' + d.innerHTML + '</pre>';
			document.querySelector('#error').innerHTML = '';
		}
		if (evt.detail.slot === 'error') {
			document.querySelector('#error').innerHTML = '<pre>' + JSON.stringify(evt.detail.payload, null, 2) + '</pre>';
			document.querySelector('#dataOut').innerHTML = '';
		}
	});
});
