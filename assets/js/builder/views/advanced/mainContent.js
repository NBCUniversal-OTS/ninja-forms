define( ['views/advanced/settingItem'], function( settingItem ) {
	var view = Marionette.CompositeView.extend({
		childView: settingItem,
		template: '#tmpl-nf-advanced-main-content',

		attachHtml: function( collectionView, childView ) {
			jQuery( collectionView.el ).find( '.child-view-container' ).append( childView.el );
		}
	});

	return view;
} );