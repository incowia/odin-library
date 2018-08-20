	var examples = {
	objectTuples: {
		data: [{
				a: 1,
				b: 'first',
				c: 3
			}, {
				a: 4,
				b: 'second',
				c: 6
			}, {
				a: 7,
				b: 'third',
				c: 9
			}, {
				a: 10,
				b: 'fourth',
				c: 12
			}
		],
		config: {
			elementsAreObjects: true,
			dataContainsTuples: true,
			wrapperClass: 'foo',
			dataSeries: [{
					key: 'a',
					name: 'Foo',
					seriesClass: 'seriesFoo'
				}, {
					key: 'c',
					name: 'Bar',
					seriesClass: 'seriesBar'
				}
			],
			c3: {
				data: {
					type: 'line',
					x: 'b',
					empty: {
						label: {
							text: 'No data!'
						}
					}
				},
				axis: {
					x: {
						type: 'category'
					}
				}
			}
		}
	},
	arrayTuples: {
		data: [
			[1, 'first', 3],
			[4, 'second', 6],
			[7, 'third', 9],
			[10, 'fourth', 12]
		],
		config: {
			elementsAreObjects: false,
			dataContainsTuples: true,
			wrapperClass: 'foo',
			dataSeries: [{
					key: 0,
					name: 'Foo',
					seriesClass: 'seriesFoo'
				}, {
					key: 2,
					name: 'Bar',
					seriesClass: 'seriesBar'
				}
			],
			c3: {
				data: {
					type: 'line',
					x: '1',
					empty: {
						label: {
							text: 'No data!'
						}
					}
				},
				axis: {
					x: {
						type: 'category'
					}
				}
			}
		}
	},
	objectSeries: {
		data: {
			a: [1, 4, 7],
			x1: [1, 2, 3],
			b: [3, 6, 9],
			x2: [2, 3, 4]
		},
		config: {
			elementsAreObjects: true,
			dataContainsTuples: false,
			wrapperClass: 'foo',
			dataSeries: [{
					key: 'a',
					name: 'Foo',
					seriesClass: 'seriesFoo'
				}, {
					key: 'b',
					name: 'Bar',
					seriesClass: 'seriesBar'
				}
			],
			c3: {
				data: {
					type: 'line',
					xs: {
						a: 'x1',
						b: 'x2'
					},
					empty: {
						label: {
							text: 'No data!'
						}
					}
				}
			}
		}
	},
	arraySeries: {
		data: [
			[1, 4, 7, 10],
			['first', 'second', 'third', 'fourth'],
			[3, 6, 9, 12]
		],
		config: {
			elementsAreObjects: false,
			dataContainsTuples: false,
			wrapperClass: 'foo',
			dataSeries: [{
					key: 0,
					name: 'Foo',
					seriesClass: 'seriesFoo'
				}, {
					key: 2,
					name: 'Bar',
					seriesClass: 'seriesBar'
				}
			],
			c3: {
				data: {
					type: 'line',
					x: '1',
					empty: {
						label: {
							text: 'No data!'
						}
					}
				},
				axis: {
					x: {
						type: 'category'
					}
				}
			}
		}
	}
};

function initData() {
	loadObjectSeries();
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
	var view = document.querySelector('chart-view');
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
