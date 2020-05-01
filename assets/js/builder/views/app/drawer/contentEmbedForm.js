/**
 *
 * @package Ninja Forms builder
 * @subpackage App
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( ['views/app/drawer/itemSetting'], function(itemSettingView) {
	var view = Marionette.LayoutView.extend( {
		tagName: 'div',
        template: '#tmpl-nf-drawer-content-embed-form',
        
		regions: {
      copyFormShortcode: '.copy-form-shortcode',
    },

    // WIP: This is non-functional
		onRender: function() {
            var formModel = Backbone.Radio.channel('app').request('get:formModel');
            var formSettingsDataModel = nfRadio.channel( 'settings' ).request( 'get:settings' );
            
            $id = formModel.get('id');
            $shortcode = "[ninja-forms id={$id}]";

            formModel.set('shortcode', $shortcode)

            var embedFormModel = nfRadio.channel( 'settings' ).request( 'get:settingModel', 'embed_form' );
            this.copyPublicLink.show(new itemSettingView( { model: publicLinkSettingModel, dataModel: formModel } ));
        },
        

		events: {
			'click .js-copy-form-shortcode': 'copyFormShortcodeHandler'
		},

		copyFormShortcodeHandler: function( e ) {
            document.getElementById('embed_form').select();
            document.execCommand('copy');
            e.target.innerHTML = 'Copied!';
		}
	} );

	return view;
} );
