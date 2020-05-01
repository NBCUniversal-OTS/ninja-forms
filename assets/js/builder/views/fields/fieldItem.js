define( ['views/app/itemControls', 'views/fields/preview/element', 'views/fields/preview/label'], function( itemControlsView, previewElementView, previewLabelView ) {
	var view = Marionette.LayoutView.extend({
		tagName: 'div',
		template: '#tmpl-nf-main-content-field',
		doingShortcut: false,

		regions: {
			itemControls: '.nf-item-controls',
			previewLabel: '.nf-realistic-field--label',
			previewElement: '.nf-realistic-field--element',
		},

		initialize: function() {
			this.model.on( 'change:editActive', this.render, this );
			this.model.on( 'change:label', this.render, this );
			this.model.on( 'change:required', this.render, this );
			this.model.on( 'change:id', this.render, this );
		},

		onBeforeDestroy: function() {
			this.model.off( 'change:editActive', this.render );
			this.model.off( 'change:label', this.render );
			this.model.off( 'change:required', this.render );
			this.model.off( 'change:id', this.render );
		},

		onRender: function() {
			this.$el = this.$el.children();
			this.$el.unwrap();
			this.setElement( this.$el );

			this.itemControls.show( new itemControlsView( { model: this.model } ) );
			jQuery( this.el ).disableSelection();

			var type = this.model.get('type');
			if('phone' == type) type = 'tel';
			if('spam' == type) type = 'input';
			if('date' == type) type = 'input';
			if('confirm' == type) type = 'input';
			if('quantity' == type) type = 'number';
			if('terms' == type) type = 'listcheckbox';
			if('liststate' == type) type = 'listselect';
			if('listcountry' == type) type = 'listselect';
			if('listmultiselect' == type) type = 'listselect';

			// Only show preview / realisitic fields when not `html`, `hidden`, `note`, or `recaptcha`.
			var previewFieldTypeBlacklist = ['html', 'hidden', 'note', 'recaptcha'];
			var isFieldTypeTemplateAvailable = jQuery('#tmpl-nf-field-' + type).length;
			if(-1 == previewFieldTypeBlacklist.indexOf(this.model.get('type')) && isFieldTypeTemplateAvailable) {
				this.previewElement.show( new previewElementView( { model: this.model } ) );

				// Only show the preview label when not `submit`, or `hr`.
				var showLabelFieldTypeBlacklist = ['submit', 'hr'];
				if(-1 == showLabelFieldTypeBlacklist.indexOf(this.model.get('type'))) {
					this.previewLabel.show( new previewLabelView( { model: this.model } ) );
				}

				jQuery( this.el ).find('.nf-placeholder-label').hide();
			}

			if ( nfRadio.channel( 'app' ).request( 'is:mobile' ) ) {
				jQuery( this.el ).on( 'taphold', function( e, touch ) {
					if ( ! jQuery( e.target ).hasClass( 'nf-edit-settings' ) ) {
						jQuery( this ).addClass( 'ui-sortable-helper drag-selected' );
						jQuery( this ).ClassyWiggle( 'start', { degrees: ['.65', '1', '.65', '0', '-.65', '-1', '-.65', '0'], delay: 50 } );
					}
				} );
			}
		},

		templateHelpers: function () {
	    	return {
	    		renderClasses: function() {
	    			var classes = 'nf-field-wrap ' + this.type;
	    			if ( this.editActive ) {
	    				classes += ' active';
	    			}
	    			return classes;
	    		},
	    		renderRequired: function() {
	    			if ( 1 == this.required ) {
	    				return '<span class="required">*</span>';
	    			} else {
	    				return '';
	    			}
	    		},
	    		getFieldID: function() {
					if ( jQuery.isNumeric( this.id ) ) {
						return 'field-' + this.id;
					} else {
						return this.id;
					}
				},
				renderIcon: function() {
	    			var type, icon;

					type = nfRadio.channel( 'fields' ).request( 'get:type', this.type );

					icon = document.createElement( 'span' );
					icon.classList.add( 'fa', 'fa-' + type.get( 'icon' ) );

					return icon.outerHTML;
				},
				labelPosition: function() {
					return this.label_pos;
				},
				renderDescriptionText: function() {
					return jQuery.trim(this.desc_text);
				}
			};
		},

		events: {
			'mouseover .nf-item-control': 'mouseoverItemControl',
			'mousedown': 'maybeShortcut',
			'click': 'maybeClickEdit',
			'singletap': 'maybeTapEdit',
			'swipeleft': 'swipeLeft',
			'swiperight': 'swipeRight',
			'tapend': 'tapend'
		},

		maybeClickEdit: function( e ) {
			if ( this.doingShortcut ) {
				this.doingShortcut = false;
				return false;
			}

			if ( ( jQuery( e.target ).parent().hasClass( 'nf-fields-sortable' ) || jQuery( e.target ).parent().hasClass( 'nf-field-wrap' ) || jQuery( e.target ).hasClass( 'nf-field-wrap' ) ) && ! nfRadio.channel( 'app' ).request( 'is:mobile' ) ) {
				jQuery( ':focus' ).blur();
				nfRadio.channel( 'app' ).trigger( 'click:edit', e, this.model );
			}
		},

		maybeShortcut: function( e ) {
			var keys = nfRadio.channel( 'app' ).request( 'get:keydown' );
			/*
			 * If the shift key isn't held down, return.
			 */
			if ( -1 == keys.indexOf( 16 ) ) {
				return true;
			}
			/*
			 * If we are pressing D, delete this field.
			 */
			if ( -1 != keys.indexOf( 68 ) ) {
				nfRadio.channel( 'app' ).trigger( 'click:delete', e, this.model );
				this.doingShortcut = true;
				return false;
			} else if ( -1 != keys.indexOf( 67 ) ) {
				this.doingShortcut = true;
				nfRadio.channel( 'app' ).trigger( 'click:duplicate', e, this.model );
				return false;
			}
		},

		maybeTapEdit: function( e ) {
			if ( jQuery( e.target ).parent().hasClass( 'nf-fields-sortable' ) ) {
				nfRadio.channel( 'app' ).trigger( 'click:edit', e, this.model );
			}
		},

		swipeLeft: function( e, touch ) {
			jQuery( touch.startEvnt.target ).closest( 'div' ).find( '.nf-item-duplicate' ).show();
			jQuery( touch.startEvnt.target ).closest( 'div' ).find( '.nf-item-delete' ).show();
		},

		swipeRight: function( e, touch ) {
			jQuery( touch.startEvnt.target ).closest( 'div' ).find( '.nf-item-duplicate' ).hide();
			jQuery( touch.startEvnt.target ).closest( 'div' ).find( '.nf-item-delete' ).hide();
		},

		tapend: function( e, touch ) {
			jQuery( this.el ).ClassyWiggle( 'stop' );
			jQuery( this.el ).removeClass( 'ui-sortable-helper drag-selected' );
		},

		remove: function(){
			if ( nfRadio.channel( 'fields' ).request( 'get:removing' ) ) {
				this.$el.hide( 'clip', function(){
					jQuery( this ).remove();
				});
			} else {
				this.$el.remove();
			}

			nfRadio.channel( 'fields' ).request( 'set:removing', false );
		},

		mouseoverItemControl: function( e ) {
			jQuery( this.el ).find( '.nf-item-control' ).css( 'display', '' );
		}

	});

	return view;
} );
