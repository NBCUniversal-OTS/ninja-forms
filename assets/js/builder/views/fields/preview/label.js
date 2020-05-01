define( [], function() {
	var view = Marionette.ItemView.extend({
		tagName: 'div',
		template: '#tmpl-nf-field-label',

		initialize: function() {
			// ...
		},

		onRender: function() {
			// ...
		},
        
		templateHelpers: function () {
	    	return {
	    		renderLabelClasses: function() {
                    // ...
                },
                maybeRenderHelp: function() {
                    // ...
                }
            }
        }

	});

	return view;
} );