// PLEASE NOTE: config options depend on the fast-xml-parser version
// please update all links in the documentation if dependencies change
// affected cubble artifacts: xml-to-json-converter, json-to-xml-converter, fast-xml-parser

/*
 * @class json-to-xml-converter
 *
 * This component converts JSON object to a XML string. Uses
 * [Fast XML Parser](https://naturalintelligence.github.io/fast-xml-parser/) for the
 * conversion.
 * The internal process starts when an input slot changes, but all other input slots
 * must be set with a valid value first. After the value is set, each change will
 * trigger the process with the current changed value of an input slot and with all
 * previously setted values of the other input slots.
 *
 * @synchronization
 * As all transformers, it works **synchronously**. See `transformers-synchronization`.
 *
 * @example
 * See [demo page](../json-to-xml-converter/demo/index.html).
 *
 * @output dataOut : String
 * @aka json-to-xml-converter-dataOut
 * Returns the result as JSON. The result is determined by the `JTXC Config Options` of
 * the input slot `json-to-xml-converter-config`.
 *
 * @method getDataOut() : Object; See `json-to-xml-converter-dataOut` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka json-to-xml-converter-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `json-to-xml-converter-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'json-to-xml-converter',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			}
		},

		/*
		 * @input config : JTXC Config Options
		 * @aka json-to-xml-converter-config
		 * The configuration of this component. It provides different ways to influence
		 * the conversion, but its optional.
		 *
		 * @method setConfig(config : JTXC Config Options); See `json-to-xml-converter-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka JTXC Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'properties': {
				// @slotOption attributeNamePrefix : String = "@_"
				// Defines the prefix that identifies properties which should be treated as
				// XML attributes.
				'attributeNamePrefix': odin.validate.schemaPart.minString,
				// @slotOption attrNodeName : String
				// A property key of an object that contains key-value pairs which should
				// be treated as XML attributes.
				'attrNodeName': odin.validate.schemaPart.minString,
				// @slotOption textNodeName : String = "#text"
				// Defines the property which should be treated as XML text node.
				'textNodeName': odin.validate.schemaPart.minString,
				// @slotOption ignoreAttributes : Boolean = true
				// `true` if properties which are treated as XML attributes should be
				// omitted, otherwise `false`.
				'ignoreAttributes': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption cdataTagName : String
				// Defines the property for the XML CDATA section.
				'cdataTagName': odin.validate.schemaPart.minString,
				// @slotOption cdataPositionChar : String = "\\c"
				// A marker that identifies an occurence of a XML CDATA section.
				'cdataPositionChar': odin.validate.schemaPart.minString,
				// @slotOption format : Boolean = false
				// `true` if the result should be formatted, otherwise `false`.
				'format': odin.validate.schemaPart.booleanDefaultFalse,
				// @slotOption indentBy : String = ""
				// Defines the indention if `format` is `true`.
				'indentBy': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption supressEmptyNode : Boolean = false
				// `true` if XML elements without any value (text or nested elements) should
				// be self closing elements (e.g. &lt;br &gt;), otherwise `false`.
				'supressEmptyNode': odin.validate.schemaPart.booleanDefaultFalse
			}
		},

		/*
		 * @section
		 *
		 * @input dataIn : Object
		 * @aka json-to-xml-converter-dataIn
		 * The incoming data, which is a JSON object.
		 *
		 * @method setDataIn(dataIn : Object); See `json-to-xml-converter-dataIn` for more details.
		 */
		jsonSchemaDataIn: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object'
		},

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

		modelDataInChanged: function () {
			if (!this.getConfig()) {
				// config is optional, provide a default if missing
				this.model.config = {};
			}
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._convert(this.getDataIn(), this.getConfig());
			}
		},

		modelConfigChanged: function () {
			if (!this.getConfig()) {
				// config is optional, provide a default if missing
				this.model.config = {};
			}
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._convert(this.getDataIn(), this.getConfig());
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
			var dataInErrors = odin.validate.withSchema(this.jsonSchemaDataIn, dataIn);
			if (dataInErrors) {
				this.setError(odin.createErrorObj(this, 'dataIn param is invalid.', dataInErrors));
				return false;
			}
			return true;
		},

		_convert: function (dataIn, config) {
			// 'parser' is a global object provided by fast-xml-parser
			try {
				var Parser = parser.j2xParser;
				var jParser = new Parser(config);
				var result = jParser.parse(dataIn);
				this.setDataOut(result);
			} catch (err) {
				this.setError(odin.createErrorObj(this, 'Object can not be converted into a xml string.', err));
			}
		}
	});
}
	());
