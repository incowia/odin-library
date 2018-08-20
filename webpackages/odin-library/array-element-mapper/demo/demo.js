var examples = {
	data: [{
			foo: 'boo1',
			foo2: 'boo2',
			a1: {
				type: 'number',
				value: 1
			},
			b: ['3'],
			c: ['4']
		}, {
			foo: 'boo3',
			foo2: 'boo4',
			s2: {
				type: 'number',
				value: 2
			},
			b: ['3'],
			c: ['4']
		}, {
			foo: 'boo5',
			foo2: 'boo6',
			b3: {
				type: 'number',
				value: 3
			},
			b: ['3'],
			c: ['4']
		}
	],
	objectTuples: {
		mapToObjects: true,
		mapToTuples: true,
		mappings: [{
				src: ['foo2'],
				target: 'mappedByPath'
			}, {
				src: '/foo',
				target: 'mappedByJsonPointer'
			}, {
				src: ['/^[a-zA-Z]\\d$/', 'value'],
				target: 'mappedByPathWithRegExp'
			}, {
				src: {
					path: ['b', 0],
					parse: 'number'
				},
				target: 'mappedByArrayIndexWithParse'
			}, {
				src: {
					path: '/c/0',
					parse: 'number'
				},
				target: 'mappedByJsonPointerWithParse'
			}
		]
	},
	arrayTuples: {
		mapToObjects: false,
		mapToTuples: true,
		mappings: [{
				src: ['foo2'],
				target: 0
			}, {
				src: '/foo',
				target: 1
			}, {
				src: ['/^[a-zA-Z]\\d$/', 'value'],
				target: 2
			}, {
				src: {
					path: ['b', 0],
					parse: 'number'
				},
				target: 3
			}, {
				src: {
					path: '/c/0',
					parse: 'number'
				},
				target: 4
			}
		]
	},
	objectSeries: {
		mapToObjects: true,
		mapToTuples: false,
		mappings: [{
				src: ['foo2'],
				target: 'mappedByPath'
			}, {
				src: '/foo',
				target: 'mappedByJsonPointer'
			}, {
				src: ['/^[a-zA-Z]\\d$/', 'value'],
				target: 'mappedByPathWithRegExp'
			}, {
				src: {
					path: ['b', 0],
					parse: 'number'
				},
				target: 'mappedByArrayIndexWithParse'
			}, {
				src: {
					path: '/c/0',
					parse: 'number'
				},
				target: 'mappedByJsonPointerWithParse'
			}
		]
	},
	arraySeries: {
		mapToObjects: false,
		mapToTuples: false,
		mappings: [{
				src: ['foo2'],
				target: 0
			}, {
				src: '/foo',
				target: 1
			}, {
				src: ['/^[a-zA-Z]\\d$/', 'value'],
				target: 2
			}, {
				src: {
					path: ['b', 0],
					parse: 'number'
				},
				target: 3
			}, {
				src: {
					path: '/c/0',
					parse: 'number'
				},
				target: 4
			}
		]
	}
};

function initData() {
	document.querySelector('#dataIn').value = JSON.stringify(examples.data);
	loadObjectTuples();
}

function loadObjectTuples() {
	document.querySelector('#config').value = JSON.stringify(examples.objectTuples);
}

function loadArrayTuples() {
	document.querySelector('#config').value = JSON.stringify(examples.arrayTuples);
}

function loadObjectSeries() {
	document.querySelector('#config').value = JSON.stringify(examples.objectSeries);
}

function loadArraySeries() {
	document.querySelector('#config').value = JSON.stringify(examples.arraySeries);
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
	var config;
	try {
		config = JSON.parse(configElement.value);
	} catch (err) {
		alert('Config does not contain valid json.');
		return;
	}
	// transfer data to component
	var mapper = document.querySelector('array-element-mapper');
	mapper.setConfig(config);
	mapper.setDataIn(data);
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
