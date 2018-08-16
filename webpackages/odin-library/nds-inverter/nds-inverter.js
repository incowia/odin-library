/* eslint-disable indent,comma-spacing,spaced-comment,no-trailing-spaces,padded-blocks,space-before-blocks */
/*
 * @class nds-inverter
 *
 * A transformer which maps an array of data to a `normalized data structure` (all data
 * structures). The internal process starts when an input slot changes, but all other
 * input slots must be set with a valid value first. After the value is set, each
 * change will trigger the process with the current changed value of an input slot and
 * with all previously set values of the other input slots. A demo example:
 *
 * <p><table class="table table-responsive table-hover table-bordered table-sm">
 * 	<thead class="thead-dark">
 *    <th scope="col" style="white-space:nowrap;">name</th>
 * 		<th scope="col" style="white-space:nowrap;">dataIn</th>
 * 		<th scope="col" style="white-space:nowrap;">config</th>
 * 		<th scope="col" style="white-space:nowrap;">dataOut</th>
 * 	</thead>
 * 	<tbody>
 *		<tr>
 * 			<td><code class="text-nowrap">Array with object tuples</code></td>
 * 			<td>
 *				<pre>[ //    "a",       "b",       "c",       "d" <-- keys (columns)
 *		{ "a": 1234, "b": 5432, "c":  235, "d": 6547 }, // 0 <-- indices (rows)
 *		{ "a": 9876, "b": 5498, "c": 1234, "d": 6547 }, // 1
 *		{ "a":  754, "b":  234, "c": 5498, "d": 1234 }  // 2
 *]</pre>
 *			</td>
 * 			<td>
 *				<pre>{
 *   "elementsAreObjects": true,
 *   "dataContainsTupels": true
 *}</pre>
 *			</td>
 * 			<td><pre>[  //      0,         1,         2 <-- former indicies (columns)
 *  	{ "0": 1234, "1": 9876, "2":  754 }, // "a" <-- former keys (rows)
 *  	{ "0": 5432, "1": 5498, "2":  234 }, // "b"
 *  	{ "0":  235, "1": 1234, "2": 5498 }, // "c"
 *  	{ "0": 6547, "1": 6547, "2": 1234 }  // "d"
 *]</pre>
 *		 </td>
 * 		</tr>
 * 		<tr>
 * 			<td><code class="text-nowrap">Object with series per property</code></td>
 * 			<td><pre>{ //        0,    1,    2 <-- indicies (columns)
 *		"a": [ 1234, 9876,  754 ], // "a" <-- keys (rows)
 *		"b": [ 5432, 5498,  234 ], // "b"
 *		"c": [  235, 1234, 5498 ], // "c"
 *		"d": [ 6547, 6547, 1234 ]  // "d"
 *}</pre>
 *			</td>
 * 			<td><pre>{
 *   "elementsAreObjects": true,
 *   "dataContainsTupels": false
 *}</pre>
 * 			</td>
 * 			<td><pre>{  //      "a",  "b",  "c",  "d" <-- former keys (columns)
 *     "0": [ 1234, 5432,  235, 6547 ], // 0 <-- former indicies (rows)
 *     "1": [ 9876, 5498, 1234, 6547 ], // 1
 *     "2": [  754,  234, 5498, 1234 ]  // 2
 *}</pre>
 * 			</td>
 * 		</tr>
 * 		<tr>
 * 			<td><code class="text-nowrap">Array with array tupels</code></td>
 * 			<td><pre>[ //   0,    1,    2,    3 <-- inner array indices (columns)
 *     [ 1234, 5432,  235, 6547 ], // 0 <-- outer array indicies (rows)
 *     [ 9876, 5498, 1234, 6547 ], // 1
 *     [  754,  234, 5498, 1234 ]  // 2
 *]</pre>
 * 			</td>
 * 			<td><pre>{
 *   "elementsAreObjects": false,
 *   "dataContainsTupels": true
 *}</pre>
 * 			</td>
 * 			<td><pre>[  //   0,    1,    2 <-- former outer array indices (columns)
 *     [ 1234, 9876,  754 ], // 0 <-- former inner array indices (rows)
 *     [ 5432, 5498,  234 ], // 1
 *     [  235, 1234, 5498 ], // 2
 *     [ 6547, 6547, 1234 ]  // 3
 *]</pre>
 * 			</td>
 * 		</tr>
 * 		<tr>
 * 			<td><code class="text-nowrap">Array with array series</code></td>
 * 			<td><pre>[ //   0,    1,    2 <-- inner array indices (columns)
 *     [ 1234, 9876,  754 ], // 0 <-- outer array indices (rows)
 *     [ 5432, 5498,  234 ], // 1
 *     [  235, 1234, 5498 ], // 2
 *     [ 6547, 6547, 1234 ]  // 3
 *]</pre>
 * 			</td>
 * 			<td><pre>{
 *   "elementsAreObjects": false,
 *   "dataContainsTupels": false
 *}</pre>
 * 			</td>
 * 			<td><pre>[  //   0,    1,    2,    3 <-- former outer array indices (columns)
 *     [ 1234, 5432,  235, 6547 ], // 0 <-- former inner array indices (rows)
 *     [ 9876, 5498, 1234, 6547 ], // 1
 *     [  754,  234, 5498, 1234 ]  // 2
 *]</pre>
 * 			</td>
 * 		</tr>
 * 	</tbody>
 * </table></p>
 *
 * @synchronization
 * As all transformers, this one works **synchronously**. See `transformers-synchronization`.
 *
 * @example
 * See [demo page](../nds-inverter/demo/index.html).
 *
 * @output dataOut : normalized data structure
 * @aka nds-inverter-dataOut
 * Returns an object or array as the mapping result (`normalized data structure`).
 * The structure and type of the result is determined by the `AEM Config Options` of
 * the input slot `nds-inverter-config`.
 *
 * @method setDataOut() : normalized data structure; See `nds-inverter-dataOut` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka nds-inverter-error
 * Returns an `Error object`, if an error occurred while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `nds-inverter-error`
 * for more details.
 */
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

		/*
		 * @input config : NDSI Config Options
		 * @aka nds-inverter-config
		 * The configuration of this component. It defines how to map the incoming data
		 * to the desired result (`normalized data structure`).
		 *
		 * @method setConfig(config : NDSI Config Options); See `nds-inverter-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka NDSI Config Options
		 * The configuration object of this component.
		*/

		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'required': ['elementsAreObjects'],
			'properties': {
				// @slotOption elementsAreObjects : Boolean
				// @aka nds-inverter-config-elementsAreObjects
				// `true` if the resulting data structure is composed of objects,
				// otherwise `false` for arrays. See `normalized data structure` for more details.
				'elementsAreObjects': odin.validate.schemaPart.boolean,
				// @slotOption dataContainsTuples : Boolean = true
				// `true` if the resulting data structure is composed of data tuples,
				// otherwise `false` for data series. See `normalized data structure` for more details.
				'dataContainsTuples': odin.validate.schemaPart.booleanDefaultTrue
			}
		},
		/*
		 * @section
		 *
		 * @input dataIn : normalized data structure
		 * @aka nds-inverter-dataIn
		 * The incoming data, which is an array/object that may contain elements of either
		 * the type object or array, but not both. In case of object elements, each
		 * property of such an object may be of any type. In case of array elements,
		 * each element of such an array may be of any type.
		 *
		 * @method setDataIn(dataIn : normalized data structure); See `nds-inverter-dataIn` for more details.
		 */

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

