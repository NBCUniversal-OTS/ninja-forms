define( ['views/app/drawer/itemSettingCollection'], function( itemSettingCollectionView ) {
	var view = Marionette.LayoutView.extend({
		tagName: 'div',
		template: '#tmpl-nf-drawer-content-edit-field-setting-group',
		
		regions: {
			settings: '.nf-field-settings'
		},

		initialize: function( data ) {
			this.model.on( 'change', this.render, this );
			this.dataModel = data.dataModel;
		},

		onBeforeDestroy: function() {
			this.model.off( 'change', this.render );
		},

		onRender: function() {

			this.settings.show( new itemSettingCollectionView( { collection: this.model.get( 'settings' ), dataModel: this.dataModel } ) );

			if(!nfAdmin.devMode) {
				// Only check if not for calculations.
				if(0 == this.$el.find('.calculations').length){
					var visibleSettings = false;
					this.$el.find('.nf-setting').each(function(index, setting) {
						if( 'none' !== setting.style.display ){
							visibleSettings = true;
							return false; //Exit jQuery each loop.
						}
					});
					if(!visibleSettings) {
						this.$el.hide();
					}
				}
			}

			if ( this.model.get( 'display' ) ) {
				// ...
			} else {
				this.settings.empty();
			}

			nfRadio.channel( 'drawer' ).trigger( 'render:settingGroup', this );
		},

		events: {
			'click .toggle': 'clickToggleGroup'
		},

		clickToggleGroup: function( e ) {
			nfRadio.channel( 'drawer' ).trigger( 'click:toggleSettingGroup', e, this.model );
		},

		templateHelpers: function() {
			return {
				renderLabel: function() {
					if ( '' != this.label ) {
						var groupLabel = nfRadio.channel( 'app' ).request( 'get:template',  '#tmpl-nf-drawer-content-edit-setting-group-label' );
						return groupLabel( this );
					} else {
						return '';
					}
				},

				renderArrowDir: function() {
					if ( this.display ) {
						return 'down';
					} else {
						return 'right';
					}
				}
			}
		}
	});

	return view;
} );