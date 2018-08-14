/* eslint-disable indent,comma-spacing,spaced-comment,no-trailing-spaces,padded-blocks,space-before-blocks */
(function () {
	'use strict';

	CubxPolymer({
		is: 'nds-inverter',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			}
		},

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
				'dataContainsTuples': odin.validate.schemaPart.booleanDefaultTrue
			}
		},

		created: function () {
		},

		ready: function () {
			this.isReady = true;
		},


		attached: function () {
		},


		cubxReady: function () {
		},

		modelDataInChanged: function () {
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._invert(this.getDataIn(), this.getConfig());
			}
		},

		modelConfigChanged: function () {
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._invert(this.getDataIn(), this.getConfig());
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
				this.setError(odin.createErrorObj(this, 'config param is invalid.', configErrors))
				return false;
			}
			if (config.elementsAreObjects) {
				if (config.dataContainsTuples) {
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectTupels, dataIn);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
						return false;
					}
				} else {
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectSeries, dataIn);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
						return false;
					}
					// additional length check
					var len = -1;
					for (var prop in dataIn) {
						if (dataIn.hasOwnProperty(prop)) {
							var arr = dataIn[prop];
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
				var dataErrors = odin.validate.withSchema(odin.validate.schema.dataArrays, dataIn);
				if (dataErrors) {
					this.setError(odin.createErrorObj(this, 'data param is invalid.', dataErrors));
					return false;
				}
				// additional length check
				for (var i = 0, length = -1; i < dataIn.length; i++) {
					var elem = dataIn[i];
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

		_invert: function (dataIn, config) {
			console.log('dataIn', dataIn);
			var result = null;
			if (config.elementsAreObjects) {
				if (config.dataContainsTuples) {
					// Array with object tuples
					result = [];
					var keys = null; // columns
					dataIn.forEach(function (row, rowIndex) {
						if (!keys) {
							keys = Object.keys(row);
						}
						keys.forEach(function (key, keyIndex) {
							var cellValue = row[key]; //var cellValue= row[a]::1234; var cellValue = row[b]::5432;
							var resultRow = result[keyIndex]; //var resultRow = result[a];  var resultRow = result[b]
							if (!resultRow) {
								resultRow = {};
								result.push(resultRow); //result = [ {}(a) ]; result = [ {0:1234}(a), {}(b) ]
							}
							resultRow[rowIndex] = cellValue;// [ {0:1234,  } ]; [ {0:1234}(a), {0:5432}(b) ]
						});
					});
				} else {
					// Object with series per property
					result = {};
					Object.keys(dataIn).forEach(function (key) {
						var column = dataIn[key];
						column.forEach(function (cellValue, rowIndex) {
							var resultColumn = result[rowIndex];
							if (!resultColumn) {
								resultColumn = [];
								result[rowIndex] = resultColumn;
							}
							resultColumn.push(cellValue);
						});
					});
				}
			} else {
					// Array with array tuples
					result= [];
					dataIn.forEach(function(row, rowIndex){
						row.forEach(function(key, keyIndex){
             var resultRow = result[keyIndex];
             if(!resultRow){
             	resultRow = [];
             	result.push(resultRow);
						 }
						 resultRow[rowIndex] = key;
						});
					});
			}
			console.log('dataOut', result);
			this.setDataOut(result);
// eslint-disable-next-line indent
		}
	});
}());

