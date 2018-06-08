var examples = {
	data: '<bookstore>' +
					'<book>' +
						'<title>Everyday Italian</title>' +
						'<author id="name" age="50" place="States">Giada De Laurentiis</author>' +
						'<year><![CDATA[ year ]]>2005</year>' +
					'</book>' +
					'<book>' +
						'<title>Everyday English</title>' +
						'<author id="name" age="10" place="States">Some author</author>' +
						'<year><![CDATA[ year ]]>1970</year>' +
					'</book>' +
				'</bookstore>',
	allOptions: {
		attributeNamePrefix: '@_',
		attrNodeName: '#attr',
		textNodeName: '#text',
		ignoreAttributes: false,
		ignoreNameSpace: false,
		allowBooleanAttributes: false,
		parseNodeValue: true,
		parseAttributeValue: true,
		trimValues: true,
		cdataTagName: '#cdata',
		cdataPositionChar: '\\cdata',
		localeRange: 'a-zA-Z'
	}
};

function initData() {
	document.querySelector('#dataIn').value = JSON.stringify(examples.data);
	loadAllOptions();
}

function loadAllOptions() {
	document.querySelector('#config').value = JSON.stringify(examples.allOptions);
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
	// transfer data to component
	var converter = document.querySelector('xml-to-json-converter');
	converter.setConfig(config);
	converter.setDataIn(data);
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
