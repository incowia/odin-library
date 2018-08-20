// PLEASE NOTE: config options depend on the leaflet version (and leaflet plugins)
// please update all links in the documentation if dependencies change
// affected cubble artifacts: maplayer-view, leaflet

/*
 * @class maplayer-view
 *
 * A view which displays geographical maps and associated data. Uses [leaflet](https://leafletjs.com/)
 * and various leaflet plugins. It supports different map tile providers by name
 * (see [Leaflet-providers](http://leaflet-extras.github.io/leaflet-providers/preview/)) or url,
 * [GeoJSON](http://geojson.org/), markers, popups etc.
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
 * See [demo page](../maplayer-view/demo/index.html).
 *
 * @output onViewUpdate : View update object
 * @aka maplayer-view-onViewUpdate
 * Signals that the internal process of this view has ended successfully (this does not
 * include the rendering process).
 *
 * @method getOnViewUpdate() : View update object; See `maplayer-view-onViewUpdate` for more details.
 *
 * @output error : Error object|undefined|null
 * @aka maplayer-view-error
 * Returns an `Error object`, if an error occured while processing the latest inputs,
 * otherwise `undefined` or `null`.
 *
 * @method getError() : Error object|undefined|null; See `maplayer-view-error`
 * for more details.
 */
(function () {

	'use strict';

	CubxPolymer({
		is: 'maplayer-view',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			},
			maplayerId: {
				type: String,
				readOnly: true,
				value: function () {
					return 'maplayer-' + Math.random();
				}
			}
		},

		_maplayerInstance: null,

		/*
		 * @input config : MLV Config Options
		 * @aka maplayer-view-config
		 * The configuration of this component. It defines how to interprete the incoming
		 * data and format the map.
		 *
		 * @method setConfig(config : MLV Config Options); See `maplayer-view-config`
		 * for more details.
		 *
		 * @section Config object
		 * @aka MLV Config Options
		 * The configuration object of this component.
		 */
		jsonSchemaConfig: {
			'$schema': 'http://json-schema.org/draft-06/schema#',
			'type': 'object',
			'required': ['size', 'center', 'zoom'],
			'properties': {
				// general component options
				// @section Config object
				// @slotOption wrapperClass : String
				// A css class name that can be used as selector for the entire component.
				'wrapperClass': odin.validate.schemaPart.stringEmptyDefault,
				// @slotOption size : Object
				// A size object that contains width (optional) and height (mandatory) as
				// css values (px, %, em, rem or blank). The value can be a string or a number.
				// It defines the dimension of the maplayer component.
				// <p>**Example:**
				// <pre><code class="lang-javascript">{
				// 	height: 300,
				// 	width: '100%'
				// }</code></pre>
				// </p>
				'size': {
					'type': 'object',
					'required': ['height'],
					'properties': {
						'width': {
							'$ref': '#/definitions/sizeValue'
						},
						'height': {
							'$ref': '#/definitions/sizeValue'
						}
					}
				},
				// general leaflet map options
				// @slotOption preferCanvas : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-prefercanvas).
				'preferCanvas': odin.validate.schemaPart.boolean,
				// leaflet map control options
				// @slotOption attributionControl : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-attributioncontrol).
				'attributionControl': odin.validate.schemaPart.boolean,
				// @slotOption zoomControl : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-zoomcontrol).
				'zoomControl': odin.validate.schemaPart.boolean,
				// leaflet map interaction options
				// @slotOption closePopupOnClick : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-closepopuponclick).
				'closePopupOnClick': odin.validate.schemaPart.boolean,
				// @slotOption zoomSnap : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-zoomsnap).
				'zoomSnap': odin.validate.schemaPart.zeroPositiveNumber,
				// @slotOption zoomDelta : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-zoomdelta).
				'zoomDelta': odin.validate.schemaPart.positiveNumber,
				// @slotOption trackResize : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-trackresize).
				'trackResize': odin.validate.schemaPart.boolean,
				// @slotOption boxZoom : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-boxzoom).
				'boxZoom': odin.validate.schemaPart.boolean,
				// @slotOption doubleClickZoom : Boolean|String
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-doubleclickzoom).
				'doubleClickZoom': {
					'$ref': '#/definitions/zoomValue'
				},
				// @slotOption dragging : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-dragging).
				'dragging': odin.validate.schemaPart.boolean,
				// leaflet map state options
				// @slotOption center : LatLng
				// See `LatLng` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-center).
				'center': {
					'$ref': '#/definitions/latLng'
				},
				// @slotOption zoom : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-zoom).
				'zoom': odin.validate.schemaPart.positiveInteger,
				// @slotOption minZoom : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-minzoom).
				'minZoom': odin.validate.schemaPart.zeroPositiveInteger,
				// @slotOption maxZoom : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-maxzoom).
				'maxZoom': odin.validate.schemaPart.positiveInteger,
				// @slotOption maxBounds : LatLngBounds
				// See `LatLngBounds` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-maxbounds).
				'maxBounds': {
					'$ref': '#/definitions/latLngBounds'
				},
				// @slotOption renderer : String
				// `SVG` or `Canvas`. See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-renderer).
				'renderer': {
					'type': 'string',
					'enum': ['SVG', 'Canvas']
				},
				// leaflet map animation options
				// @slotOption zoomAnimation : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-zoomanimation).
				'zoomAnimation': odin.validate.schemaPart.boolean,
				// @slotOption maxZoom : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-zoomanimationthreshold).
				'zoomAnimationThreshold': odin.validate.schemaPart.zeroPositiveNumber,
				// @slotOption fadeAnimation : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-fadeanimation).
				'fadeAnimation': odin.validate.schemaPart.boolean,
				// @slotOption markerZoomAnimation : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-markerzoomanimation).
				'markerZoomAnimation': odin.validate.schemaPart.boolean,
				// @slotOption transform3DLimit : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-transform3dlimit).
				'transform3DLimit': odin.validate.schemaPart.positiveNumber,
				// leaflet map panning inertia options
				// @slotOption inertia : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-inertia).
				'inertia': odin.validate.schemaPart.boolean,
				// @slotOption inertiaDeceleration : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-inertiadeceleration).
				'inertiaDeceleration': odin.validate.schemaPart.positiveNumber,
				// @slotOption inertiaMaxSpeed : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-inertiamaxspeed).
				'inertiaMaxSpeed': odin.validate.schemaPart.positiveNumber,
				// @slotOption easeLinearity : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-easelinearity).
				'easeLinearity': odin.validate.schemaPart.positiveNumber,
				// @slotOption worldCopyJump : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-worldcopyjump).
				'worldCopyJump': odin.validate.schemaPart.boolean,
				// @slotOption maxBoundsViscosity : Number
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-maxboundsviscosity).
				'maxBoundsViscosity': odin.validate.schemaPart.zeroPositiveNumber,
				// leaflet map keyboard navigation options
				// @slotOption keyboard : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-keyboard).
				'keyboard': odin.validate.schemaPart.boolean,
				// @slotOption keyboardPanDelta : Integer
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-keyboardpandelta).
				'keyboardPanDelta': odin.validate.schemaPart.positiveInteger,
				// leaflet map mousewheel options
				// @slotOption scrollWheelZoom : Boolean|String
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-scrollwheelzoom).
				'scrollWheelZoom': {
					'$ref': '#/definitions/zoomValue'
				},
				// @slotOption wheelDebounceTime : Integer
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-wheeldebouncetime).
				'wheelDebounceTime': odin.validate.schemaPart.positiveInteger,
				// @slotOption wheelPxPerZoomLevel : Integer
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-wheelpxperzoomlevel).
				'wheelPxPerZoomLevel': odin.validate.schemaPart.positiveInteger,
				// leaflet map touch interaction options
				// @slotOption tap : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-tap).
				'tap': odin.validate.schemaPart.boolean,
				// @slotOption tapTolerance : Integer
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-taptolerance).
				'tapTolerance': odin.validate.schemaPart.positiveInteger,
				// @slotOption touchZoom : Boolean|String
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-touchzoom).
				'touchZoom': {
					'$ref': '#/definitions/zoomValue'
				},
				// @slotOption bounceAtZoomLimits : Boolean
				// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#map-bounceatzoomlimits).
				'bounceAtZoomLimits': odin.validate.schemaPart.boolean,
				// component layer options
				// @slotOption tileLayers : TileLayer[]
				// An array of `TileLayer` elements, with each element defining a tile layer for the map.
				// Each definition must be unique.
				'tileLayers': {
					'type': 'array',
					'uniqueItems': true,
					'items': {
						'oneOf': [{
								// @section TileLayer object
								// @aka TileLayer
								// @aka TileLayer[]
								// A tile layer defines how to get tiles from a map tile provider and display them. A
								// map tile provider can be defined via a name
								// (see [Leaflet-providers](http://leaflet-extras.github.io/leaflet-providers/preview/))
								// **or** url.
								'allOf': [{
										// general leaflet tileLayer options
										'$ref': '#/definitions/tileLayerBase'
									}, {
										'required': ['provider'],
										'properties': {
											// @slotOption provider : String
											// This option enables one to use a specific identifier to easily define a tile layer.
											// Some identifiers may pre-define some options. One can overwrite these by setting them in this options object.
											// Some tile map providers need additional options, which can be set in this options object directly (e.g. api token).
											// Please do not use reserved option names.
											// For the identifiers & additional options see [Leaflet-providers](http://leaflet-extras.github.io/leaflet-providers/preview/).
											// <br/>**Please note**: Do not use this together with the <code>url</code> option.
											'provider': odin.validate.schemaPart.minString
										}
									}
								]
							}, {
								'allOf': [{
										// general leaflet tileLayer options
										'$ref': '#/definitions/tileLayerBase'
									}, {
										'required': ['url'],
										'properties': {
											/*
											 * @slotOption url : String
											 * This string needs to be a valid URI template ([RFC 6570](https://tools.ietf.org/html/rfc6570)),
											 * which points to the tile data of the map tile provider.
											 * <br/>E.g. <code>http://{s}.somedomain.com/somefolder/{z}/{x}/{y}{r}.png?{additionalParam}</code> with
											 * <p><table class="table table-hover table-bordered table-sm">
											 * 	<thead class="thead-dark">
											 * 		<th scope="col" style="white-space:nowrap;">uri param</th>
											 * 		<th scope="col" style="white-space:nowrap;">param type</th>
											 * 		<th scope="col" style="white-space:nowrap;">description</th>
											 * 	</thead>
											 * 	<tbody>
											 * 		<tr>
											 * 			<td><code class="text-nowrap">s</code></td>
											 * 			<td>reserved</td>
											 * 			<td>subdomains, will be set by leaflet</td>
											 * 		</tr>
											 * 		<tr>
											 * 			<td><code class="text-nowrap">z</code></td>
											 * 			<td>reserved</td>
											 * 			<td>zoom level, will be set by leaflet</td>
											 * 		</tr>
											 * 		<tr>
											 * 			<td><code class="text-nowrap">x</code></td>
											 * 			<td>reserved</td>
											 * 			<td>the horizontal coordinate of the tile, will be set by leaflet</td>
											 * 		</tr>
											 * 		<tr>
											 * 			<td><code class="text-nowrap">y</code></td>
											 * 			<td>reserved</td>
											 * 			<td>the vertical coordinate of the tile, will be set by leaflet</td>
											 * 		</tr>
											 * 		<tr>
											 * 			<td><code class="text-nowrap">r</code></td>
											 * 			<td>reserved, optional</td>
											 * 			<td>resolution of the tile, will be set by leaflet</td>
											 * 		</tr>
											 * 		<tr>
											 * 			<td><code class="text-nowrap">additionalParam</code></td>
											 * 			<td>optional</td>
											 * 			<td>additional options, which can be set in this options object directly (e.g. api token), please do not use reserved option names</td>
											 * 		</tr>
											 * 	</tbody>
											 * </table></p>
											 * Also see [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer).
											 * <br/>**Please note**: Do not use this together with the <code>provider</code> option.
											 */
											'url': odin.validate.schemaPart.uriTemplateString
										}
									}
								]
							}
						]
					}
				},
				// @section Config object
				// @slotOption markerLayers : MarkerLayer[]
				// An array of `MarkerLayer` elements, with each element defining a marker for the map.
				// Each definition must be unique.
				'markerLayers': {
					'type': 'array',
					'uniqueItems': true,
					'items': {
						'type': 'object',
						'required': ['lat', 'lng'],
						'properties': {
							// general leaflet marker options
							// @section MarkerLayer object
							// @aka MarkerLayer
							// @aka MarkerLayer[]
							// A marker layer places icons on the map. A marker layer can be defined
							// statically or template-like. A template-like marker layer uses the `maplayer-view-data`
							// to generate the final markers and some options need to use the `Odin Path w/ parsing` type
							// to point to the final value to use (<code>dataPath, lat, lng</code>), other options may be set
							// directly in this config object or also point to a value in `maplayer-view-data`.
							//
							// @slotOption icon : Icon object
							// The icon to use for the markers.
							'icon': {
								'$ref': '#/definitions/icon'
							},
							// @slotOption popup : Popup object
							// Defines a popup (template) and its content for all markers.
							'popup': {
								'$ref': '#/definitions/leafletPopup'
							}
						},
						'oneOf': [{
								'properties': {
									'lat': {
										'$ref': '#/definitions/latitude'
									},
									'lng': {
										'$ref': '#/definitions/longitude'
									},
									// general leaflet marker options
									'draggable': odin.validate.schemaPart.boolean,
									'keyboard': odin.validate.schemaPart.boolean,
									'title': odin.validate.schemaPart.minString,
									'alt': odin.validate.schemaPart.minString,
									'zIndexOffset': odin.validate.schemaPart.integer,
									'opacity': odin.validate.schemaPart.percent,
									'riseOnHover': odin.validate.schemaPart.boolean,
									'riseOffset': odin.validate.schemaPart.integer,
									'interactive': odin.validate.schemaPart.boolean,
									'attribution': odin.validate.schemaPart.minString
								}
							}, {
								'required': ['dataPath'],
								'properties': {
									// @slotOption dataPath : Odin Path w/o parsing
									// A path to the data to use for all template-like markers.
									// The path must result in an array with objects (each object defines a marker).
									// The resulting potion of `maplayer-view-data` will be used to get the values of all
									// other options that uses the `Odin Path w/ parsing` type.
									// <br/>**Please note**: Using the `Odin Path w/ parsing` type for the <code>lat</code> & <code>lng</code> options requires the definition of this option.
									'dataPath': odin.path.schemaPart,
									// @slotOption lat : Number|Odin Path w/ parsing
									// The value for the latitude (between `-90` and `90`, both inclusive) for
									// a static or `Odin Path w/ parsing` for a template-like marker.
									// <br/>**Please note**: Using `Odin Path w/ parsing` requires the <code>lng</code> option to be of the same type.
									'lat': odin.path.schemaPartWithParse,
									// @slotOption lng : Number|Odin Path w/ parsing
									// The value for the longitude (between `-180` and `180`, both inclusive) for
									// a static or `Odin Path w/ parsing` for a template-like marker.
									// <br/>**Please note**: Using `Odin Path w/ parsing` requires the <code>lat</code> option to be of the same type.
									'lng': odin.path.schemaPartWithParse,
									// general leaflet marker options
									// @slotOption draggable : Boolean|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-draggable).
									'draggable': {
										'oneOf': [odin.validate.schemaPart.boolean, odin.path.schemaPartWithParse]
									},
									// @slotOption keyboard : Boolean|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-keyboard).
									'keyboard': {
										'oneOf': [odin.validate.schemaPart.boolean, odin.path.schemaPartWithParse]
									},
									// @slotOption title : String|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-title).
									'title': {
										'oneOf': [odin.validate.schemaPart.notJsonPointerString, odin.path.schemaPartWithParse]
									},
									// @slotOption alt : String|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-alt).
									'alt': {
										'oneOf': [odin.validate.schemaPart.notJsonPointerString, odin.path.schemaPartWithParse]
									},
									// @slotOption zIndexOffset : Integer|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-zindexoffset).
									'zIndexOffset': {
										'oneOf': [odin.validate.schemaPart.integer, odin.path.schemaPartWithParse]
									},
									// @slotOption opacity : Percent|Odin Path w/ parsing
									// See `Percent` & see [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-opacity).
									'opacity': {
										'oneOf': [odin.validate.schemaPart.percent, odin.path.schemaPartWithParse]
									},
									// @slotOption riseOnHover : Boolean|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-riseonhover).
									'riseOnHover': {
										'oneOf': [odin.validate.schemaPart.boolean, odin.path.schemaPartWithParse]
									},
									// @slotOption riseOffset : Integer|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-riseoffset).
									'riseOffset': {
										'oneOf': [odin.validate.schemaPart.integer, odin.path.schemaPartWithParse]
									},
									// @slotOption interactive : Boolean|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-interactive).
									'interactive': {
										'oneOf': [odin.validate.schemaPart.boolean, odin.path.schemaPartWithParse]
									},
									// @slotOption attribution : String|Odin Path w/ parsing
									// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#marker-attribution).
									'attribution': {
										'oneOf': [odin.validate.schemaPart.notJsonPointerString, odin.path.schemaPartWithParse]
									}
								}
							}
						]
					}
				},
				// @section Config object
				// @slotOption geoJsonLayers : GeoJsonLayer[]
				// An array of `GeoJsonLayer` elements, with each element defining a layer based on
				// [GeoJSON](http://geojson.org/) for the map.
				// Each definition must be unique.
				'geoJsonLayers': {
					'type': 'array',
					'uniqueItems': true,
					'items': {
						'type': 'object',
						'required': ['dataPath'],
						'properties': {
							// @section GeoJsonLayer object
							// @aka GeoJsonLayer
							// @aka GeoJsonLayer[]
							// A GeoJsonLayer displayes geometric objects on the map that are defined by
							// [GeoJSON](http://geojson.org/) data. It also features the ability to render
							// them as a <code>choropleth</code> map.
							//
							// @slotOption dataPath : Odin Path w/o parsing
							// A path to the data to use. The path must result in a valid [GeoJSON](http://geojson.org/)
							// data structure that will be used for the rendering.
							'dataPath': odin.path.schemaPart,
							// @slotOption popup : Popup object
							// Defines a popup (template) and its content for all [GeoJSON](http://geojson.org/) feature objects.
							'popup': {
								'$ref': '#/definitions/leafletPopup'
							},
							// @slotOption choropleth : Choropleth object
							// Defines the choropleth map. Can only be used if the [GeoJSON](http://geojson.org/)
							// data contains feature objects.
							'choropleth': {
								'type': 'object',
								'required': ['valueProperty', 'mode', 'steps', 'colors'],
								'properties': {
									// leaflet choropleth options
									// @section Choropleth object
									// @aka Choropleth object
									// Defines how the choropleth map will be rendered. Uses the [Leaflet Choropleth](https://github.com/timwis/leaflet-choropleth) plugin.
									//
									// @slotOption valueProperty : String
									// A reference to the value that should be used as scaling value. The reference
									// must be a key that is valid for each <code>properties</code> section
									// of each [GeoJSON](http://geojson.org/) feature object.
									'valueProperty': odin.validate.schemaPart.minString,
									// @slotOption mode : String
									// The scaling computation mode. `quantile`, `equidistant` or `k-means`.
									'mode': {
										'enum': ['quantile', 'equidistant', 'k-means']
									},
									// @slotOption scale : Boolean = true
									// `true`, if the scale should be computed automatically, otherwise `false`.
									'scale': odin.validate.schemaPart.booleanDefaultTrue,
									// @slotOption steps : Integer
									// The number of breaks of the scaling.
									// <br/>**Please note**: if the `scale` option is `false`, then the this option
									// defines how many elements are in the <code>colors</code> option.
									'steps': odin.validate.schemaPart.positiveInteger,
									// @slotOption colors : Array
									// An array of strings. Each String must be a valid html color.
									// <br/>**Please note**: if the `scale` option is `false`, then the this option
									// must contain as many elements as the <code>steps</code> option states.
									'colors': {
										'$ref': '#/definitions/htmlColors'
									}
								}
							},
							// general leaflet geojson options
							// @section GeoJsonLayer object
							// @slotOption attribution : String
							// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#geojson-attribution).
							'attribution': odin.validate.schemaPart.minString,
							// @slotOption style : Pathstyle object
							// An object with styling information for each [GeoJSON](http://geojson.org/) feature object.
							'style': {
								'$ref': '#/definitions/pathStyle'
							}
						}
					}
				}
			},
			'definitions': {
				// @section TileLayer object
				'tileLayerBase': {
					'type': 'object',
					'properties': {
						// @slotOption minZoom : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-minzoom).
						'minZoom': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption maxZoom : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-maxzoom).
						'maxZoom': odin.validate.schemaPart.positiveInteger,
						// @slotOption maxNativeZoom : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-maxnativezoom).
						'maxNativeZoom': odin.validate.schemaPart.positiveInteger,
						// @slotOption minNativeZoom : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-minnativezoom).
						'minNativeZoom': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption subdomains : String|String[]
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-subdomains).
						'subdomains': {
							'oneOf': [odin.validate.schemaPart.minString, {
									'type': 'array',
									'uniqueItems': true,
									'minItems': 1,
									'items': odin.validate.schemaPart.minString
								}
							]
						},
						// @slotOption errorTileUrl : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-errortileurl).
						'errorTileUrl': odin.validate.schemaPart.urlString,
						// @slotOption zoomOffset : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-zoomoffset).
						'zoomOffset': odin.validate.schemaPart.integer,
						// @slotOption tms : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-tms).
						'tms': odin.validate.schemaPart.boolean,
						// @slotOption zoomReverse : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-zoomreverse).
						'zoomReverse': odin.validate.schemaPart.boolean,
						// @slotOption detectRetina : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-detectretina).
						'detectRetina': odin.validate.schemaPart.boolean,
						// @slotOption crossOrigin : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-crossorigin).
						'crossOrigin': odin.validate.schemaPart.boolean,
						// @slotOption tileSize : Integer|Point
						// Defines the size of the tile in pixel. An Integer value will define width & height,
						// a `Point` object defines the width as `x` & the height as `y`.
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-tilesize).
						'tileSize': {
							'$ref': '#/definitions/leafletSizeValue'
						},
						// @slotOption opacity : Percent
						// See `Percent` & see [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-opacity).
						'opacity': odin.validate.schemaPart.percent,
						// @slotOption updateWhenIdle : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-updatewhenidle).
						'updateWhenIdle': odin.validate.schemaPart.boolean,
						// @slotOption updateWhenZooming : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-updatewhenzooming).
						'updateWhenZooming': odin.validate.schemaPart.boolean,
						// @slotOption updateInterval : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-updateinterval).
						'updateInterval': odin.validate.schemaPart.positiveInteger,
						// @slotOption zIndex : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-zindex).
						'zIndex': odin.validate.schemaPart.integer,
						// @slotOption bounds : LatLngBounds
						// See `LatLngBounds` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-bounds).
						'bounds': {
							'$ref': '#/definitions/latLngBounds'
						},
						// @slotOption className : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-classname).
						'className': odin.validate.schemaPart.minString,
						// @slotOption keepBuffer : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-keepbuffer).
						'keepBuffer': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption className : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#tilelayer-attribution).
						'attribution': odin.validate.schemaPart.minString
					}
				},
				'latitude': {
					'type': 'number',
					'minimum': -90,
					'maximum': 90
				},
				'longitude': {
					'type': 'number',
					'minimum': -180,
					'maximum': 180
				},
				// @section LatLng object
				// @aka LatLng
				// An object that contains latitude and longitude.
				// <p>**Example:**
				// <pre><code class="lang-javascript">{
				// 	lat: 15.1, lng: 103.54
				// }</code></pre>
				// </p>
				'latLng': {
					'type': 'object',
					'required': ['lat', 'lng'],
					'properties': {
						// @slotOption lat : Number
						// The value for the latitude (between `-90` and `90`, both inclusive).
						'lat': {
							'$ref': '#/definitions/latitude'
						},
						// @slotOption lng : Number
						// The value for the longitude (between `-180` and `180`, both inclusive).
						'lng': {
							'$ref': '#/definitions/longitude'
						}
					}
				},
				// @section LatLngBounds object
				// @aka LatLngBounds
				// An **array** that contains exactly 2 `LatLng` objects.
				// <p>**Example:**
				// <pre><code class="lang-javascript">[{
				// 	lat: 15.1, lng: 103.54
				// }, {
				// 	lat: 20.8, lng: 105.3
				// }]</code></pre>
				// </p>
				'latLngBounds': {
					'type': 'array',
					'minItems': 2,
					'maxItems': 2,
					// @slotOption first : LatLng
					// The values for the top-left corner.
					// @slotOption second : LatLng
					// The values for the bottom-right corner.
					'items': {
						'$ref': '#/definitions/latLng'
					}
				},
				// @section Point object
				// @aka Point
				// An object representing a point with a x & y value.
				// <p>**Example:**
				// <pre><code class="lang-javascript">{
				// 	x: 10, y: 20
				// }</code></pre>
				// </p>
				'integerPoint': {
					'type': 'object',
					'required': ['x', 'y'],
					'properties': {
						// @slotOption x : Integer
						// The value for x.
						'x': odin.validate.schemaPart.integer,
						// @slotOption y : Integer
						// The value for y.
						'y': odin.validate.schemaPart.integer
					}
				},
				'zeroPositiveIntegerPoint': {
					'type': 'object',
					'required': ['x', 'y'],
					'properties': {
						'x': odin.validate.schemaPart.zeroPositiveInteger,
						'y': odin.validate.schemaPart.zeroPositiveInteger
					}
				},
				'leafletSizeValue': {
					'oneOf': [{
							'$ref': '#/definitions/zeroPositiveIntegerPoint'
						}, odin.validate.schemaPart.zeroPositiveInteger
					]
				},
				// @section Icon object
				// @aka Icon object
				// The definition of an icon. An icon can be defined either as a div element with a specific
				// style (see [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#divicon)) or with an url.
				'icon': {
					'oneOf': [{
							'$ref': '#/definitions/divIcon'
						}, {
							'$ref': '#/definitions/urlIcon'
						}
					]
				},
				'iconBase': {
					'type': 'object',
					'properties': {
						// general leaflet icon options
						// @slotOption iconSize : Integer|Point
						// Defines the size of the icon in pixel. An Integer value will define width & height,
						// a `Point` object defines the width as `x` & the height as `y`.
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-iconsize).
						'iconSize': {
							'$ref': '#/definitions/leafletSizeValue'
						},
						// @slotOption iconAnchor : Point
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-iconanchor).
						'iconAnchor': {
							'$ref': '#/definitions/integerPoint'
						},
						// @slotOption popupAnchor : Point
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-popupanchor).
						'popupAnchor': {
							'$ref': '#/definitions/integerPoint'
						},
						'className': odin.validate.schemaPart.minString,
						// @slotOption attribution : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-attribution).
						'attribution': odin.validate.schemaPart.minString
					}
				},
				'divIcon': {
					'allOf': [{
							'$ref': '#/definitions/iconBase'
						}, {
							// @slotOption className : String
							// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-classname).
							// <br/>**Please note**: Defining a div icon requires the definition of this option,
							// but url icons can use this option, too. If one wants a div icon, then the
							// <code>iconUrl</code> option should not be defined.
							'required': ['className'],
							'properties': {
								// general leaflet icon div options
								// @slotOption html : String
								// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#divicon-html).
								// <br/>**Please note**: Only for div icons.
								'html': odin.validate.schemaPart.minString,
								// @slotOption bgPos : Point
								// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#divicon-bgpos).
								// <br/>**Please note**: Only for div icons.
								'bgPos': {
									'$ref': '#/definitions/integerPoint'
								}
							},
							'not': {
								'required': ['iconUrl']
							}
						}
					]
				},
				'urlIcon': {
					'allOf': [{
							'$ref': '#/definitions/iconBase'
						}, {
							'required': ['iconUrl'],
							'properties': {
								// general leaflet icon url options
								// @slotOption iconUrl : String
								// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-iconurl).
								// <br/>**Please note**: Defining a url icon requires the definition of this option.
								'iconUrl': odin.validate.schemaPart.urlString,
								// @slotOption iconRetinaUrl : String
								// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-iconretinaurl).
								// <br/>**Please note**: Only for url icons.
								'iconRetinaUrl': odin.validate.schemaPart.urlString,
								// @slotOption shadowUrl : String
								// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-shadowurl).
								// <br/>**Please note**: Only for url icons.
								'shadowUrl': odin.validate.schemaPart.urlString,
								// @slotOption shadowRetinaUrl : String
								// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-shadowretinaurl).
								// <br/>**Please note**: Only for url icons.
								'shadowRetinaUrl': odin.validate.schemaPart.urlString,
								// @slotOption shadowSize : Integer|Point
								// Defines the size of the icons shadow in pixel. An Integer value will define width & height,
								// a `Point` object defines the width as `x` & the height as `y`.
								// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-shadowsize).
								// <br/>**Please note**: Only for url icons.
								'shadowSize': {
									'$ref': '#/definitions/leafletSizeValue'
								},
								// @slotOption shadowAnchor : Point
								// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#icon-shadowanchor).
								// <br/>**Please note**: Only for url icons.
								'shadowAnchor': {
									'$ref': '#/definitions/integerPoint'
								}
							}
						}
					]
				},
				'sizeValue': {
					'oneOf': [{
							'type': 'string',
							'pattern': '^(0|[1-9]\\d*){1}(px|PX|%|em|EM|rem|REM)?$'
						}, odin.validate.schemaPart.zeroPositiveInteger
					]
				},
				'zoomValue': {
					'oneOf': [odin.validate.schemaPart.boolean, {
							'type': 'string',
							'const': 'center'
						}
					]
				},
				'htmlColors': {
					'type': 'array',
					'minItems': 1,
					'items': odin.validate.schemaPart.htmlColor
				},
				// @section Pathstyle object
				// @aka Pathstyle object
				// Defines all styling options for vector-based overlays. E.g. used in `GeoJsonLayer`.
				'pathStyle': {
					'type': 'object',
					'properties': {
						// general leaflet path options
						// @slotOption stroke : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-stroke).
						'stroke': odin.validate.schemaPart.boolean,
						// @slotOption color : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-color).
						'color': odin.validate.schemaPart.htmlColor,
						// @slotOption weight : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-weight).
						'weight': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption opacity : Percent
						// See `Percent` & see [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-opacity).
						'opacity': odin.validate.schemaPart.percent,
						// @slotOption lineCap : String
						// `butt`, `round`, `square` or `inherit`. See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-linecap).
						'lineCap': {
							'enum': ['butt', 'round', 'square', 'inherit']
						},
						// @slotOption lineJoin : String
						// `butt`, `round`, `square` or `inherit`. See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-linejoin).
						'lineJoin': {
							'enum': ['miter', 'round', 'bevel', 'inherit']
						},
						// @slotOption dashArray : String
						// `none`, `inherit` or any other valid stroke dash pattern. See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-dasharray).
						'dashArray': {
							'anyOf': [odin.validate.schemaPart.minString, {
									'enum': ['none', 'inherit']
								}
							]
						},
						// @slotOption dashOffset : String
						// `inherit` or any other valid stroke dash offset. See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-dashoffset).
						'dashOffset': {
							'anyOf': [odin.validate.schemaPart.minString, {
									'const': 'inherit'
								}
							]
						},
						// @slotOption fill : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-fill).
						'fill': odin.validate.schemaPart.boolean,
						// @slotOption fillColor : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-fillcolor).
						'fillColor': odin.validate.schemaPart.htmlColor,
						// @slotOption fillOpacity : Percent
						// See `Percent` & see [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-fillopacity).
						'fillOpacity': odin.validate.schemaPart.percent,
						// @slotOption fillRule : String
						// `nonzero`, `evenodd` or `inherit`. See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-fillrule).
						'fillRule': {
							'enum': ['nonzero', 'evenodd', 'inherit']
						},
						// @slotOption className : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-classname).
						'className': odin.validate.schemaPart.minString,
						// @slotOption interactive : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-interactive).
						'interactive': odin.validate.schemaPart.boolean,
						// @slotOption attribution : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#path-attribution).
						'attribution': odin.validate.schemaPart.minString
					}
				},
				// @section Popup object
				// @aka Popup object
				// The definition of a popup.
				'leafletPopup': {
					'type': 'object',
					'required': ['content'],
					'properties': {
						// @slotOption title : String|Odin Path w/ parsing
						// The title of the popup. Can be defined statically or template-like with
						// the `Odin Path w/ parsing` type. The data potion that will be queried is defined by
						// the object that also defines this popup. E.g. for a static marker the data potion will
						// be the whole `maplayer-view-data`, for a template-like marker it will be the data potion
						// that resulted by quering the `MarkerLayer`.<code>dataPath</code> option.
						'title': {
							'oneOf': [odin.validate.schemaPart.notJsonPointerString, odin.path.schemaPartWithParse]
						},
						// @slotOption errorText : String
						// A string to show if the popup content couldn't be generated. A default value is provided.
						'errorText': {
							'type': 'string',
							'minLength': 1,
							'default': 'There was an error while generating the popup content. See console for more information.'
						},
						/*
						 * @slotOption content : String|Object
						 * The definition of the content. Can be a string or an view component.
						 * <p><table class="table table-hover table-bordered table-sm">
						 * 	<thead class="thead-dark">
						 * 		<th scope="col" style="white-space:nowrap;">content</th>
						 * 		<th scope="col" style="white-space:nowrap;">usage</th>
						 * 	</thead>
						 * 	<tbody>
						 * 		<tr>
						 * 			<td>Text</td>
						 * 			<td>
						 * 				<pre><code class="lang-javascript">"content": "Just a plain simple string to display."</code></pre>
						 * 			</td>
						 * 		</tr>
						 * 		<tr>
						 * 			<td>Plain text</td>
						 * 			<td>
						 * <pre><code class="lang-javascript">"content": {
						 * 	"dataPath": "/plaintextData",
						 * 	"component": {
						 * 		"view": "plaintext",
						 * 		"config": {...}
						 * 	}
						 * }</code></pre>
						 * 				<code>content.dataPath</code> = The data potion that will be queried is defined by
						 * 				the object that also defines this popup. E.g. for a static marker the data potion will
						 * 				be the whole `maplayer-view-data`, for a template-like marker it will be the data potion
						 * 				that resulted by quering the `MarkerLayer`.<code>dataPath</code> option.
						 * 				<br/><code>content.component.config</code> = see `plaintext-view`
						 * 			</td>
						 * 		</tr>
						 * 		<tr>
						 * 			<td>Table</td>
						 * 			<td>
						 * <pre><code class="lang-javascript">"content": {
						 * 	"dataPath": "/tableData",
						 * 	"component": {
						 * 		"view": "table",
						 * 		"config": {...}
						 * 	}
						 * }</code></pre>
						 * 				<code>content.dataPath</code> = The data potion that will be queried is defined by
						 * 				the object that also defines this popup. E.g. for a static marker the data potion will
						 * 				be the whole `maplayer-view-data`, for a template-like marker it will be the data potion
						 * 				that resulted by quering the `MarkerLayer`.<code>dataPath</code> option.
						 * 				<br/><code>content.component.config</code> = see `table-view`
						 * 			</td>
						 * 		</tr>
						 * 		<tr>
						 * 			<td>Chart</td>
						 * 			<td>
						 * <pre><code class="lang-javascript">"content": {
						 * 	"dataPath": "/chartData",
						 * 	"component": {
						 * 		"view": "chart",
						 * 		"config": {...}
						 * 	}
						 * }</code></pre>
						 * 				<code>content.dataPath</code> = The data potion that will be queried is defined by
						 * 				the object that also defines this popup. E.g. for a static marker the data potion will
						 * 				be the whole `maplayer-view-data`, for a template-like marker it will be the data potion
						 * 				that resulted by quering the `MarkerLayer`.<code>dataPath</code> option.
						 * 				<br/><code>content.component.config</code> = see `chart-view`
						 * 			</td>
						 * 		</tr>
						 * 	</tbody>
						 * </table></p>
						 */
						'content': {
							'oneOf': [odin.validate.schemaPart.minString, {
									'type': 'object',
									'required': ['dataPath', 'component'],
									'properties': {
										'dataPath': odin.path.schemaPart,
										'component': {
											'type': 'object',
											'required': ['view', 'config'],
											'properties': {
												'view': {
													'enum': ['plaintext', 'table', 'chart']
												},
												'config': {
													'type': 'object'
												}
											}
										}
									}
								}
							]
						},
						// general leaflet popup options
						// @slotOption maxWidth : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-maxwidth).
						'maxWidth': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption minWidth : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-minwidth).
						'minWidth': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption maxHeight : Integer
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-maxheight).
						'maxHeight': odin.validate.schemaPart.zeroPositiveInteger,
						// @slotOption autoPan : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-autopan).
						'autoPan': odin.validate.schemaPart.boolean,
						// @slotOption autoPanPaddingTopLeft : Point
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-autopanpaddingtopleft).
						'autoPanPaddingTopLeft': {
							'$ref': '#/definitions/integerPoint'
						},
						// @slotOption autoPanPaddingBottomRight : Point
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-autopanpaddingbottomright).
						'autoPanPaddingBottomRight': {
							'$ref': '#/definitions/integerPoint'
						},
						// @slotOption autoPanPadding : Point
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-autopanpadding).
						'autoPanPadding': {
							'$ref': '#/definitions/integerPoint'
						},
						// @slotOption keepInView : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-keepinview).
						'keepInView': odin.validate.schemaPart.boolean,
						// @slotOption closeButton : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-autopan).
						'closeButton': odin.validate.schemaPart.boolean,
						// @slotOption closeOnClick : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-closebutton).
						'closeOnClick': odin.validate.schemaPart.boolean,
						// @slotOption autoClose : Boolean
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-autoclose).
						'autoClose': odin.validate.schemaPart.boolean,
						// @slotOption className : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-classname).
						'className': odin.validate.schemaPart.minString,
						// @slotOption offset : Point
						// See `Point` & [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-offset).
						'offset': {
							'$ref': '#/definitions/integerPoint'
						},
						// @slotOption attribution : String
						// See [leaflet API Reference](https://leafletjs.com/reference-1.0.3.html#popup-attribution).
						'attribution': odin.validate.schemaPart.minString
					}
				}
			}
		},

		/*
		 * @section
		 *
		 * @input data : *
		 * @aka maplayer-view-data
		 * The incoming data for the map.
		 *
		 * @method setData(data : *); See `maplayer-view-data` for more details.
		 */

		created: function () {},

		ready: function () {
			this.isReady = true;
		},

		attached: function () {},

		cubxReady: function () {},

		_getWrapperClass: function (config) {
			if (this.isReady && config && config.wrapperClass) {
				return config.wrapperClass;
			}
			return '';
		},

		_getSize: function (config) {
			if (this.isReady && config && config.size) {
				var result = '';
				if (config.size.width) {
					result = result.concat('width:' + config.size.width + ';');
				}
				if (config.size.height) {
					result = result.concat('height:' + config.size.height + ';');
				}
				return result;
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
			if (!this.isReady) {
				return false;
			}
			// no config, no map
			if (!config) {
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
			try {
				// leaflet recommends to create a new map each time
				if (this._maplayerInstance) {
					this._maplayerInstance.off();
					this._maplayerInstance.remove();
				}
				var mapOptions = odin.copyObject(config, function (k) {
						// filter out all properties that don't belong to the leaflet map options
						return k !== 'wrapperClass' && k !== 'size' && k !== 'tileLayers' && k !== 'markerLayer';
					}, function (k, v) {
						// some properties needs to be transformed for leaflet
						switch (k) {
							case 'center':
								return L.latLng(v.lat, v.lng);
							case 'maxBounds':
								return L.latLngBounds(L.latLng(v[0].lat, v[0].lng), L.latLng(v[1].lat, v[1].lng));
							case 'renderer':
								switch (v) {
									case 'SVG':
										return L.svg();
									case 'Canvas':
										return L.canvas();
								}
							default:
								return v;
						}
					});
				this._maplayerInstance = L.map(this.maplayerId, mapOptions);
				if (!this._createTileLayers(config.tileLayers)) {
					return;
				}
				if (!this._createMarkerLayers(data, config.markerLayers)) {
					return;
				}
				if (!this._createGeoJsonLayers(data, config.geoJsonLayers)) {
					return;
				}
				odin.triggerOnViewUpdate(this);
			} catch (err) {
				this.setError(odin.createErrorObj(this, 'leaflet generation failed.', err));
			}
		},

		_createTileLayers: function (config) {
			// TODO implement a caching mechanism (if tileLayer config stays the same, do not generate new layers)
			if (!config) {
				return true;
			}
			var layerGroup = L.featureGroup();
			config.forEach(function (e) {
				var tileLayer = null;
				var transformer = function (k, v) {
					switch (k) {
						case 'tileSize':
							if (typeof v === 'object' && !odin.check.isNumber(v)) {
								return L.point(v.x, v.y, true);
							}
							return v;
						case 'bounds':
							return L.latLngBounds(L.latLng(v[0].lat, v[0].lng), L.latLng(v[1].lat, v[1].lng));
						default:
							return v;
					}
				};
				// which kind of tile layer (provider or url)?
				if (e.provider && !e.url) {
					// which providers are available? check 'L.TileLayer.Provider.providers' in console
					// if provider name is unknown, an exception will be thrown
					tileLayer = L.tileLayer.provider(e.provider, odin.copyObject(e, function (k) {
								return k !== 'provider';
							}, transformer));
				} else if (!e.provider && e.url) {
					tileLayer = L.tileLayer(e.url, odin.copyObject(e, function (k) {
								return k !== 'url';
							}, transformer));
				}
				if (tileLayer) {
					layerGroup.addLayer(tileLayer);
				}
			});
			layerGroup.addTo(this._maplayerInstance);
			return true;
		},

		_createPopup: function (leafletObj, config, data) {
			if (!config) {
				// no popup to add
				return;
			}
			var filter = function (k) {
				return k !== 'content' && k !== 'title';
			};
			var transformer = function (k, v) {
				switch (k) {
					case 'autoPanPaddingTopLeft':
					case 'autoPanPaddingBottomRight':
					case 'autoPanPadding':
					case 'offset':
						return L.point(v.x, v.y, true);
					default:
						return v;
				}
			};
			var popupOptions = odin.copyObject(config, filter, transformer);
			// get the title
			var popupTitle = config.title;
			if (odin.path.isPathTokens(popupTitle)) {
				// resolve to the actual value
				var path = odin.path.create(popupTitle);
				popupTitle = odin.path.resolve(path, data);
			}
			// create popup & its content
			var popup = L.popup(popupOptions);
			// create error element
			var errorElement = document.createElement('p');
			errorElement.textContent = config.errorText;
			errorElement.setAttribute('class', 'odin-error');
			errorElement.style.display = 'none';
			if (odin.check.isString(config.content)) {
				popup.setContent(this._createPopupContent(popupTitle, config.content, errorElement));
			} else {
				// component-based content
				// get the data
				var resolvedData = null;
				try {
					var dataPath = odin.path.create(config.content.dataPath);
					resolvedData = odin.path.resolve(dataPath, data);
				} catch (err) {
					this.setError(odin.createErrorObj(this, 'Mapping error: data path "'
						+ e.dataPath + '" can not be used or does not point to anything.', err));
					return;
				}
				// get component objects
				var viewComponent = config.content.component.view + '-view';
				var elementId = viewComponent + '_' + Math.random();
				var componentConfig = config.content.component.config;
				var htmlElement = document.createElement(viewComponent);
				htmlElement.setAttribute('id', elementId);
				// set the config now, but data later (possible errors will be taken of later)
				htmlElement.setConfig(componentConfig);
				// cubbles will notify us, when the component get inserted into the DOM via a listener
				document.addEventListener('cifDomUpdateReady', function (evt) {
					if (popup.isOpen()) {
						// some components only work if there are placed in the DOM first, which is now the case
						// therefore add the data, then look for future changes & update the popup & remove this listener
						htmlElement.addEventListener('cifModelChange', function (evt) {
							switch (evt.detail.slot) {
								case 'onViewUpdate':
									errorElement.style.display = 'none';
									htmlElement.style.display = 'initial';
									popup.update();
									return;
								case 'error':
									errorElement.style.display = 'block';
									htmlElement.style.display = 'none';
									popup.update();
									return;
								default:
									return;
							}
						});
						htmlElement.setData(resolvedData);
						document.removeEventListener('cifDomUpdateReady', this);
					}
				});
				popup.setContent(this._createPopupContent(popupTitle, htmlElement, errorElement));
			}
			leafletObj.bindPopup(popup);
		},

		_createPopupContent: function (title, subContent, errorElement) {
			var parent = document.createElement('div');
			parent.setAttribute('class', 'odin-maplayerview-popup-content');
			var subElement = odin.check.isString(subContent) ? document.createTextNode(subContent) : subContent;
			if (title) {
				// with title
				var titleElement = document.createElement('h4');
				titleElement.textContent = title;
				parent.appendChild(titleElement);
			}
			parent.appendChild(errorElement);
			parent.appendChild(subElement);
			return parent;
		},

		_createMarkerLayers: function (data, config) {
			if (!config) {
				return true;
			}
			var layerGroup = L.featureGroup();
			for (var i = 0; i < config.length; i++) {
				var e = config[i];
				var markers = [];
				var filter = function (k) {
					return k !== 'lat' && k !== 'lng' && k !== 'dataPath' && k !== 'popup';
				};
				var transformer = function (k, v) {
					if (k === 'icon') {
						if (!v.iconUrl) {
							return L.divIcon(odin.copyObject(v, null, function (k3, v3) {
									switch (k3) {
									case 'iconSize':
										if (typeof v3 === 'object' && !odin.check.isNumber(v3)) {
											return L.point(v3.x, v3.y, true);
										}
										return v3;
									case 'iconAnchor':
									case 'popupAnchor':
									case 'bgPos':
										return L.point(v3.x, v3.y, true);
									default:
										return v3;
									}
								}));
						} else {
							return L.icon(odin.copyObject(v, null, function (k3, v3) {
									switch (k3) {
									case 'shadowSize':
									case 'iconSize':
										if (typeof v3 === 'object' && !odin.check.isNumber(v3)) {
											return L.point(v3.x, v3.y, true);
										}
										return v3;
									case 'iconAnchor':
									case 'popupAnchor':
									case 'shadowAnchor':
										return L.point(v3.x, v3.y, true);
									default:
										return v3;
									}
								}));
						}
					}
					return v;
				};
				var createMarker = function (marker, data) {
					var markerOptions = odin.copyObject(marker, filter, transformer);
					var markerObj = L.marker(L.latLng(marker.lat, marker.lng), markerOptions);
					this._createPopup(markerObj, marker.popup, data);
					return markerObj;
				}.bind(this);
				// which kind of marker (fixed or data-based)?
				if (!odin.check.isNumber(e.lat) && !odin.check.isNumber(e.lng)) {
					// data-based
					if (data === undefined || data === null) {
						continue;
					}
					// get the data
					var resolvedData = null;
					try {
						var dataPath = odin.path.create(e.dataPath);
						resolvedData = odin.path.resolve(dataPath, data);
					} catch (err) {
						this.setError(odin.createErrorObj(this, 'Mapping error: data path "' + e.dataPath + '" can not be used or does not point to anything.', err));
						return false;
					}
					// validate data (must be an array containing objects)
					var dataErrors = odin.validate.withSchema(odin.validate.schema.dataObjectTuples, resolvedData);
					if (dataErrors) {
						this.setError(odin.createErrorObj(this, 'data referenced by "' + e.dataPath + '" is not valid (array containing objects).', dataErrors));
						return false;
					}
					// first create all pathObj's from path tokens
					var eWithPaths = {};
					var keysWithPaths = [];
					var markerOptions = odin.copyObject(e, function (k) {
							return k !== 'dataPath';
						});
					for (var key in e) {
						if (e.hasOwnProperty(key)) {
							if (!odin.path.isPathTokens(e[key])) {
								eWithPaths[key] = e[key];
								continue;
							}
							try {
								eWithPaths[key] = odin.path.create(e[key]);
								keysWithPaths.push(key);
							} catch (err) {
								this.setError(odin.createErrorObj(this, 'Unexpected type in path token at ' + key + '.', err));
								return false;
							}
						}
					}
					// then resolve pathObj's & create a marker for each data element
					var eDataMarkers = [];
					for (var j = 0; j < resolvedData.length; j++) {
						var d = resolvedData[j];
						var eResolved = odin.copyObject(eWithPaths);
						for (var k = 0; k < keysWithPaths.length; k++) {
							var key = keysWithPaths[k];
							try {
								eResolved[key] = odin.path.resolve(eWithPaths[key], d);
							} catch (err) {
								// error: mapping error
								this.setError(odin.createErrorObj(this, 'Mapping error: unable to map value with path at ' + key + '.', err));
								return false;
							}
						}
						eDataMarkers.push(eResolved);
					}
					var layerGroup2 = L.featureGroup();
					if (e.attribution) {
						layerGroup2.options.attribution = e.attribution;
					}
					eDataMarkers.forEach(function (e2) {
						// delete double attribution property
						if (e2.attribution) {
							delete e2.attribution;
						}
						layerGroup2.addLayer(createMarker(e2, e2.dataPath));
					});
					markers.push(layerGroup2);
				} else if (!Array.isArray(e.lat) && !Array.isArray(e.lng)) {
					// fixed
					markers.push(createMarker(e, data));
				} else {
					// error: unknown marker config
					this.setError(odin.createErrorObj(this, 'Marker layer element "' + i + '" is not a fixed nor a data-based marker.'));
					return false;
				}
				markers.forEach(function (e2) {
					layerGroup.addLayer(e2);
				});
			}
			layerGroup.addTo(this._maplayerInstance);
			return true;
		},

		_createGeoJsonLayers: function (data, config) {
			if (!config || !data) {
				return true;
			}
			var layerGroup = L.featureGroup();
			for (var i = 0; i < config.length; i++) {
				var e = config[i];
				// get the data
				var resolvedData = null;
				try {
					var dataPath = odin.path.create(e.dataPath);
					resolvedData = odin.path.resolve(dataPath, data);
				} catch (err) {
					this.setError(odin.createErrorObj(this, 'Mapping error: data path "' + e.dataPath + '" can not be used or does not point to anything.', err));
					return false;
				}
				// validate data (must be valid geo json)
				var dataErrors = odin.validate.withSchema(odin.validate.schema.geojson, resolvedData);
				if (dataErrors) {
					this.setError(odin.createErrorObj(this, 'data referenced by "' + e.dataPath + '" is not valid geo json.', dataErrors));
					return false;
				}
				var geoJsonLayer = null;
				// which kind of geojson feature (normal or choropleth)?
				if (e.choropleth) {
					// choropleth
					var choroplethOptions = odin.copyObject(e.choropleth, function (k) {
							return k !== 'scale';
						}, function (k, v) {
							if (k === 'mode') {
								// first character
								return v.charAt();
							}
							return v;
						});
					if (e.choropleth.scale) {
						choroplethOptions.scale = choroplethOptions.colors;
						delete choroplethOptions.colors;
					}
					choroplethOptions.style = e.style;
					choroplethOptions.attribution = e.attribution;
					geoJsonLayer = L.choropleth(resolvedData, choroplethOptions);
				} else {
					// normal
					geoJsonLayer = L.geoJSON(resolvedData, {
							style: function (geoJsonFeature) {
								return e.style;
							},
							attribution: e.attribution
						});
				}
				geoJsonLayer.eachLayer(function (layer) {
					// one layer per feature
					this._createPopup(layer, e.popup, layer.feature);
				}.bind(this));
				layerGroup.addLayer(geoJsonLayer);
			}
			layerGroup.addTo(this._maplayerInstance);
			return true;
		}
	});
}
	());
