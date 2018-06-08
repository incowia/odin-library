/*
 * @class array-element-mapper
 *
 * A transformer which maps an array of data to a `normalized data structure` (all data
 * structures). The internal process starts when an input slot changes, but all other
 * input slots must be set with a valid value first. After the value is set, each
 * change will trigger the process with the current changed value of an input slot and
 * with all previously setted values of the other input slots.
 *
 * @synchronization
 * As all transformers, this one works **synchronously**. See `transformers-synchronization`.
 *
 * @example
 * See [demo page](../array-element-mapper/demo/index.html).
 *
 * @output dataOut : Object|Array
 * @aka array-element-mapper-dataOut
 * Returns an object or array as the mapping result (`normalized data structure`).
 * The structure and type of the result is determined by the `AEM Config Options` of
 * the input slot `array-element-mapper-config`.
 *
 * @method getDataOut() : Object|Array; See `array-element-mapper-dataOut` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka array-element-mapper-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `array-element-mapper-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'array-element-mapper',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			}
		},

		/*
		 * @input config : AEM Config Options
		 * @aka array-element-mapper-config
		 * The configuration of this component. It defines how to map the incoming data
		 * to the desired result (`normalized data structure`).
		 *
		 * @method setConfig(config : AEM Config Options); See `array-element-mapper-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka AEM Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'required': ['mapToObjects', 'mappings'],
			'properties': {
				// @slotOption mapToObjects : Boolean
				// @aka array-element-mapper-config-mapToObjects
				// `true` if the resulting data structure shall be composed of objects,
				// otherwise `false` for arrays. See `normalized data structure` for more details.
				'mapToObjects': odin.validate.schemaPart.boolean,
				// @slotOption mapToTupels : Boolean = true
				// `true` if the resulting data structure shall be composed of data tupels,
				// otherwise `false` for data series. See `normalized data structure` for more details.
				'mapToTupels': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption mappings : Mapping[]
				// An array of `Mapping` elements, with each element defining a mapping
				// rule. Each rule must be unique.
				'mappings': {
					'type': 'array',
					'uniqueItems': true,
					'items': {
						'type': 'object',
						'required': ['src', 'target'],
						'properties': {
							// @section Mapping object
							// @aka Mapping
							// @aka Mapping[]
							// A mapping object defines a mapping rule.
							//
							// @slotOption src : Odin Path w/ parsing
							// A path to the source data in `array-element-mapper-dataIn` with an
							// optional parsing option. See `Odin Path w/ parsing` for more details.
							'src': odin.path.schemaPartWithParse
						}
					}
				}
			},
			'oneOf': [{
					'type': 'object',
					'properties': {
						'mapToObjects': odin.validate.schemaPart.constTrue,
						'mappings': {
							'type': 'array',
							'items': {
								'type': 'object',
								'properties': {
									// @slotOption target : String
									// Specifies a target property. Applies if `array-element-mapper-config-mapToObjects` is `true`.
									'target': odin.validate.schemaPart.string
								}
							}
						}
					}
				}, {
					'type': 'object',
					'properties': {
						'mapToObjects': odin.validate.schemaPart.constFalse,
						'mappings': {
							'type': 'array',
							'items': {
								'type': 'object',
								'properties': {
									// @alternative
									// @slotOption target : Array index
									// Specifies a target index. Applies if `array-element-mapper-config-mapToObjects` is `false`.
									'target': odin.validate.schemaPart.zeroPositiveInteger
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
		 * @input dataIn : Array
		 * @aka array-element-mapper-dataIn
		 * The incoming data, which is an array that may contain elements of either
		 * the type object or array, but not both. In case of object elements, each
		 * property of such an object may be of any type. In case of array elements,
		 * each element of such an array may be of any type.
		 *
		 * @method setDataIn(dataIn : Array); See `array-element-mapper-dataIn` for more details.
		 */
		jsonSchemaDataIn: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'array',
			'oneOf': [{
					'items': {
						'type': 'object'
					}
				}, {
					'items': {
						'type': 'array'
					}
				}
			]
		},

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

		modelDataInChanged: function () {
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._map(this.getDataIn(), this.getConfig());
			}
		},

		modelConfigChanged: function () {
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._map(this.getDataIn(), this.getConfig());
			}
		},

		_validate: function (dataIn, config) {
			if (!this.isReady) {
				return false;
			}
			if (!dataIn || !config) {
				return false;
			}
			var configErrors = odin.validate.withSchema(this.jsonSchemaConfig, config);
			if (configErrors) {
				this.setError(odin.createErrorObj(this, 'config param is invalid.', configErrors));
				return false;
			}
			var dataInErrors = odin.validate.withSchema(this.jsonSchemaDataIn, dataIn);
			if (dataInErrors) {
				this.setError(odin.createErrorObj(this, 'dataIn param is invalid.', dataInErrors));
				return false;
			}
			return true;
		},

		_map: function (dataIn, config) {
			// resolve 'src' tokens
			for (var i = 0; i < config.mappings.length; i++) {
				var mapping = config.mappings[i];
				try {
					mapping.pathObj = odin.path.create(mapping.src);
				} catch (err) {
					this.setError(odin.createErrorObj(this, 'Unexpected type in mappings at ' + i + '.', err));
					return;
				}
			}
			// do mapping
			var result = [];
			for (var i = 0; i < dataIn.length; i++) {
				var e = dataIn[i];
				var mappedElement = config.mapToObjects ? {}
				 : [];
				for (var j = 0; j < config.mappings.length; j++) {
					try {
						mappedElement[config.mappings[j].target] = odin.path.resolve(config.mappings[j].pathObj, e);
					} catch (err) {
						// error: mapping error
						this.setError(odin.createErrorObj(this, 'Mapping error: unable to map value with mapping config at ' + j + '.', err));
						return;
					}
				}
				result.push(mappedElement);
			}
			// transform tupels to series?
			if (!config.mapToTupels) {
				var series = [];
				if (config.mapToObjects) {
					var tmp = {};
					result.forEach(function (e) {
						for (var prop in e) {
							if (e.hasOwnProperty(prop)) {
								var arr = tmp[prop];
								if (!arr) {
									arr = [];
									tmp[prop] = arr;
								}
								arr.push(e[prop]);
							}
						}
					});
					series = tmp;
				} else {
					result.forEach(function (e) {
						e.forEach(function (subElem, j) {
							var arr = series[j];
							if (!arr) {
								arr = [];
								series[j] = arr;
							}
							arr.push(subElem);
						});
					});
				}
				result = series;
			}
			this.setDataOut(result);
		}
	});
}
	());
