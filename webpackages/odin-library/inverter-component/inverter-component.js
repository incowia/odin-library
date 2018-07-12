(function () {
  'use strict';
  /**
   * Get help:
   * > Lifecycle callbacks:
   * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#lifecycle-callbacks
   *
   * Access the Cubbles-Component-Model:
   * > Access slot values:
   * slot 'a': this.getA(); | this.setA(value)
   */
  CubxPolymer({
    is: 'inverter-component',
		properties: {
			isReady: {
				type: Boolean,
				value: false
			}
		},


    created: function () {
    },

    ready: function () {
      // set value-attribute of element with id='slota' to the initial value of slot 'a'
      this.$.slota.setAttribute('value', this.getA());
    },


    attached: function () {
    },


    cubxReady: function () {
    },


    inputFieldSlotAChanged: function (event) {
      // update the cubbles-model
      this.setA(event.target.value);
    },


    modelAChanged: function (newValue) {
      // update the view
      this.$.slota.setAttribute('value', newValue);
    }
  });
}());
