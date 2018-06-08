var examples = {
	fixedMarkers: {
		data: [],
		config: {
			wrapperClass: 'foo',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.PositronNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					lat: 52.50722,
					lng: 13.14583,
					title: 'Berlin',
					alt: 'Berlin'
				}, {
					lat: 53.56528,
					lng: 10.00139,
					title: 'Hamburg',
					alt: 'Hamburg'
				}
			]
		}
	},
	dataMarkers: {
		data: [{
				lat: 52.50722,
				long: 13.14583,
				name: 'Berlin'
			}, {
				lat: 53.56528,
				long: 10.00139,
				name: 'Hamburg'
			},
			{
				"lat":48.58392,
				"long":7.74553,
				"name":"Strasbourg"
			}
		],
		config: {
			wrapperClass: 'foo',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					dataPath: '', // points to root
					lat: ['lat'],
					lng: ['long'],
					title: '/name',
					alt: '/name',
					draggable: false
				}, {
					lat: 50.68127839,
					lng: 10.9305529,
					title: 'incowia GmbH',
					alt: 'incowia GmbH'
				}
			]
		}
	},
	geoJson: {
		data: 'us_states_population_density.json',
		config: {
			wrapperClass: 'foo',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: -100
			},
			zoom: 3,
			minZoom: 2,
			maxZoom: 4,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}
			],
			geoJsonLayers: [{
					dataPath: '', // points to root
					style: {
						fillColor: 'white',
						weight: 1,
						opacity: 1,
						color: 'black',
						dashArray: '3',
						fillOpacity: 0.8
					},
					attribution: 'GeoJSON data shared by <a href="https://bl.ocks.org/mbostock">Mike Bostock</a>'
				}
			]
		}
	},
	choropleth: {
		data: 'us_states_population_density.json',
		config: {
			wrapperClass: 'foo',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: -100
			},
			zoom: 3,
			minZoom: 2,
			maxZoom: 4,
			tileLayers: [{
					provider: 'CartoDB.PositronNoLabels'
				}
			],
			geoJsonLayers: [{
					dataPath: '', // points to root
					choropleth: {
						valueProperty: 'density',
						mode: 'quantile',
						steps: 10,
						colors: ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']
					},
					style: {
						weight: 1,
						opacity: 1,
						color: 'black',
						dashArray: '3',
						fillOpacity: 0.8
					},
					attribution: 'GeoJSON data shared by <a href="https://bl.ocks.org/mbostock">Mike Bostock</a>, Population data &copy; <a href="http://census.gov/">US Census Bureau</a>'
				}
			]
		}
	},
	markersWithPopupsText: {
		data: [{
				lat: 52.50722,
				long: 13.14583,
				name: 'Berlin'
			}, {
				lat: 53.56528,
				long: 10.00139,
				name: 'Hamburg'
			}
		],
		config: {
			wrapperClass: 'foo-map',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					dataPath: '', // points to root
					lat: ['lat'],
					lng: ['long'],
					title: '/name',
					alt: '/name',
					draggable: false,
					popup: {
						title: '/name',
						content: 'This is the popup content.'
					}
				}, {
					lat: 50.68127839,
					lng: 10.9305529,
					title: 'incowia GmbH',
					alt: 'incowia GmbH',
					popup: {
						content: 'Here is incowia GmbH.'
					}
				}
			]
		}
	},
	markersWithPopupsPlaintext: {
		data: [{
				lat: 52.50722,
				long: 13.14583,
				name: 'Berlin',
				data: 'This is Berlin.'
			}, {
				lat: 53.56528,
				long: 10.00139,
				name: 'Hamburg',
				data: 'This is Hamburg.'
			}
		],
		config: {
			wrapperClass: 'foo-map',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					dataPath: '', // points to root
					lat: ['lat'],
					lng: ['long'],
					title: '/name',
					alt: '/name',
					draggable: false,
					popup: {
						title: '/name',
						content: {
							dataPath: '/data',
							component: {
								view: 'plaintext',
								config: {
									space: '2',
									wrapperClass: 'foo-plaintext',
									preClass: 'boo'
								}
							}
						}
					}
				}, {
					lat: 50.68127839,
					lng: 10.9305529,
					title: 'incowia GmbH',
					alt: 'incowia GmbH',
					popup: {
						content: 'Here is incowia GmbH.'
					}
				}
			]
		}
	},
	markersWithPopupsTable: {
		data: [{
				lat: 52.50722,
				long: 13.14583,
				name: 'Berlin',
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
				]
			}, {
				lat: 53.56528,
				long: 10.00139,
				name: 'Hamburg',
				data: [{
						a: 'foo3',
						b: 'foo2',
						c: 'foo1'
					}, {
						a: 'bar3',
						b: 'bar2',
						c: 'bar1'
					}, {
						a: 'foobar3',
						b: 'foobar2',
						c: 'foobar1'
					}
				]
			}
		],
		config: {
			wrapperClass: 'foo-map',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					dataPath: '', // points to root
					lat: ['lat'],
					lng: ['long'],
					title: '/name',
					alt: '/name',
					draggable: false,
					popup: {
						title: '/name',
						minWidth: 135,
						maxWidth: 200,
						content: {
							dataPath: '/data',
							component: {
								view: 'table',
								config: {
									elementsAreObjects: true,
									dataContainsTupels: true,
									wrapperClass: 'foo-table',
									tableClass: 'bar',
									showRowNumbers: true,
									header: [{
											name: 'second',
											key: 'a'
										}, {
											name: 'first',
											key: 'b'
										}
									]
								}
							}
						}
					}
				}, {
					lat: 50.68127839,
					lng: 10.9305529,
					title: 'incowia GmbH',
					alt: 'incowia GmbH',
					popup: {
						content: 'Here is incowia GmbH.'
					}
				}
			]
		}
	},
	markersWithPopupsChart: {
		data: [{
				lat: 52.50722,
				long: 13.14583,
				name: 'Berlin',
				data: {
					a: [1, 4, 7],
					x1: [1, 2, 3],
					b: [3, 6, 9],
					x2: [2, 3, 4]
				}
			}, {
				lat: 53.56528,
				long: 10.00139,
				name: 'Hamburg',
				data: {
					a: [4,7],
					x1: [3,4],
					b: [1,3,6],
					x2: [2,3,4]
				}
			}
		],
		config: {
			wrapperClass: 'foo-map',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					dataPath: '', // points to root
					lat: ['lat'],
					lng: ['long'],
					title: '/name',
					alt: '/name',
					draggable: false,
					popup: {
						title: '/name',
						content: {
							dataPath: '/data',
							component: {
								view: 'chart',
								config: {
									elementsAreObjects: true,
									dataContainsTupels: false,
									wrapperClass: 'foo-chart',
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
										size: {
											width: 300,
											height: 150
										},
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
							}
						}
					}
				}, {
					lat: 50.68127839,
					lng: 10.9305529,
					title: 'incowia GmbH',
					alt: 'incowia GmbH',
					popup: {
						content: 'Here is incowia GmbH.'
					}
				}
			]
		}
	},
	markersWithPopupsError: {
		data: [{
				lat: 52.50722,
				long: 13.14583,
				name: 'Berlin',
				data: 'This is Berlin.'
			}, {
				lat: 53.56528,
				long: 10.00139,
				name: 'Hamburg',
				data: 'This is Hamburg.'
			}
		],
		config: {
			wrapperClass: 'foo-map',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: 10
			},
			zoom: 5,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}, {
					url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
					maxZoom: 19,
					attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>'
				}
			],
			markerLayers: [{
					dataPath: '', // points to root
					lat: ['lat'],
					lng: ['long'],
					title: '/name',
					alt: '/name',
					draggable: false,
					popup: {
						title: '/name',
						content: {
							dataPath: '/data',
							component: {
								view: 'plaintext',
								config: {
									wrapperClass: 333
								}
							}
						}
					}
				}, {
					lat: 50.68127839,
					lng: 10.9305529,
					title: 'incowia GmbH',
					alt: 'incowia GmbH',
					popup: {
						content: 'Here is incowia GmbH.'
					}
				}
			]
		}
	},
	geoJsonWithPopup: {
		data: 'us_states_population_density.json',
		config: {
			wrapperClass: 'foo',
			size: {
				width: '100%',
				height: '600px'
			},
			center: {
				lat: 55,
				lng: -100
			},
			zoom: 3,
			minZoom: 2,
			maxZoom: 4,
			tileLayers: [{
					provider: 'CartoDB.DarkMatterNoLabels'
				}
			],
			geoJsonLayers: [{
					dataPath: '', // points to root
					popup: {
						title: '/properties/name',
						content: {
							dataPath: '/properties/density',
							component: {
								view: 'plaintext',
								config: {
									space: '2',
									wrapperClass: 'foo-plaintext',
									preClass: 'boo'
								}
							}
						}
					},
					style: {
						fillColor: 'white',
						weight: 1,
						opacity: 1,
						color: 'black',
						dashArray: '3',
						fillOpacity: 0.8
					},
					attribution: 'GeoJSON data shared by <a href="https://bl.ocks.org/mbostock">Mike Bostock</a>, Population data &copy; <a href="http://census.gov/">US Census Bureau</a>'
				}
			]
		}
	}
};

