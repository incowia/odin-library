// PLEASE NOTE: config options depend on the fast-xml-parser version
// please update all links in the documentation if dependencies change
// affected cubble artifacts: xml-to-json-converter, json-to-xml-converter, fast-xml-parser

/*
 * @class xml-to-json-converter
 *
 * This component converts XML (as string) to JSON. Uses
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
 * See [demo page](../xml-to-json-converter/demo/index.html).
 *
 * @output dataOut : Object
 * @aka xml-to-json-converter-dataOut
 * Returns the result as JSON. The result is determined by the `XTJC Config Options` of
 * the input slot `xml-to-json-converter-config`.
 *
 * @method getDataOut() : Object; See `xml-to-json-converter-dataOut` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka xml-to-json-converter-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `xml-to-json-converter-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'xml-to-json-converter',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			}
		},

		/*
		 * @input config : XTJC Config Options
		 * @aka xml-to-json-converter-config
		 * The configuration of this component. It provides different ways to influence
		 * the conversion, but its optional.
		 *
		 * @method setConfig(config : XTJC Config Options); See `xml-to-json-converter-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka XTJC Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'properties': {
				// @slotOption attributeNamePrefix : String = "@_"
				// Defines the prefix that should be prepended for XML attributes.
				'attributeNamePrefix': odin.validate.schemaPart.minString,
				// @slotOption attrNodeName : String
				// A group name that compacts all XML attributes in one JSON object with the
				// name as property key.
				'attrNodeName': odin.validate.schemaPart.minString,
				// @slotOption textNodeName : String = "#text"
				// Defines the JSON property key for XML text nodes.
				'textNodeName': odin.validate.schemaPart.minString,
				// @slotOption ignoreAttributes : Boolean = true
				// `true` if XML attributes should be ignored, otherwise `false`.
				'ignoreAttributes': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption ignoreNameSpace : Boolean = false
				// `true` if XML namespace references should be omitted, otherwise `false`.
				'ignoreNameSpace': odin.validate.schemaPart.booleanDefaultFalse,
				// @slotOption allowBooleanAttributes : Boolean = false
				// `true` if XML attributes w/o a value should be allowed and
				// interpreted as boolean, otherwise `false`.
				'allowBooleanAttributes': odin.validate.schemaPart.booleanDefaultFalse,
				// @slotOption parseNodeValue : Boolean = true
				// `true` if XML node values should be parsed to JSON values, otherwise
				// `false` if they should be strings.
				'parseNodeValue': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption parseAttributeValue : Boolean = true
				// `true` if XML attribute values should be parsed to JSON values, otherwise
				// `false` if they should be strings.
				'parseAttributeValue': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption parseAttributeValue : Boolean = true
				// `true` if all values should be trimmed (removing spaces at the beginning
				// and end).
				'trimValues': odin.validate.schemaPart.booleanDefaultTrue,
				// @slotOption cdataTagName : String
				// Defines the JSON property key for XML CDATA sections. If not defined, then the
				// CDATA section will appear in the value of the node that defined it.
				'cdataTagName': odin.validate.schemaPart.minString,
				// @slotOption cdataPositionChar : String = "\\c"
				// A marker that will be placed in the node containing a CDATA section. Useful
				// to maintain the position.
				'cdataPositionChar': odin.validate.schemaPart.minString,
				// @slotOption localeRange : String
				// Defines the acceptable character range for handling non-english element
				// and attribute names.
				'localeRange': odin.validate.schemaPart.minString
			}
		},

		/*
		 * @section
		 *
		 * @input dataIn : String
		 * @aka xml-to-json-converter-dataIn
		 * The incoming data, which is a XML string.
		 *
		 * @method setDataIn(dataIn : String); See `xml-to-json-converter-dataIn` for more details.
		 */
		jsonSchemaDataIn: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'string',
			'minLength': 1
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
			};
		},

		modelConfigChanged: function () {
			if (!this.getConfig()) {
				// config is optional, provide a default if missing
				this.model.config = {};
			}
			if (this._validate(this.getDataIn(), this.getConfig())) {
				this._convert(this.getDataIn(), this.getConfig());
			};
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

		_convert: function (dataIn, config) {
			// 'parser' is a global object provided by fast-xml-parser
			try {
				// check for specific xml errors first, so parsing is protected
				var result = parser.validate(dataIn, config);
				if (result !== true) {
					this.setError(odin.createErrorObj(this, 'String does not contain valid xml.', result.err));
					return;
				}
				this.setDataOut(parser.parse(dataIn, config));
			} catch (err) {
				this.setError(odin.createErrorObj(this, 'String is not parsable as xml.', err));
			}
		}
	});
}
	());
