define( [], function() {
	var view = Marionette.ItemView.extend({
		tagName: 'div',
		template: '#tmpl-nf-field-input',

		initialize: function() {
			
			var type = this.model.get('type');

			this.model.set('value', this.model.get('default'));
			
			if('date' == type && this.model.get('date_default')){
				var format = this.model.get('date_format');
				if('default' == format || '' == format) format = this.convertDateFormat(nfAdmin.dateFormat);
				this.model.set('value', moment().format(format) );
			}

			if('phone' == type) type = 'tel';
			if('spam' == type) type = 'input';
			if('date' == type) type = 'input';
			if('confirm' == type) type = 'input';
			if('password' == type) type = 'input';
			if('passwordconfirm' == type) type = 'input';
			if('quantity' == type) type = 'number';
			if('terms' == type) type = 'listcheckbox';
			if('liststate' == type) type = 'listselect';
			if('listcountry' == type) type = 'listselect';
			if('listmultiselect' == type) type = 'listselect';
			if('save' == type) type = 'submit';

			this.template = '#tmpl-nf-field-' + type;
		},

		onRender: function() {
			if(this.model.get('container_class').includes('two-col-list')) {
				jQuery(this.el).find('> ul').css('display', 'grid');
				jQuery(this.el).find('> ul').css('grid-template-columns', 'repeat(2, 1fr)');
			}
			if(this.model.get('container_class').includes('three-col-list')) {
				jQuery(this.el).find('> ul').css('display', 'grid');
				jQuery(this.el).find('> ul').css('grid-template-columns', 'repeat(3, 1fr)');
			}
			if(this.model.get('container_class').includes('four-col-list')) {
				jQuery(this.el).find('> ul').css('display', 'grid');
				jQuery(this.el).find('> ul').css('grid-template-columns', 'repeat(4, 1fr)');
			}
		},
        
		templateHelpers: function () {
	    	return {
	    		renderClasses: function() {
	    			// ...
                },
                renderPlaceholder: function() {
                    if('undefined' == typeof this.placeholder) return;
					return 'placeholder="' + jQuery.trim( this.placeholder ) + '"';
                },
                maybeDisabled: function() {
                    if('undefined' == typeof this.disable_input) return;
                    if(!this.disable_input) return;
                    return 'disabled="disabled"';
                },
                maybeRequired: function() {
					// ...
				},
				maybeInputLimit: function() {
					// ...
				},
				maybeDisableAutocomplete: function() {
					// ..
				},
				maybeChecked: function() {
					if('checked' == this.default_value) return ' checked="checked"';
				},
				renderOptions: function() {
					switch(this.type) {
						case 'terms':

							if( ! this.taxonomy ){
								return '(No taxonomy selected)';
							}

							var taxonomyTerms = fieldTypeData.find(function(typeData){
								return 'terms' == typeData.id;
							}).settingGroups.find(function(settingGroup){
								return 'primary' == settingGroup.id;
							}).settings.find(function(setting){
								return 'taxonomy_terms' == setting.name;
							}).settings;

							var attributes = Object.keys(this);
							var enabledTaxonomyTerms = attributes.filter(function(attribute){
								return 0 == attribute.indexOf('taxonomy_term_') && this[attribute];
							}.bind(this));

							if(0 == enabledTaxonomyTerms.length) {
								return '(No available terms selected)';
							}

							return enabledTaxonomyTerms.reduce(function(html, enabledTaxonomyTerm) {
								var term = taxonomyTerms.find(function(terms){
									return enabledTaxonomyTerm == terms.name;
								});
								return html += '<li><input type="checkbox"><div>' + term.label  + '</div></li>';
							}.bind(this), '');
						case 'liststate':
						case 'listselect':

							// Check if there are any options.
							if(0 == this.options.models.length) return '';

							// Filter by :selected" options.
							var options = this.options.models.filter(function(option){
								return option.get('selected');
							});

							// If no option set as "selected", then reset the previous filter.
							if(0 == options.length) options = this.options.models;

							// Set the first option to display in the field preview.
							return '<option>' + options[0].get('label') + '</option>';
						case 'listmultiselect':
							return this.options.models.reduce(function(html, option) {
								var selected = (option.get('selected')) ? ' selected="selected"' : '';
								return html += '<option' + selected + '>' + option.get('label')  + '</option>';
							}, '');
						case 'listcheckbox':
							return this.options.models.reduce(function(html, option) {
								var checked = (option.get('selected')) ? ' checked="checked"' : '';
								return html += '<li><input type="checkbox"' + checked + '><div>' + option.get('label')  + '</div></li>';
							}, '');
						case 'listradio':
							var checked = false; // External flag to only select one radio item.
							return this.options.models.reduce(function(html, option) {
								checked = (option.get('selected') && !checked) ? ' checked="checked"' : '';
								return html += '<li><input type="radio"' + checked + '><div>' + option.get('label')  + '</div></li>';
							}, '');
						case 'listcountry':
							var defaultValue = this.default;
							var defaultOption = window.fieldTypeData.find(function(data) {
								return 'listcountry' == data.id;
							}).settingGroups.find(function(group){
								return 'primary' == group.id;
							}).settings.find(function(setting){
								return 'default' == setting.name;
							}).options.find(function(option) {
								return defaultValue == option.value;
							});
							var optionLabel = ('undefined' !== typeof defaultOption ) ? defaultOption.label : '--';
							return '<option>' + optionLabel + '</option>';
						default:
							return '';
					}
				},
				renderOtherAttributes: function() {
					var attributes = [];
					if('listmultiselect' == this.type) {
						attributes.push('multiple');

						var multi_size = this.multi_size || '5';
						attributes.push('size="' + multi_size + '"');
					}

					return attributes.join(' ');
				},
				renderProduct: function() {
					// ...
				},
				renderNumberDefault: function() {
					return this.value;
				},
				renderCurrencyFormatting: function() {
					// ...
				},
				renderRatings: function() {
					var ratingOutput = '';
					for (var i = 0; i < this.number_of_stars; i++) {
						ratingOutput += '<i class="fa fa-star" aria-hidden="true"></i>&nbsp;';
					  }
					return ratingOutput;
				}
            }
		},
		
        convertDateFormat: function( dateFormat ) {
            // http://php.net/manual/en/function.date.php
            // https://github.com/dbushell/Pikaday/blob/master/README.md#formatting
            // Note: Be careful not to add overriding replacements. Order is important here.

            /** Day */
            dateFormat = dateFormat.replace( 'D', 'ddd' ); // @todo Ordering issue?
            dateFormat = dateFormat.replace( 'd', 'DD' );
            dateFormat = dateFormat.replace( 'l', 'dddd' );
            dateFormat = dateFormat.replace( 'j', 'D' );
            dateFormat = dateFormat.replace( 'N', '' ); // Not Supported
            dateFormat = dateFormat.replace( 'S', '' ); // Not Supported
            dateFormat = dateFormat.replace( 'w', 'd' );
            dateFormat = dateFormat.replace( 'z', '' ); // Not Supported

            /** Week */
            dateFormat = dateFormat.replace( 'W', 'W' );

            /** Month */
            dateFormat = dateFormat.replace( 'M', 'MMM' ); // "M" before "F" or "m" to avoid overriding.
            dateFormat = dateFormat.replace( 'F', 'MMMM' );
            dateFormat = dateFormat.replace( 'm', 'MM' );
            dateFormat = dateFormat.replace( 'n', 'M' );
            dateFormat = dateFormat.replace( 't', '' );  // Not Supported

            // Year
            dateFormat = dateFormat.replace( 'L', '' ); // Not Supported
            dateFormat = dateFormat.replace( 'o', 'YYYY' );
            dateFormat = dateFormat.replace( 'Y', 'YYYY' );
            dateFormat = dateFormat.replace( 'y', 'YY' );

            // Time - Not supported
            dateFormat = dateFormat.replace( 'a', '' );
            dateFormat = dateFormat.replace( 'A', '' );
            dateFormat = dateFormat.replace( 'B', '' );
            dateFormat = dateFormat.replace( 'g', '' );
            dateFormat = dateFormat.replace( 'G', '' );
            dateFormat = dateFormat.replace( 'h', '' );
            dateFormat = dateFormat.replace( 'H', '' );
            dateFormat = dateFormat.replace( 'i', '' );
            dateFormat = dateFormat.replace( 's', '' );
            dateFormat = dateFormat.replace( 'u', '' );
            dateFormat = dateFormat.replace( 'v', '' );

            // Timezone - Not supported
            dateFormat = dateFormat.replace( 'e', '' );
            dateFormat = dateFormat.replace( 'I', '' );
            dateFormat = dateFormat.replace( 'O', '' );
            dateFormat = dateFormat.replace( 'P', '' );
            dateFormat = dateFormat.replace( 'T', '' );
            dateFormat = dateFormat.replace( 'Z', '' );

            // Full Date/Time - Not Supported
            dateFormat = dateFormat.replace( 'c', '' );
            dateFormat = dateFormat.replace( 'r', '' );
            dateFormat = dateFormat.replace( 'u', '' );

            return dateFormat;
        }

	});

	return view;
} );