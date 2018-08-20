var examples = {
	objectTuples: {
		data: [{
				a: 'foo1',
				b: 'foo2',
				c: 'foo3'
			}, {
				a: 'bar1',
				b: 'bar2',
				c: 'bar3'
			}, {
				a: 'foobar1',
				b: 'foobar2',
				c: 'foobar3'
			}
		],
		config: {
			elementsAreObjects: true,
			dataContainsTuples: true,
			wrapperClass: 'foo',
			tableClass: 'bar',
			showRowNumbers: true,
			header: [{
					name: 'second',
					key: 'b'
				}, {
					name: 'first',
					key: 'a'
				}
			]
		}
	},
	arrayTuples: {
		data: [
			['foo1', 'foo2', 'foo3'],
			['bar1', 'bar2', 'bar3'],
			['foobar1', 'foobar2', 'foobar3']
		],
		config: {
			elementsAreObjects: false,
			dataContainsTuples: true,
			wrapperClass: 'foo',
			tableClass: 'bar',
			showRowNumbers: true,
			header: [{
					name: 'second',
					key: 1
				}, {
					name: 'first',
					key: 0
				}
			]
		}
	},
	objectSeries: {
		data: {
			a: ['foo1', 'bar1', 'foobar1'],
			b: ['foo2', 'bar2', 'foobar2'],
			c: ['foo3', 'bar3', 'foobar3']
		},
		config: {
			elementsAreObjects: true,
			dataContainsTuples: false,
			wrapperClass: 'foo',
			tableClass: 'bar',
			showRowNumbers: true,
			header: [{
					name: 'second',
					key: 'b'
				}, {
					name: 'first',
					key: 'a'
				}
			]
		}
	},
	arraySeries: {
		data: [
			['foo1', 'bar1', 'foobar1'],
			['foo2', 'bar2', 'foobar2'],
			['foo3', 'bar3', 'foobar3']
		],
		config: {
			elementsAreObjects: false,
			dataContainsTuples: false,
			wrapperClass: 'foo',
			tableClass: 'bar',
			showRowNumbers: true,
			header: [{
					name: 'second',
					key: 1
				}, {
					name: 'first',
					key: 0
				}
			]
		}
	}
};

function initData() {
	loadObjectTuples();
}

function loadObjectTuples() {
	document.querySelector('#data').value = JSON.stringify(examples.objectTuples.data);
	document.querySelector('#config').value = JSON.stringify(examples.objectTuples.config);
}

function loadArrayTuples() {
	document.querySelector('#data').value = JSON.stringify(examples.arrayTuples.data);
	document.querySelector('#config').value = JSON.stringify(examples.arrayTuples.config);
}

function loadObjectSeries() {
	document.querySelector('#data').value = JSON.stringify(examples.objectSeries.data);
	document.querySelector('#config').value = JSON.stringify(examples.objectSeries.config);
}

function loadArraySeries() {
	document.querySelector('#data').value = JSON.stringify(examples.arraySeries.data);
	document.querySelector('#config').value = JSON.stringify(examples.arraySeries.config);
}

function triggerView() {
	// reset page content
	document.querySelector('#error').innerHTML = '';
	// extract data
	var dataElement = document.querySelector('#data');
	var configElement = document.querySelector('#config');
	var data;
	try {
		data = JSON.parse(dataElement.value);
	} catch (err) {
		alert('Data does not contain valid json.');
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
	var view = document.querySelector('table-view');
	view.setConfig(config);
	view.setData(data);
}

document.addEventListener('cifReady', function () {
	document.querySelector('button').disabled = false;
	document.body.addEventListener('cifModelChange', function (evt) {
		console.log(evt);
		if (evt.detail.slot === 'error') {
			document.querySelector('#error').innerHTML = '<pre>' + JSON.stringify(evt.detail.payload, null, 2) + '</pre>';
		}
	});
});
