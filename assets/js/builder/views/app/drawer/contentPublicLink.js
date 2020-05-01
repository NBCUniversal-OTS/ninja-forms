/**
 * Changes collection view.
 *
 * @package Ninja Forms builder
 * @subpackage App
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( ['views/app/drawer/itemSetting'], function( itemSettingView) {
	var view = Marionette.LayoutView.extend( {
		tagName: 'div',
        template: '#tmpl-nf-drawer-content-public-link',
        
		regions: {
            embedForm: '.embed-form',
			enablePublicLink: '.enable-public-link',
            copyPublicLink: '.copy-public-link',
        },

		onRender: function() {
            var formModel = Backbone.Radio.channel('app').request('get:formModel');
            var formSettingsDataModel = nfRadio.channel( 'settings' ).request( 'get:settings' );

            var allowPublicLinkSettingModel = nfRadio.channel( 'settings' ).request( 'get:settingModel', 'allow_public_link' );
            this.enablePublicLink.show( new itemSettingView( { model: allowPublicLinkSettingModel, dataModel: formSettingsDataModel } ) );
            
            var embedForm = "[ninja_form id='{FORM_ID}']".replace('{FORM_ID}', formModel.get('id'));
            formSettingsDataModel.set('embed_form', embedForm);

            var embedFormSettingModel = nfRadio.channel( 'settings' ).request( 'get:settingModel', 'embed_form' );
            this.embedForm.show( new itemSettingView( { model: embedFormSettingModel, dataModel: formSettingsDataModel } ) );

            var public_link_key = formSettingsDataModel.get('public_link_key');
            
            /**
             * Generate a public link key which is follows the format:
             * Form Id + 4 consecutive base 36 numbers
             */
            if (!public_link_key) {
                public_link_key = nfRadio.channel('app').request('generate:publicLinkKey');
            }

            // apply public link url to settings (ending with key)
            var publicLink = nfAdmin.publicLinkStructure.replace('[FORM_ID]', public_link_key);
            formSettingsDataModel.set('public_link', publicLink);
            
            // Display public link
            var publicLinkSettingModel = nfRadio.channel( 'settings' ).request( 'get:settingModel', 'public_link' );
            this.copyPublicLink.show(new itemSettingView( { model: publicLinkSettingModel, dataModel: formSettingsDataModel } ));
        },

		events: {
			'click #embed_form + .js-click-copytext': 'copyFormEmbedHandler',
			'click #public_link + div > .js-click-copytext': 'copyPublicLinkHandler',
			'click #public_link + div > .js-click-resettext': 'confirmResetPublicLinkHandler',
			'click #public_link + div > .js-click-confirm': 'resetPublicLinkHandler',
			'click #public_link + div > .js-click-cancel': 'cancelResetPublicLinkHandler'
		},

		copyFormEmbedHandler: function( e ) {

            document.getElementById('embed_form').select();
            document.execCommand('copy');

            e.target.innerHTML = 'Copied!';
            setTimeout(function(){ e.target.innerHTML = 'Copy'; }, 1500);
		},

		copyPublicLinkHandler: function( e ) {

            document.getElementById('public_link').select();
            document.execCommand('copy');

            e.target.innerHTML = 'Copied!';
            setTimeout(function(){ e.target.innerHTML = 'Copy'; }, 1500);
        },
        
        confirmResetPublicLinkHandler: function( e ) {
            _.each( e.target.parentNode.children, function( node ) {
                if ( node.classList.contains( 'js-click-copytext' ) || node.classList.contains( 'js-click-resettext' ) ) {
                    node.style.display = 'none';
                } else {
                    node.style.display = 'inline-block';
                }
            } );
        },

        resetPublicLinkHandler: function ( e ) {
            // Generate a new link.
            var public_link_key = nfRadio.channel('app').request('generate:publicLinkKey');
            var publicLink = nfAdmin.publicLinkStructure.replace('[FORM_ID]', public_link_key);
            var formSettingsDataModel = nfRadio.channel( 'settings' ).request( 'get:settings' );
            formSettingsDataModel.set('public_link', publicLink);
            // Reset the buttons.
            this.cancelResetPublicLinkHandler( e );
            _.each( e.target.parentNode.children, function( node ) {
                if ( node.classList.contains( 'js-click-resettext' ) ) {
                    node.style.display = 'inline-block';
                    node.classList.add('primary');
                    node.classList.remove('secondary');
                    node.innerHTML = 'Link Reset!';
                    setTimeout(function(){
                        node.classList.add('secondary');
                        node.classList.remove('primary');
                        node.innerHTML = 'Reset';
                    }, 1500);
                } else {
                    node.style.display = 'none';
                }
                if ( node.classList.contains( 'js-click-copytext' ) ) {
                    setTimeout(function(){
                        node.style.display = 'inline-block';
                    }, 1500);
                }
            } );
            // Update the visible public link.
            jQuery('#public_link').val( publicLink );
        },

        cancelResetPublicLinkHandler: function ( e ) {
            _.each( e.target.parentNode.children, function( node ) {
                if ( node.classList.contains( 'js-click-cancel' ) || node.classList.contains( 'js-click-confirm' ) ) {
                    node.style.display = 'none';
                } else {
                    node.style.display = 'inline-block';
                }
            } );
        }
	} );

	return view;
} );
