/* eslint-disable indent,comma-spacing,spaced-comment,no-trailing-spaces,padded-blocks,space-before-blocks */
(function () {
	'use strict';

	CubxPolymer({
		is: 'inverter-component',
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
				// @slotOption dataContainsTupels : Boolean = true
				// `true` if the resulting data structure is composed of data tuples,
				// otherwise `false` for data series. See `normalized data structure` for more details.
				'dataContainsTupels': odin.validate.schemaPart.booleanDefaultTrue
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
			//if (this._validate(this.getDataIn(), this.getConfig())) {
			this._createViewData(this.getDataIn(), this.getConfig());
			//}
		},

		modelConfigChanged: function () {
			//if (this._validate(this.getDataIn(), this.getConfig())) {
			this._createViewData(this.getDataIn(), this.getConfig());
			//}
		},

		_createViewData: function (data, config) {
			var dataArray;
			function dataDisplay() {
				var newObject = {};
				//dataMap = new Map(data.forEach(function(element)
				dataArray = data.forEach(function (element){

					Object.entries(element).forEach(function ([key, value]) {
						if (!newObject.hasOwnProperty(value)) {
							newObject[value] = [];
						}

						newObject[value].push(key);

						//var dataResult= `"${key}": ${value},` ;
						//console.log("dataResult : " + dataResult) ;
						//document.write(`"${key}": ${value},`);

					})

				});
/*shows object series*/
				console.log('newObject' , newObject);
				var objectFiltered = {};
				var objectFilteredTwo = {};
				var objectFilteredThree = {};
				Object.entries(newObject).forEach(function ([keyFiltered , valueFiltered]) {
					if (!objectFiltered.hasOwnProperty(keyFiltered)) {
						objectFiltered[keyFiltered] = [];
						objectFiltered[keyFiltered].push(valueFiltered[0]);
					}
					if (!objectFilteredTwo.hasOwnProperty(keyFiltered)) {
						objectFilteredTwo[keyFiltered] = [];
						objectFilteredTwo[keyFiltered].push(valueFiltered[1]);
					}
					if (!objectFilteredThree.hasOwnProperty(keyFiltered)) {
						objectFilteredThree[keyFiltered] = [];
						objectFilteredThree[keyFiltered].push(valueFiltered[2]);
					}

				});
				//console.log('objectFiltered', objectFiltered);
				//console.log('objectFilteredTwo', objectFilteredTwo);
				// console.log('objectFilteredThree', objectFilteredThree);

				var mergedArray = [];
				mergedArray.push(objectFiltered, objectFilteredTwo, objectFilteredThree);
/*shows Object Tuples*/
				console.log('mergedArray', mergedArray);
// eslint-disable-next-line indent
			};
					dataDisplay();
		}
	});
}());