function initData() {
	fixedMarkers();
}

function fixedMarkers() {
	document.querySelector('#data').value = JSON.stringify(examples.fixedMarkers.data);
	document.querySelector('#config').value = JSON.stringify(examples.fixedMarkers.config);
}

function dataMarkers() {
	document.querySelector('#data').value = JSON.stringify(examples.dataMarkers.data);
	document.querySelector('#config').value = JSON.stringify(examples.dataMarkers.config);
}

function loadGeoJson() {
	document.querySelector('#data').value = 'Receiving data ...';
	document.querySelector('#config').value = 'Receiving data ...';
	function reqListener() {
		examples.geoJson.remoteData = JSON.parse(this.responseText);
		document.querySelector('#data').value = JSON.stringify(examples.geoJson.remoteData);
		document.querySelector('#config').value = JSON.stringify(examples.geoJson.config);
	}
	var oReq = new XMLHttpRequest();
	oReq.addEventListener('load', reqListener);
	oReq.open('GET', examples.geoJson.data);
	oReq.send();
}

function loadChoropleth() {
	document.querySelector('#data').value = 'Receiving data ...';
	document.querySelector('#config').value = 'Receiving data ...';
	function reqListener() {
		examples.choropleth.remoteData = JSON.parse(this.responseText);
		document.querySelector('#data').value = JSON.stringify(examples.choropleth.remoteData);
		document.querySelector('#config').value = JSON.stringify(examples.choropleth.config);
	}
	var oReq = new XMLHttpRequest();
	oReq.addEventListener('load', reqListener);
	oReq.open('GET', examples.choropleth.data);
	oReq.send();
}

