/*
 * @class nds-inverter
 *
 * A transformer which inverts (flips) the rows and columns of a `normalized data structure`.
 * The internal process starts when an input slot changes, but all other
 * input slots must be set with a valid value first. After the value is set, each
 * change will trigger the process with the current changed value of an input slot and
 * with all previously set values of the other input slots.
 *
 * <p><table class="table table-hover table-bordered table-sm">
 * 	<thead class="thead-dark">
 *    <th scope="col" style="white-space:nowrap;">name</th>
 * 		<th scope="col" style="white-space:nowrap;">dataIn</th>
 * 		<th scope="col" style="white-space:nowrap;">config</th>
 * 		<th scope="col" style="white-space:nowrap;">dataOut</th>
 * 	</thead>
 * 	<tbody>
 * 		<tr>
 * 			<td>Array with object tuples</td>
 * 			<td>
 * 				<pre>[
 * 	{ "a": 1, "b": 4, "c": 7, "d": 10 },
 * 	{ "a": 2, "b": 5, "c": 8, "d": 11 },
 * 	{ "a": 3, "b": 6, "c": 9, "d": 12 }
 * ]</pre>
 * 			</td>
 * 			<td>
 * 				<pre>{
 * 	"elementsAreObjects": true,
 * 	"dataContainsTuples": true
 * }</pre>
 * 			</td>
 * 			<td><pre>[
 * 	{ "0":  1, "1":  2, "2":  3 },
 * 	{ "0":  4, "1":  5, "2":  6 },
 * 	{ "0":  7, "1":  8, "2":  9 },
 * 	{ "0": 10, "1": 11, "2": 12 }
 * ]</pre>
 * 		 </td>
 * 		</tr>
 * 		<tr>
 * 			<td>Object with series per property</td>
 * 			<td><pre>{
 * 	"a": [  1,  2,  3 ],
 * 	"b": [  4,  5,  6 ],
 * 	"c": [  7,  8,  9 ],
 * 	"d": [ 10, 11, 12 ]
 * }</pre>
 * 			</td>
 * 			<td><pre>{
 * 	"elementsAreObjects": true,
 * 	"dataContainsTuples": false
 * }</pre>
 * 			</td>
 * 			<td><pre>{
 * 	"0": [ 1, 4, 7, 10 ],
 * 	"1": [ 2, 5, 8, 11 ],
 * 	"2": [ 3, 6, 9, 12 ]
 * }</pre>
 * 			</td>
 * 		</tr>
 * 		<tr>
 * 			<td>Array with array tuples</td>
 * 			<td><pre>[
 * 	[ 1, 4, 7, 10 ],
 * 	[ 2, 5, 8, 11 ],
 * 	[ 3, 6, 9, 12 ]
 * ]</pre>
 * 			</td>
 * 			<td><pre>{
 * 	"elementsAreObjects": false,
 * 	"dataContainsTuples": true
 * }</pre>
 * 			</td>
 * 			<td><pre>[
 * 	[  1,  2,  3 ],
 * 	[  4,  5,  6 ],
 * 	[  7,  8,  9 ],
 * 	[ 10, 11, 12 ]
 * ]</pre>
 * 			</td>
 * 		</tr>
 * 		<tr>
 * 			<td>Array with array series</td>
 * 			<td><pre>[
 * 	[  1,  2,  3 ],
 * 	[  4,  5,  6 ],
 * 	[  7,  8,  9 ],
 * 	[ 10, 11, 12 ]
 * ]</pre>
 * 			</td>
 * 			<td><pre>{
 * 	"elementsAreObjects": false,
 * 	"dataContainsTuples": false
 * }</pre>
 * 			</td>
 * 			<td><pre>[
 * 	[ 1, 4, 7, 10 ],
 * 	[ 2, 5, 8, 11 ],
 * 	[ 3, 6, 9, 12 ]
 * ]</pre>
 * 			</td>
 * 		</tr>
 * 	</tbody>
 * </table></p>
 *
 * @synchronization
 * As all transformers, it works **synchronously**. See `transformers-synchronization`.
 *
 * @example
 * See [demo page](../nds-inverter/demo/index.html).
 *
 * @output dataOut : normalized data structure
 * @aka nds-inverter-dataOut
 * Returns the inverted (flipped) result. The result will have the same `normalized data structure`
 * as `nds-inverter-dataIn`.
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
		 * The configuration of this component. It defines what data structure comes
		 * in (`normalized data structure`).
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
		 * The incoming data, which must be a `normalized data structure`.
		 *
		 * @method setDataIn(dataIn : normalized data structure); See `nds-inverter-dataIn` for more details.
		 */

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

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
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectTuples, dataIn);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'dataIn param is invalid.', dataErrors));
						return false;
					}
				} else {
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectSeries, dataIn);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'dataIn param is invalid.', dataErrors));
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
								this.setError(odin.createErrorObj(this, 'dataIn series with key ' + prop + ' has not the same length of the others (' + len + ').'));
								return false;
							}
						}
					}
				}
			} else {
				var dataErrors = odin.validate.withSchema(odin.validate.schema.dataArrays, dataIn);
				if (dataErrors) {
					this.setError(odin.createErrorObj(this, 'dataIn param is invalid.', dataErrors));
					return false;
				}
				// additional length check
				for (var i = 0, length = -1; i < dataIn.length; i++) {
					var elem = dataIn[i];
					if (i === 0) {
						length = elem.length;
					} else if (length !== elem.length) {
						this.setError(odin.createErrorObj(this, 'dataIn element at ' + i + ' has not the same length of the others (' + length + ').'));
						return false;
					}
				}
			}
			return true;
		},

		_invert: function (dataIn, config) {
			var result = null;
			if (config.elementsAreObjects) {
				if (config.dataContainsTuples) {
					// Array with object tuples
					result = [];
					var keys = null;
					dataIn.forEach(function (row, rowIndex) {
						if (!keys) {
							keys = Object.keys(row);
						}
						keys.forEach(function (key, keyIndex) {
							var cellValue = row[key];
							var resultRow = result[keyIndex];
							if (!resultRow) {
								resultRow = {};
								result.push(resultRow);
							}
							resultRow[rowIndex] = cellValue;
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
				// Array with array tuples & Array with array series
				result = [];
				dataIn.forEach(function (row, rowIndex) {
					row.forEach(function (key, keyIndex) {
						var resultRow = result[keyIndex];
						if (!resultRow) {
							resultRow = [];
							result.push(resultRow);
						}
						resultRow[rowIndex] = key;
					});
				});
			}
			this.setDataOut(result);
		}
	});
}
	());
