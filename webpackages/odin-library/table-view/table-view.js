/*
 * @class table-view
 *
 * A view which displays the given data as a table.
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
 * See [demo page](../table-view/demo/index.html).
 *
 * @output onViewUpdate : View update object
 * @aka table-view-onViewUpdate
 * Signals that the internal process of this view has ended successfully (this does not
 * include the rendering process).
 *
 * @method getOnViewUpdate() : View update object; See `table-view-onViewUpdate` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka table-view-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `table-view-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'table-view',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			},
			tableHeader: {
				type: Array,
				value: []
			},
			tableData: {
				type: Array,
				value: []
			}
		},

		/*
		 * @input config : TV Config Options
		 * @aka table-view-config
		 * The configuration of this component. It defines how to interprete the incoming
		 * data (`normalized data structure`) and format the table.
		 *
		 * @method setConfig(config : TV Config Options); See `table-view-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka TV Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'required': ['elementsAreObjects'],
			'properties': {
				// @slotOption elementsAreObjects : Boolean
				// @aka table-view-config-elementsAreObjects
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
				// @slotOption tableClass : String
				// A css class name that can be used as selector for the entire `<table>` element.
				'tableClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption headClass : String
				// A css class name that can be used as selector for the entire `<thead>` element.
				'headClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption bodyClass : String
				// A css class name that can be used as selector for the entire `<tbody>` element.
				'bodyClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption rowClass : String
				// A css class name that can be used as selector for all `<tr>` elements.
				'rowClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption headerClass : String
				// A css class name that can be used as selector for all `<th>` elements.
				'headerClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption cellClass : String
				// A css class name that can be used as selector for all `<td>` elements.
				'cellClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption showRowNumbers : Boolean = false
				// `true` if the table should show the number of each row in the first column, otherwise `false`.
				'showRowNumbers': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption header : Header[]
				// An array of `Header` elements, with each element defining a column heading of the table.
				// Each definition must be unique.
				'header': {
					'type': 'array',
					'uniqueItems': true,
					'minItems': 1,
					'items': {
						'type': 'object',
						'required': ['name'],
						'properties': {
							// @section Header object
							// @aka Header
							// @aka Header[]
							// A header object defines a heading for the table.
							//
							// @slotOption name : String
							// The name of the column heading to display.
							'name': odin.validate.schemaPart.minString
						}
					}
				}
			},
			'oneOf': [{
					'required': ['header'],
					'properties': {
						'elementsAreObjects': odin.validate.schemaPart.constTrue,
						'header': {
							'items': {
								'required': ['key'],
								'properties': {
									// @slotOption key : String
									// Specifies the property to use from the data objects. Applies if
									// `table-view-config-elementsAreObjects` is `true`.
									'key': odin.validate.schemaPart.minString
								}
							}
						}
					}
				}, {
					'properties': {
						'elementsAreObjects': odin.validate.schemaPart.constFalse,
						'header': {
							'items': {
								'properties': {
									// @alternative
									// @slotOption key : Array index
									// Specifies the index to use from the data objects. Applies if
									// `table-view-config-elementsAreObjects` is `false`.
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
		 * @aka table-view-data
		 * The incoming data, which must be a `normalized data structure`.
		 *
		 * @method setData(data : normalized data structure); See `table-view-data` for more details.
		 */

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

		_getWrapperClass: function (config) {
			return this._getCSSClass(config, 'wrapperClass');
		},

		_getTableClass: function (config) {
			return this._getCSSClass(config, 'tableClass');
		},

		_getHeadClass: function (config) {
			return this._getCSSClass(config, 'headClass');
		},

		_getBodyClass: function (config) {
			return this._getCSSClass(config, 'bodyClass');
		},

		_getRowClass: function (config) {
			return this._getCSSClass(config, 'rowClass');
		},

		_getHeaderClass: function (config) {
			return this._getCSSClass(config, 'headerClass');
		},

		_getCellClass: function (config) {
			return this._getCSSClass(config, 'cellClass');
		},

		_getCSSClass: function (config, className) {
			if (this.isReady && config && config[className]) {
				return config[className];
			}
			return '';
		},

		_getRowNumber: function (index) {
			return index === undefined || index == null ? 0 : index + 1;
		},

		_isDataAvailable: function (data) {
			// data might be tableHeader or tableData
			return data !== undefined && data !== null && data.length > 0;
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
			this.tableData = [];
			this.tableHeader = [];
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
			if (config.header && !config.elementsAreObjects) {
				// adjust keys in config.header
				var header = config.header;
				for (var i = 0; i < header.length; i++) {
					var key = header[i].key;
					if (key === undefined || key === null) {
						// fallback for arrays
						header[i].key = i;
					}
				}
			}
			if (config.elementsAreObjects) {
				if (config.dataContainsTuples) {
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectTuples, data);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
						return false;
					}
				} else {
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectSeries, data);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
						return false;
					}
					// additional length check
					var len = -1;
					for (var prop in data) {
						if (data.hasOwnProperty(prop)) {
							var arr = data[prop];
							if (len === -1) {
								len = arr.length;
							} else if (len !== arr.length) {
								this.setError(odin.createErrorObj(this, 'data series with key ' + prop + ' has not the same length of the others (' + len + ').'));
								return false;
							}
						}
					}
				}
			} else {
				var dataErrors = odin.validate.withSchema(odin.validate.schema.dataArrays, data);
				if (dataErrors) {
					this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
					return false;
				}
				// additional length check
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
			return true;
		},

		_createViewData: function (data, config) {
			var headers = [];
			var rows = [];
			if (config.elementsAreObjects) {
				if (config.dataContainsTuples) {
					// fill rows
					for (var i = 0; i < data.length; i++) {
						var row = [];
						for (var j = 0; j < config.header.length; j++) {
							var colDef = config.header[j];
							try {
								row.push(data[i][colDef.key]);
							} catch (err) {
								// error: mapping error
								this.setError(odin.createErrorObj(this, 'mapping error.', error));
								return;
							}
						}
						rows.push(row);
					}
				} else {
					// fill rows
					for (var i = 0; i < config.header.length; i++) {
						var colDef = config.header[i];
						try {
							var col = data[colDef.key];
							if (!col) {
								continue;
							}
							for (var j = 0; j < col.length; j++) {
								var row = rows[j];
								if (!row) {
									row = [];
									rows[j] = row;
								}
								row.push(col[j]);
							}
						} catch (err) {
							// error: mapping error
							this.setError(odin.createErrorObj(this, 'mapping error.', error));
							return;
						}
					}
				}
				// map tableHeader
				headers = config.header;
			} else {
				if (config.dataContainsTuples) {
					if (!config.header) {
						// copy data as it is
						rows = data.map(function (e) {
								return e.map(function (subElem) {
									return subElem;
								});
							});
					} else {
						// fill rows
						for (var i = 0; i < data.length; i++) {
							var row = [];
							for (var j = 0; j < config.header.length; j++) {
								var colDef = config.header[j];
								try {
									row.push(data[i][colDef.key]);
								} catch (err) {
									// error: mapping error
									this.setError(odin.createErrorObj(this, 'mapping error.', error));
									return;
								}
							}
							rows.push(row);
						}
						// map tableHeader
						headers = config.header;
					}
				} else {
					if (!config.header) {
						// copy data as it is
						data.forEach(function (col, i) {
							col.forEach(function (cell, j) {
								var row = rows[j];
								if (!row) {
									row = [];
									rows[j] = row;
								}
								row[i] = cell;
							});
						});
					} else {
						// fill rows
						for (var i = 0; i < config.header.length; i++) {
							var colDef = config.header[i];
							try {
								var col = data[colDef.key];
								if (!col) {
									continue;
								}
								for (var j = 0; j < col.length; j++) {
									var row = rows[j];
									if (!row) {
										row = [];
										rows[j] = row;
									}
									row.push(col[j]);
								}
							} catch (err) {
								// error: mapping error
								this.setError(odin.createErrorObj(this, 'mapping error.', error));
								return;
							}
						}
						// map tableHeader
						headers = config.header;
					}
				}
			}
			this.tableHeader = config.header;
			this.tableData = rows;
			odin.triggerOnViewUpdate(this);
		}
	});
}
	());
