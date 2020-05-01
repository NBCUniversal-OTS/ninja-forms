/**
 * Handles changing our public link when we request a new one or when it's set improperly.
 * 
 * @package Ninja Forms builder
 * @subpackage Fields
 * @copyright (c) 2019 WP Ninjas
 * @since UPDATE_VERSION_ON_MERGE
 */
define( [], function() {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			this.listenTo( nfRadio.channel( 'app' ), 'after:appStart', this.validatePublicLink, this );
            nfRadio.channel( 'app' ).reply( 'generate:publicLinkKey', this.newPublicLinkKey, this );
        },
        
        newPublicLinkKey: function() {
            var formSettingsDataModel = nfRadio.channel( 'settings' ).request( 'get:settings' );
            var public_link_key = nfRadio.channel('app').request('get:formModel').get('id');
            for (var i = 0; i < 4; i++) {
                var char = Math.random().toString(36).slice(-1);
                public_link_key += char;
            };
            // Apply the public link key to form settings
            formSettingsDataModel.set('public_link_key', public_link_key);
            return public_link_key;
        },

        validatePublicLink: function() {
            var formID = nfRadio.channel('app').request('get:formModel').get('id');
            var formSettingsDataModel = nfRadio.channel( 'settings' ).request( 'get:settings' );
            if ( 'undefined' === typeof formSettingsDataModel.get('public_link_key') ) return false;
            if ( 0 === formSettingsDataModel.get( 'public_link_key' ).indexOf( formID ) ) return false;
            var public_link_key = this.newPublicLinkKey();
            var publicLink = nfAdmin.publicLinkStructure.replace('[FORM_ID]', public_link_key);
            formSettingsDataModel.set('public_link', publicLink);
        }

	});

	return controller;
} );