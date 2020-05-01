/**
 * Handles actions related to number field settings.
 *
 * @package Ninja Forms builder
 * @subpackage Fields - Edit Field Drawer
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( [], function() {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			// Respond to requests for field setting filtering.
			nfRadio.channel( 'number' ).reply( 'before:updateSetting', this.updateSetting, this );
		},

		/**
		 * Resets value if user enters value below min value or above max value
		 *
		 * @since  3.0
		 * @param  Object 			e                event
		 * @param  backbone.model 	fieldModel       field model
		 * @param  string 			name             setting name
		 * @param  backbone.model 	settingTypeModel field type model
		 * @return int              1 or 0
		 */
		updateSetting: function( e, fieldModel, name, settingTypeModel ) {
			var minVal = settingTypeModel.get( 'min_val' );
			var maxVal = settingTypeModel.get( 'max_val' );

			/*
			 * if we gave a min value set, revert to that if the user enters
			 * a lower number
			*/
			if( 'undefined' != typeof minVal && null !== minVal ){
				if ( e.target.value < minVal ) {
					fieldModel.set('value', minVal);
					e.target.value = minVal;
				}
			}
			/*
			 * if we gave a max value set, revert to that if the user enters
			 * a higher number
			*/
			if( 'undefined' != typeof maxVal && null !== maxVal ){
				if ( e.target.value > maxVal ) {
					fieldModel.set('value', maxVal);
					e.target.value = maxVal;
				}
			}

			return e.target.value;
		}

	});

	return controller;
} );