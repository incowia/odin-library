/*
 * @class dbpedialite-connector
 *
 * A connector which requests simple data from DBpedia (http://www.dbpedialite.org/)
 * in different output formats. The requested data must be specified by unique wikipedia
 * page ids. The internal request process starts when an input slot changes, but all other
 * input slots must be set with a valid value first. After the value is set, each change
 * will trigger the process with the current changed value of an input slot and with all
 * previously setted values of the other input slots.
 * <p>**Please note**: This connector queries all data via a non-secured protocol (http).</p>
 *
 * @synchronization
 * As all connectors, this one works **asynchronously**. See `connectors-synchronization`.
 *
 * @example
 * See [demo page](../dbpedialite-connector/demo/index.html).
 *
 * @output data : Object[]|String[]
 * @aka dbpedialite-connector-data
 * Returns an array of objects, each object contains the queried data of each given
 * wikipedia page id by the latest inputs. The order is defined by the input slots
 * `pageIds` array. The type of each element in `dbpedialite-connector-data` is
 * defined by the input slot `dbpedialite-connector-dataFormat`. The data formats
 * `JSON` and `JSON-LD` will produce objects while all others will be strings.
 *
 * @method getData() : Object[]|String[]; See `dbpedialite-connector-data` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka dbpedialite-connector-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `dbpedialite-connector-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'dbpedialite-connector',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			}
		},

		/*
		 * @input pageIds : String[]
		 * @aka dbpedialite-connector-pageIds
		 * An array of strings containing unique wikipedia page ids.
		 * A wikipedia page id is located at the "Page information"
		 * of each wikipedia article (on the left column in the section "Tools").
		 * E.g. https://en.wikipedia.org/w/index.php?title=Berlin&action=info
		 * is the page information for "Berlin".
		 *
		 * @method setPageIds(pageIds : String[]); See `dbpedialite-connector-pageIds`
		 * for more details.
		 */
		jsonSchemaPageIds: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'array',
			'uniqueItems': true,
			'items': odin.validate.schemaPart.minString
		},

		/*
		 * @input dataFormat : String
		 * @aka dbpedialite-connector-dataFormat
		 * A string enum. Value can be one of:
		 * * `JSON`
		 * - `JSON-LD`
		 * - `N-TRIPLES`
		 * - `RDF/XML`
		 * - `TRIX`
		 * - `TURTLE`
		 *
		 * @method setDataFormat(dataFormat : String); See `dbpedialite-connector-dataFormat`
		 * for more details.
		 */
		jsonSchemaDataFormat: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'string',
			'enum': [
				'JSON',
				'JSON-LD',
				'N-TRIPLES',
				'RDF/XML',
				'TRIX',
				'TURTLE'
			]
		},

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

		modelPageIdsChanged: function () {
			if (this._validate(this.getPageIds(), this.getDataFormat())) {
				this._getData(this.getPageIds(), this.getDataFormat());
			}
		},

		modelDataFormatChanged: function () {
			if (this._validate(this.getPageIds(), this.getDataFormat())) {
				this._getData(this.getPageIds(), this.getDataFormat());
			}
		},

		_validate: function (pageIds, dataFormat) {
			if (!this.isReady) {
				return false;
			}
			if (!pageIds || dataFormat === undefined || dataFormat === null) {
				return false;
			}
			var pageIdsErrors = odin.validate.withSchema(this.jsonSchemaPageIds, pageIds);
			if (pageIdsErrors) {
				this.setError(odin.createErrorObj(this, 'pageIds param is invalid.', pageIdsErrors));
				return false;
			}
			var dataFormatErrors = odin.validate.withSchema(this.jsonSchemaDataFormat, dataFormat);
			if (dataFormatErrors) {
				this.setError(odin.createErrorObj(this, 'dataFormat param is invalid.', dataFormatErrors));
				return false;
			}
			return true;
		},

		_getData: function (pageIds, dataFormat) {
			switch (dataFormat) {
			case 'JSON':
				this._queryData(pageIds, 'json', true);
				break;
			case 'JSON-LD':
				this._queryData(pageIds, 'jsonld', true);
				break;
			case 'N-TRIPLES':
				this._queryData(pageIds, 'nt', false);
				break;
			case 'RDF/XML':
				this._queryData(pageIds, 'rdf', false);
				break;
			case 'TRIX':
				this._queryData(pageIds, 'xml', false);
				break;
			case 'TURTLE':
				this._queryData(pageIds, 'ttl', false);
				break;
			default:
				break;
			}
		},

		_queryData: function (pageIds, dataExtension, isJson) {
			this._doQuery(0, pageIds, dataExtension, isJson, function (result) {
				if (Array.isArray(result)) {
					this.setData(result);
				} else {
					this.setError(odin.createErrorObj(this, 'Query resulted in an error.', result));
				}
			}
				.bind(this));
		},

		_doQuery: function (index, pageIds, dataExtension, isJson, onReady, result) {
			if (!result) {
				result = [];
			}
			if (index === pageIds.length) {
				onReady(result);
				return;
			}
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'http://www.dbpedialite.org/things/' + pageIds[index] + '.' + dataExtension);
			xhr.addEventListener('load', function (evt) {
				var target = evt.target;
				if (target.status === 200) {
					if (isJson) {
						result.push(JSON.parse(target.response));
					} else {
						result.push(target.response);
					}
					this._doQuery(++index, pageIds, dataExtension, isJson, onReady, result);
				} else {
					onReady(target);
				}
			}
				.bind(this));
			xhr.addEventListener('error', function (evt) {
				onReady(evt.target);
			});
			xhr.send();
		}
	});
}
	());
