/*
 * @class plaintext-view
 *
 * A view which displays any given data in a `<pre>` element as it is (excluding HTML
 * entities).
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
 * See [demo page](../plaintext-view/demo/index.html).
 *
 * @output onViewUpdate : View update object
 * @aka plaintext-view-onViewUpdate
 * Signals that the internal process of this view has ended successfully (this does not
 * include the rendering process).
 *
 * @method getOnViewUpdate() : View update object; See `plaintext-view-onViewUpdate` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka plaintext-view-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `plaintext-view-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'plaintext-view',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			},
			printData: {
				type: String,
				value: ''
			}
		},

		/*
		 * @input config : PTV Config Options
		 * @aka plaintext-view-config
		 * The configuration of this component. It defines how to format the content.
		 *
		 * @method setConfig(config : PTV Config Options); See `plaintext-view-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka PTV Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'properties': {
				// @slotOption wrapperClass : String
				// A css class name that can be used as selector for the entire component.
				'wrapperClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption preClass : String
				// A css class name that can be used as selector for the entire `<pre>` element.
				'preClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption space : Number|String
				// If a `Number`, then it defines the tab size (or indention) of the content
				// as spaces. As a `String` it defines the indention character sequence to use.
				'space': {
					'type': ['integer', 'string'],
					'minimum': 0,
					'default': 0
				}
			}
		},

		/*
		 * @section
		 *
		 * @input data : null|Boolean|Number|String|Object|Array
		 * @aka plaintext-view-data
		 * The incoming data to display.
		 *
		 * @method setData(data : null|Boolean|Number|String|Object|Array); See
		 * `plaintext-view-data` for more details.
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

		_getPreClass: function (config) {
			return this._getCSSClass(config, 'preClass');
		},

		_getCSSClass: function (config, className) {
			if (this.isReady && config && config[className]) {
				return config[className];
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
			this.printData = '';
			if (!this.isReady) {
				return false;
			}
			// printable data is all except 'undefined'
			if (data === undefined || !config) {
				return false;
			}
			var configErrors = odin.validate.withSchema(this.jsonSchemaConfig, config);
			if (configErrors) {
				this.setError(odin.createErrorObj(this, 'config param is invalid.', configErrors));
				return false;
			}
			return true;
		},

		_createViewData: function (data, config) {
			var str = odin.check.isString(data) ? data : JSON.stringify(data, null, config.space);
			this.printData = str;
			odin.triggerOnViewUpdate(this);
		}
	});
}
	());