function markersWithPopupsText() {
	document.querySelector('#data').value = JSON.stringify(examples.markersWithPopupsText.data);
	document.querySelector('#config').value = JSON.stringify(examples.markersWithPopupsText.config);
}

function markersWithPopupsPlaintext() {
	document.querySelector('#data').value = JSON.stringify(examples.markersWithPopupsPlaintext.data);
	document.querySelector('#config').value = JSON.stringify(examples.markersWithPopupsPlaintext.config);
}

function markersWithPopupsTable() {
	document.querySelector('#data').value = JSON.stringify(examples.markersWithPopupsTable.data);
	document.querySelector('#config').value = JSON.stringify(examples.markersWithPopupsTable.config);
}

function markersWithPopupsChart() {
	document.querySelector('#data').value = JSON.stringify(examples.markersWithPopupsChart.data);
	document.querySelector('#config').value = JSON.stringify(examples.markersWithPopupsChart.config);
}

function markersWithPopupsError() {
	document.querySelector('#data').value = JSON.stringify(examples.markersWithPopupsError.data);
	document.querySelector('#config').value = JSON.stringify(examples.markersWithPopupsError.config);
}

function geoJsonWithPopup() {
	document.querySelector('#data').value = 'Receiving data ...';
	document.querySelector('#config').value = 'Receiving data ...';
	function reqListener() {
		examples.geoJsonWithPopup.remoteData = JSON.parse(this.responseText);
		document.querySelector('#data').value = JSON.stringify(examples.geoJsonWithPopup.remoteData);
		document.querySelector('#config').value = JSON.stringify(examples.geoJsonWithPopup.config);
	}
	var oReq = new XMLHttpRequest();
	oReq.addEventListener('load', reqListener);
	oReq.open('GET', examples.geoJsonWithPopup.data);
	oReq.send();
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
	var view = document.querySelector('maplayer-view');
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
