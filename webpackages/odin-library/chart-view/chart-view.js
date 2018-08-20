// PLEASE NOTE: config options depend on the c3 version (and d3)
// please update all links in the documentation if dependencies change
// affected cubble artifacts: chart-view, c3, d3

/*
 * @class chart-view
 *
 * A view which displays the given data in a chart. Uses [c3.js](http://c3js.org/)
 * and [d3](https://d3js.org/) (as dependency). It supports various chart types including
 * bar, line, area, donut and others.
 *
 * The internal process starts when an input slot changes, but all other input slots
 * must be set with a valid value first. After the value is set, each change will
 * trigger the process with the current changed value of an input slot and with all
 * previously setted values of the other input slots.
 *
 * @synchronization
 * As all views, this one works **synchronously**, but rendering might be
 * **asynchronously**. See `views-synchronization`.
 *
 * @example
 * See [demo page](../chart-view/demo/index.html).
 *
 * @output onViewUpdate : View update object
 * @aka chart-view-onViewUpdate
 * Signals that the internal process of this view has ended successfully (this does not
 * include the rendering process).
 *
 * @method getOnViewUpdate() : View update object; See `chart-view-onViewUpdate` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka chart-view-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `chart-view-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'chart-view',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			},
			chartId: {
				type: String,
				readOnly: true,
				value: function () {
					return 'chart-' + Math.random();
				}
			}
		},

		_chartInstance: null,

		/*
		 * @input config : CV Config Options
		 * @aka chart-view-config
		 * The configuration of this component. It defines how to interprete the incoming
		 * data (`normalized data structure`) and format the chart.
		 *
		 * @method setConfig(config : CV Config Options); See `chart-view-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka CV Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'definitions': {
				'c3extent': {
					'type': 'array',
					'minItems': 2,
					'maxItems': 2,
					'uniqueItems': true,
					'items': odin.validate.schemaPart.positiveInteger
				},
				'c3axisBase': {
					'type': 'object',
					'properties': {
						'show': odin.validate.schemaPart.boolean,
						'tick': {
							'type': 'object',
							'properties': {
								'count': odin.validate.schemaPart.positiveInteger,
								'outer': odin.validate.schemaPart.boolean
							}
						}
					}
				},
				'c3axisBaseX': {
					'allOf': [{
							'$ref': '#/definitions/c3axisBase'
						}, {
							'properties': {
								'max': {
									'type': ['number', 'string']
								},
								'min': {
									'type': ['number', 'string']
								},
								'padding': {
									'type': 'object',
									'properties': {
										'left': odin.validate.schemaPart.integer,
										'right': odin.validate.schemaPart.integer
									}
								},
								'label': {
									'oneOf': [odin.validate.schemaPart.minString, {
											'type': 'object',
											'properties': {
												'text': odin.validate.schemaPart.minString,
												'position': {
													'enum': [
														'inner-right',
														'inner-center',
														'inner-left',
														'outer-right',
														'outer-center',
														'outer-left'
													]
												}
											}
										}
									]
								},
								'tick': {
									'properties': {
										'values': {
											'type': 'array',
											'oneOf': [{
													'items': odin.validate.schemaPart.number
												}, {
													'items': odin.validate.schemaPart.string
												}
											]
										}
									}
								}
							}
						}
					]
				},
				'c3axisBaseY': {
					'allOf': [{
							'$ref': '#/definitions/c3axisBase'
						}, {
							'properties': {
								'max': odin.validate.schemaPart.number,
								'min': odin.validate.schemaPart.number,
								'padding': {
									'type': 'object',
									'properties': {
										'top': odin.validate.schemaPart.integer,
										'bottom': odin.validate.schemaPart.integer
									}
								},
								'label': {
									'oneOf': [odin.validate.schemaPart.minString, {
											'type': 'object',
											'properties': {
												'text': odin.validate.schemaPart.minString,
												'position': {
													'enum': [
														'inner-top',
														'inner-middle',
														'inner-bottom',
														'outer-top',
														'outer-middle',
														'outer-bottom'
													]
												}
											}
										}
									]
								},
								'tick': {
									'properties': {
										'values': {
											'type': 'array',
											'items': odin.validate.schemaPart.number
										}
									}
								}
							}
						}
					]
				},
				'c3axisY': {
					'allOf': [{
							'$ref': '#/definitions/c3axisBaseY'
						}, {
							'properties': {
								'inner': odin.validate.schemaPart.boolean,
								'center': odin.validate.schemaPart.number,
								'inverted': odin.validate.schemaPart.boolean,
								'default': {
									'type': 'array',
									'minItems': 2,
									'maxItems': 2,
									'uniqueItems': true,
									'items': odin.validate.schemaPart.number
								}
							}
						}
					]
				},
				'c3gridBase': {
					'type': 'object',
					'properties': {
						'show': odin.validate.schemaPart.boolean,
						'lines': {
							'type': 'array',
							'minItems': 1,
							'uniqueItems': true,
							'items': {
								'type': 'object',
								'required': ['value'],
								'properties': {
									'value': true,
									'text': odin.validate.schemaPart.minString,
									'class': odin.validate.schemaPart.minString,
									'position': {
										'enum': [
											'start',
											'middle',
											'end'
										]
									}
								}
							}
						}
					}
				}
			},
			'type': 'object',
			'required': ['elementsAreObjects'],
			'properties': {
				// @slotOption elementsAreObjects : Boolean
				// @aka chart-view-config-elementsAreObjects
				// `true` if the resulting data structure is composed of objects,
				// otherwise `false` for arrays. See `normalized data structure` for more details.
				'elementsAreObjects': odin.validate.schemaPart.boolean,
				// @slotOption dataContainsTuples : Boolean = true
				// `true` if the resulting data structure is composed of data tuples,
				// otherwise `false` for data series. See `normalized data structure` for more details.
				'dataContainsTuples': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption wrapperClass : String
				// A css class name that can be used as selector for the entire component.
				'wrapperClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption dataSeries : DataSeries[]
				// An array of `DataSeries` elements, with each element defining a visible series for the chart.
				// Each definition must be unique.
				'dataSeries': {
					'type': 'array',
					'uniqueItems': true,
					'minItems': 1,
					'items': {
						'type': 'object',
						'required': ['key'],
						'properties': {
							// @section DataSeries object
							// @aka DataSeries
							// @aka DataSeries[]
							// A DataSeries object defines a series for the chart.
							'key': true,
							// @slotOption name : String
							// The name of the series. Will be used as display name.
							'name': odin.validate.schemaPart.string,
							// @slotOption seriesClass : String
							// A css class name that can be used as selector for this series.
							'seriesClass': odin.validate.schemaPart.minString
						}
					}
				},
				// @section Config object
				// @slotOption c3 : Object
				// This object contains the entire c3-specific configuration. The structure is defined by
				// [c3.js](http://c3js.org/) itself. Please take a look at the [c3 reference](http://c3js.org/reference.html)
				// which options are available. Most of the option can be used for this component, too.
				// <h6 class="font-weight-bold">Chart:</h6>
				// <ul class="small">
				// <li><code>size.width</code></li>
				// <li><code>size.height</code></li>
				// <li><code>padding.top</code></li>
				// <li><code>padding.right</code></li>
				// <li><code>padding.bottom</code></li>
				// <li><code>padding.left</code></li>
				// <li><code>color.pattern</code></li>
				// <li><code>interaction.enabled</code></li>
				// <li><code>transition.duration</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Data:</h6>
				// <ul class="small">
				// <li><code>data.x</code></li>
				// <li><code>data.xs</code></li>
				// <li><code>data.xFormat</code></li>
				// <li><code>data.type</code></li>
				// <li><code>data.types</code></li>
				// <li><code>data.groups</code></li>
				// <li><code>data.axes</code></li>
				// <li><code>data.labels</code></li>
				// <li><code>data.order</code> (no function value)</li>
				// <li><code>data.regions</code> (either use a string or array index for `start` and `end`)</li>
				// <li><code>data.colors</code></li>
				// <li><code>data.hide</code></li>
				// <li><code>data.empty.label.text</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Axis:</h6>
				// <ul class="small">
				// <li><code>axis.rotated</code></li>
				// <li><code>axis.x.show</code></li>
				// <li><code>axis.x.type</code></li>
				// <li><code>axis.x.localtime</code></li>
				// <li><code>axis.x.categories</code></li>
				// <li><code>axis.x.tick.centered</code></li>
				// <li><code>axis.x.tick.culling</code></li>
				// <li><code>axis.x.tick.culling.max</code></li>
				// <li><code>axis.x.tick.count</code></li>
				// <li><code>axis.x.tick.fit</code></li>
				// <li><code>axis.x.tick.values</code> (either use strings or integers)</li>
				// <li><code>axis.x.tick.rotate</code></li>
				// <li><code>axis.x.tick.outer</code></li>
				// <li><code>axis.x.max</code> (either use string or number)</li>
				// <li><code>axis.x.min</code> (either use string or number)</li>
				// <li><code>axis.x.padding</code></li>
				// <li><code>axis.x.height</code></li>
				// <li><code>axis.x.extent</code> (no function value)</li>
				// <li><code>axis.x.label</code></li>
				// <li><code>axis.y.show</code></li>
				// <li><code>axis.y.inner</code></li>
				// <li><code>axis.y.max</code></li>
				// <li><code>axis.y.min</code></li>
				// <li><code>axis.y.inverted</code></li>
				// <li><code>axis.y.center</code></li>
				// <li><code>axis.y.label</code></li>
				// <li><code>axis.y.tick.outer</code></li>
				// <li><code>axis.y.tick.values</code></li>
				// <li><code>axis.y.tick.count</code></li>
				// <li><code>axis.y.padding</code></li>
				// <li><code>axis.y.default</code></li>
				// <li><code>axis.y2.show</code></li>
				// <li><code>axis.y2.inner</code></li>
				// <li><code>axis.y2.max</code></li>
				// <li><code>axis.y2.min</code></li>
				// <li><code>axis.y2.inverted</code></li>
				// <li><code>axis.y2.center</code></li>
				// <li><code>axis.y2.label</code></li>
				// <li><code>axis.y2.tick.outer</code></li>
				// <li><code>axis.y2.tick.values</code></li>
				// <li><code>axis.y2.tick.count</code></li>
				// <li><code>axis.y2.padding</code></li>
				// <li><code>axis.y2.default</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Grid:</h6>
				// <ul class="small">
				// <li><code>grid.x.show</code></li>
				// <li><code>grid.x.lines</code> (either use a string or number for `value`)</li>
				// <li><code>grid.y.show</code></li>
				// <li><code>grid.y.lines</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Region:</h6>
				// <ul class="small">
				// <li><code>regions</code> (for `x` use strings or numbers, for `y` and `y2` use numbers)</li>
				// </ul>
				// <h6 class="font-weight-bold">Legend:</h6>
				// <ul class="small">
				// <li><code>legend.show</code></li>
				// <li><code>legend.hide</code></li>
				// <li><code>legend.position</code></li>
				// <li><code>legend.inset</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Tooltip:</h6>
				// <ul class="small">
				// <li><code>tooltip.show</code></li>
				// <li><code>tooltip.grouped</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Subchart:</h6>
				// <ul class="small">
				// <li><code>subchart.show</code></li>
				// <li><code>subchart.size.height</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Zoom:</h6>
				// <ul class="small">
				// <li><code>zoom.enabled</code></li>
				// <li><code>zoom.rescale</code></li>
				// <li><code>zoom.extent</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Point:</h6>
				// <ul class="small">
				// <li><code>point.show</code></li>
				// <li><code>point.r</code></li>
				// <li><code>point.focus.expand.enabled</code></li>
				// <li><code>point.focus.expand.r</code></li>
				// <li><code>point.select.r</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Line:</h6>
				// <ul class="small">
				// <li><code>line.connectNull</code></li>
				// <li><code>line.step.type</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Area:</h6>
				// <ul class="small">
				// <li><code>area.zerobased</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Bar:</h6>
				// <ul class="small">
				// <li><code>bar.width</code></li>
				// <li><code>bar.width.ratio</code></li>
				// <li><code>bar.zerobased</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Pie:</h6>
				// <ul class="small">
				// <li><code>pie.label.show</code></li>
				// <li><code>pie.label.threshold</code></li>
				// <li><code>pie.expand</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Donut:</h6>
				// <ul class="small">
				// <li><code>donut.label.show</code></li>
				// <li><code>donut.label.threshold</code></li>
				// <li><code>donut.expand</code></li>
				// <li><code>donut.width</code></li>
				// <li><code>donut.title</code></li>
				// </ul>
				// <h6 class="font-weight-bold">Gauge:</h6>
				// <ul class="small">
				// <li><code>gauge.label.show</code></li>
				// <li><code>gauge.expand</code></li>
				// <li><code>gauge.min</code></li>
				// <li><code>gauge.max</code></li>
				// <li><code>gauge.units</code></li>
				// <li><code>gauge.width</code></li>
				// </ul>
				'c3': {
					'type': 'object',
					'properties': {
						'size': {
							'type': 'object',
							'properties': {
								'width': odin.validate.schemaPart.integer,
								'height': odin.validate.schemaPart.integer
							}
						},
						'padding': {
							'type': 'object',
							'properties': {
								'top': odin.validate.schemaPart.integer,
								'right': odin.validate.schemaPart.integer,
								'bottom': odin.validate.schemaPart.integer,
								'left': odin.validate.schemaPart.integer
							}
						},
						'color': {
							'type': 'object',
							'properties': {
								'pattern': {
									'type': 'array',
									'minItems': 1,
									'items': odin.validate.schemaPart.htmlColor
								}
							}
						},
						'interaction': {
							'type': 'object',
							'properties': {
								'enabled': odin.validate.schemaPart.boolean
							}
						},
						'transition': {
							'type': 'object',
							'properties': {
								'duration': odin.validate.schemaPart.integer
							}
						},
						'data': {
							'type': 'object',
							'properties': {
								'x': odin.validate.schemaPart.minString,
								'xs': {
									'type': 'object',
									'minProperties': 2,
									'patternProperties': {
										'^.*$': odin.validate.schemaPart.minString
									}
								},
								'xFormat': odin.validate.schemaPart.string,
								'type': odin.validate.schemaPart.minString,
								'types': {
									'type': 'object',
									'minProperties': 2,
									'patternProperties': {
										'^.*$': odin.validate.schemaPart.minString
									}
								},
								'groups': {
									'type': 'array',
									'items': {
										'type': 'array',
										'minItems': 1,
										'items': odin.validate.schemaPart.minString
									}
								},
								'axes': {
									'type': 'object',
									'patternProperties': {
										'^.*$': {
											'type': 'string',
											'enum': ['y', 'y2']
										}
									}
								},
								'labels': odin.validate.schemaPart.boolean,
								'order': {
									'enum': ['desc', 'asc', null]
								},
								'regions': {
									'type': 'object',
									'minProperties': 1,
									'patternProperties': {
										'^.*$': {
											'type': 'array',
											'items': {
												'type': 'object',
												'properties': {
													'style': odin.validate.schemaPart.string
												},
												'oneOf': [{
														'properties': {
															'start': odin.validate.schemaPart.number,
															'end': odin.validate.schemaPart.number
														}
													}, {
														'properties': {
															'start': odin.validate.schemaPart.string,
															'end': odin.validate.schemaPart.string
														}
													}
												]
											}
										}
									}
								},
								'colors': {
									'type': 'object',
									'minProperties': 1,
									'patternProperties': {
										'^.*$': odin.validate.schemaPart.htmlColor
									}
								},
								'hide': {
									'oneOf': [odin.validate.schemaPart.boolean, {
											'type': 'array',
											'items': odin.validate.schemaPart.minString
										}
									]
								},
								'empty': {
									'type': 'object',
									'required': ['label'],
									'properties': {
										'label': {
											'type': 'object',
											'required': ['text'],
											'properties': {
												'text': odin.validate.schemaPart.string
											}
										}
									}
								}
							}
						},
						'axis': {
							'type': 'object',
							'properties': {
								'rotated': odin.validate.schemaPart.boolean,
								'x': {
									'allOf': [{
											'$ref': '#/definitions/c3axisBaseX'
										}, {
											'properties': {
												'type': odin.validate.schemaPart.minString,
												'localtime': odin.validate.schemaPart.boolean,
												'categories': {
													'type': 'array',
													'items': odin.validate.schemaPart.minString
												},
												'height': odin.validate.schemaPart.positiveInteger,
												'extent': {
													'$ref': '#/definitions/c3extent'
												},
												'tick': {
													'properties': {
														'centered': odin.validate.schemaPart.boolean,
														'culling': {
															'oneOf': [odin.validate.schemaPart.boolean, {
																	'type': 'object',
																	'required': ['max'],
																	'properties': {
																		'max': odin.validate.schemaPart.integer
																	}
																}
															]
														},
														'fit': odin.validate.schemaPart.boolean,
														'rotate': {
															'type': 'number',
															'minimum': -360,
															'maximum': 360
														}
													}
												}
											}
										}
									]
								},
								'y': {
									'$ref': '#/definitions/c3axisY'
								},
								'y2': {
									'$ref': '#/definitions/c3axisY'
								}
							}
						},
						'grid': {
							'type': 'object',
							'properties': {
								'x': {
									'allOf': [{
											'$ref': '#/definitions/c3gridBase'
										}, {
											'properties': {
												'lines': {
													'oneOf': [{
															'items': {
																'properties': {
																	'value': odin.validate.schemaPart.number
																}
															}
														}, {
															'items': {
																'properties': {
																	'value': odin.validate.schemaPart.string
																}
															}
														}
													]
												}
											}
										}
									]
								},
								'y': {
									'allOf': [{
											'$ref': '#/definitions/c3gridBase'
										}, {
											'properties': {
												'lines': {
													'items': {
														'properties': {
															'value': odin.validate.schemaPart.number
														}
													}
												}
											}
										}
									]
								}
							}
						},
						'regions': {
							'type': 'array',
							'minItems': 1,
							'uniqueItems': true,
							'items': {
								'type': 'object',
								'required': ['axis'],
								'properties': {
									'axis': {
										'enum': ['x', 'y', 'y2']
									},
									'class': odin.validate.schemaPart.minString
								},
								'oneOf': [{
										'properties': {
											'axis': {
												'enum': ['x', 'y', 'y2']
											},
											'start': odin.validate.schemaPart.number,
											'end': odin.validate.schemaPart.number
										}
									}, {
										'properties': {
											'axis': {
												'enum': ['x']
											},
											'start': odin.validate.schemaPart.string,
											'end': odin.validate.schemaPart.string
										}
									}
								]
							}
						},
						'legend': {
							'type': 'object',
							'properties': {
								'show': odin.validate.schemaPart.boolean,
								'hide': {
									'oneOf': [odin.validate.schemaPart.boolean, odin.validate.schemaPart.minString, {
											'type': 'array',
											'items': odin.validate.schemaPart.minString
										}
									]
								},
								'position': {
									'enum': [
										'bottom',
										'right',
										'inset'
									]
								},
								'inset': {
									'type': 'object',
									'required': ['anchor', 'x', 'y', 'step'],
									'properties': {
										'anchor': {
											'enum': [
												'top-left',
												'top-right',
												'bottom-left',
												'bottom-right'
											]
										},
										'x': odin.validate.schemaPart.integer,
										'y': odin.validate.schemaPart.integer,
										'step': odin.validate.schemaPart.positiveInteger
									}
								}
							}
						},
						'tooltip': {
							'type': 'object',
							'properties': {
								'show': odin.validate.schemaPart.boolean,
								'grouped': odin.validate.schemaPart.boolean
							}
						},
						'subchart': {
							'type': 'object',
							'properties': {
								'show': odin.validate.schemaPart.boolean,
								'size': {
									'type': 'object',
									'properties': {
										'height': odin.validate.schemaPart.integer
									}
								}
							}
						},
						'zoom': {
							'type': 'object',
							'properties': {
								'enabled': odin.validate.schemaPart.boolean,
								'rescale': odin.validate.schemaPart.boolean,
								'extent': {
									'$ref': '#/definitions/c3extent'
								}
							}
						},
						'point': {
							'type': 'object',
							'properties': {
								'show': odin.validate.schemaPart.boolean,
								'r': odin.validate.schemaPart.number,
								'focus': {
									'type': 'object',
									'required': ['expand'],
									'properties': {
										'expand': {
											'type': 'object',
											'properties': {
												'enabled': odin.validate.schemaPart.boolean,
												'r': odin.validate.schemaPart.number
											}
										}
									}
								},
								'select': {
									'type': 'object',
									'required': ['r'],
									'properties': {
										'r': odin.validate.schemaPart.number
									}
								}
							}
						},
						'line': {
							'type': 'object',
							'properties': {
								'connectNull': odin.validate.schemaPart.boolean,
								'step': {
									'type': 'object',
									'properties': {
										'type': {
											'enum': [
												'step',
												'step-before',
												'step-after'
											]
										}
									}
								}
							}
						},
						'area': {
							'type': 'object',
							'required': ['zerobased'],
							'properties': {
								'zerobased': odin.validate.schemaPart.boolean
							}
						},
						'bar': {
							'type': 'object',
							'properties': {
								'width': {
									'oneOf': [odin.validate.schemaPart.number, {
											'type': 'object',
											'required': ['ratio'],
											'properties': {
												'ratio': odin.validate.schemaPart.percent
											}
										}
									]
								},
								'zerobased': odin.validate.schemaPart.boolean
							}
						},
						'pie': {
							'type': 'object',
							'properties': {
								'label': {
									'type': 'object',
									'properties': {
										'show': odin.validate.schemaPart.boolean,
										'threshold': odin.validate.schemaPart.number
									}
								},
								'expand': odin.validate.schemaPart.boolean
							}
						},
						'donut': {
							'type': 'object',
							'properties': {
								'label': {
									'type': 'object',
									'properties': {
										'show': odin.validate.schemaPart.boolean,
										'threshold': odin.validate.schemaPart.number
									}
								},
								'expand': odin.validate.schemaPart.boolean,
								'width': odin.validate.schemaPart.positiveInteger,
								'title': odin.validate.schemaPart.minString
							}
						},
						'gauge': {
							'type': 'object',
							'properties': {
								'label': {
									'type': 'object',
									'properties': {
										'show': odin.validate.schemaPart.boolean
									}
								},
								'expand': odin.validate.schemaPart.boolean,
								'min': odin.validate.schemaPart.number,
								'max': odin.validate.schemaPart.number,
								'units': odin.validate.schemaPart.minString,
								'width': odin.validate.schemaPart.positiveInteger
							}
						}
					}
				}
			},
			'oneOf': [{
					'properties': {
						'elementsAreObjects': odin.validate.schemaPart.constTrue,
						'dataSeries': {
							'items': {
								'properties': {
									// @section DataSeries object
									// @slotOption key : String
									// Specifies the property to use from the data objects. Applies if
									// `chart-view-config-elementsAreObjects` is `true`.
									'key': odin.validate.schemaPart.minString
								}
							}
						}
					}
				}, {
					'properties': {
						'elementsAreObjects': odin.validate.schemaPart.constFalse,
						'dataSeries': {
							'items': {
								'properties': {
									// @alternative
									// @slotOption key : Array index
									// Specifies the index to use from the data objects. Applies if
									// `chart-view-config-elementsAreObjects` is `false`.
									'key': odin.validate.schemaPart.zeroPositiveInteger
								}
							}
						}
					}
				}
			]
		},

		/*
		 * @section
		 *
		 * @input data : normalized data structure
		 * @aka chart-view-data
		 * The incoming data, which must be a `normalized data structure`.
		 *
		 * @method setData(data : normalized data structure); See `chart-view-data` for more details.
		 */

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

		_getWrapperClass: function (config) {
			if (this.isReady && config && config.wrapperClass) {
				return config.wrapperClass;
			}
			return '';
		},

		modelDataChanged: function () {
			if (this._validate(this.getData(), this.getConfig())) {
				this._createViewData(this.getData(), this.getConfig());
			}
		},

		modelConfigChanged: function () {
			if (this._validate(this.getData(), this.getConfig())) {
				this._createViewData(this.getData(), this.getConfig());
			}
		},

		_validate: function (data, config) {
			if (!this.isReady) {
				return false;
			}
			// printable data is all except 'undefined' and/or 'null'
			if (data === undefined || data === null || !config) {
				return false;
			}
			var configErrors = odin.validate.withSchema(this.jsonSchemaConfig, config);
			if (configErrors) {
				this.setError(odin.createErrorObj(this, 'config param is invalid.', configErrors));
				return false;
			}
			if (config.elementsAreObjects) {
				var dataErrors = odin.validate.withSchema(config.dataContainsTuples ? odin.validate.schema.dataObjectTuples : odin.validate.schema.dataObjectSeries, data);
				if (dataErrors) {
					this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
					return false;
				}
			} else {
				var dataErrors = odin.validate.withSchema(odin.validate.schema.dataArrays, data);
				if (dataErrors) {
					this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
					return false;
				}
				// additional length check if array tuples
				if (config.dataContainsTuples) {
					for (var i = 0, length = -1; i < data.length; i++) {
						var elem = data[i];
						if (i === 0) {
							length = elem.length;
						} else if (length !== elem.length) {
							this.setError(odin.createErrorObj(this, 'data element at ' + i + ' has not the same length of the others (' + length + ').'));
							return false;
						}
					}
				}
			}
			return true;
		},

		_createViewData: function (data, config) {
			var c3obj = {
				bindto: document.getElementById(this.chartId)
			};
			if (config.c3) {
				// transfer c3 config
				c3obj = odin.mergeObjects(c3obj, config.c3);
				// delete potential data entries
				if (c3obj.data) {
					delete c3obj.data.columns;
					delete c3obj.data.rows;
					delete c3obj.data.json;
					// transfer 'x' if present
					if (c3obj.data.keys && c3obj.data.keys.x && !c3obj.data.x) {
						c3obj.data.x = c3obj.data.keys.x;
					}
					delete c3obj.data.keys;
					delete c3obj.data.url;
					delete c3obj.data.mimeType;
				} else {
					// no 'data', but data property is needed later
					c3obj.data = {};
				}
			} else {
				// no c3 config, but data property is needed later
				c3obj.data = {};
			}
			// create data property
			var xs = [];
			if (c3obj.data.xs) {
				xs = odin.mergeArrays(xs, odin.getObjectValues(c3obj.data.xs));
				if (xs.length === 1) {
					// if all the same force usage of 'data.x'
					c3obj.data.x = xs[0];
					delete c3obj.data.xs;
				}
			} else if (c3obj.data.x) {
				xs.push(c3obj.data.x);
			}
			// validate c3 x axis values
			// can't be done in validate method, because xs is only known here
			if (config.dataContainsTuples) {
				for (var i = 0; i < xs.length; i++) {
					for (var j = 0; j < data.length; j++) {
						if (data[j][xs[i]] === undefined || data[j][xs[i]] === null) {
							// null values not allowed for key of the x axis (c3 data.x or data.xs)
							this.setError(odin.createErrorObj(this, 'data element "' + j + '" is not defined or contains null at key "' + xs[i] + '". This is not allowed for a key of the x axis.'));
							return;
						}
					}
				}
			} else {
				for (var i = 0; i < xs.length; i++) {
					if (data[xs[i]]) {
						for (var j = 0; j < data[xs[i]].length; j++) {
							if (data[xs[i]][j] === undefined || data[xs[i]][j] === null) {
								// null values not allowed for key of the x axis (c3 data.x or data.xs)
								this.setError(odin.createErrorObj(this, 'data element "' + xs[i] + '" is not defined or contains null at index "' + j + '". This is not allowed for a key of the x axis.'));
								return;
							}
						}
					}
				}
			}
			var chartData = this._createChartData(data, config.dataSeries, xs, config.elementsAreObjects, config.dataContainsTuples);
			c3obj.data.names = {};
			c3obj.data.classes = {};
			if (config.dataContainsTuples) {
				// create keys, names, classes
				c3obj.data.keys = {};
				c3obj.data.keys.value = [];
				if (config.dataSeries) {
					config.dataSeries.forEach(function (e) {
						// exclude 'x' key
						if (e.key !== c3obj.data.x) {
							c3obj.data.keys.value.push('' + e.key);
							c3obj.data.names[e.key] = e.name ? e.name : '' + e.key;
							if (e.seriesClass) {
								c3obj.data.classes[e.key] = e.seriesClass;
							}
						}
					});
				} else {
					c3obj.data.keys.value = chartData.map(function (e) {
							return Object.keys(e);
						}).reduce(function (acc, val) {
							if (acc.length === 0) {
								return val;
							} else {
								return odin.mergeArrays(acc, val);
							}
						}, []).filter(function (e) {
							// exclude 'x' key
							return e !== c3obj.data.x;
						});
				}
				// transfer 'x' if present, yes again
				if (c3obj.data.x) {
					c3obj.data.keys.x = c3obj.data.x;
					delete c3obj.data.x;
				}
			} else {
				// create names, classes
				if (config.dataSeries) {
					config.dataSeries.forEach(function (e) {
						// exclude 'x' key
						if (e.key !== c3obj.data.x) {
							c3obj.data.names[e.key] = e.name ? e.name : '' + e.key;
							if (e.seriesClass) {
								c3obj.data.classes[e.key] = e.seriesClass;
							}
						}
					});
				}
			}
			c3obj.data.json = chartData;
			try {
				if (this._chartInstance) {
					this._chartInstance.destroy();
				}
				this._chartInstance = c3.generate(c3obj);
				odin.triggerOnViewUpdate(this);
			} catch (err) {
				this.setError(odin.createErrorObj(this, 'c3 generation failed.', err));
			}
		},

		_createChartData: function (data, dataSeries, xs, elementsAreObjects, dataContainsTuples) {
			if (!elementsAreObjects) {
				// pre-transform data to objects
				if (dataContainsTuples) {
					data = data.map(function (e) {
							return odin.arrayToObject(e);
						});
				} else {
					data = odin.arrayToObject(data);
				}
			}
			// copy & filter data
			var result;
			var transform = function (k, v) {
				// copy the array
				return v.map(function (e) {
					return e;
				});
			};
			if (dataSeries) {
				var isX = !xs ? function (other) {
					return false;
				}
				 : function (other) {
					return xs.indexOf(other) > -1;
				};
				var keys = dataSeries.map(function (e) {
						// key must be a string
						return '' + e.key;
					}).filter(function (e) {
						return !isX(e);
					});
				var filter = function (k, v) {
					return keys.indexOf(k) > -1 || isX(k);
				};
				if (dataContainsTuples) {
					result = data.map(function (e) {
							return odin.copyObject(e, filter);
						});
				} else {
					result = odin.copyObject(data, filter, transform);
				}
			} else {
				if (dataContainsTuples) {
					result = data.map(function (e) {
							return odin.copyObject(e);
						});
				} else {
					result = odin.copyObject(data, null, transform);
				}
			}
			return result;
		}
	});
}
	());
