/**
 * Listens for clicks on our action item action buttons.
 * 
 * @package Ninja Forms builder
 * @subpackage Fields - Main Sortable
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( [], function() {
	var controller = Marionette.Object.extend( {

		deleting: false, // block edit functionality while deleting field

		initialize: function() {
			// Listen for clicks to edit, delete, duplicate actions.
			this.listenTo( nfRadio.channel( 'app' ), 'click:edit', this.clickEdit );
			this.listenTo( nfRadio.channel( 'app' ), 'click:delete', this.maybeDelete );
			this.listenTo( nfRadio.channel( 'app' ), 'click:duplicate', this.clickDuplicate );

			// Listen for our drawer close and remove our active edit state
		},

		/**
		 * Open a drawer with our action model for editing settings.
		 * 
		 * @since  3.0
		 * @param  Object			e     	event
		 * @param  backbone.model 	model 	action model
		 * @return void
		 */
		clickEdit: function( e, model ) {
			// if we are deleting a field, we don't want to the edit drawer to open
			if( ! this.deleting ) {
				var currentDomain = nfRadio.channel('app').request('get:currentDomain');
				var currentDomainID = currentDomain.get('id');
				var type = nfRadio.channel(currentDomainID).request('get:type', model.get('type'));
				nfRadio.channel('app').request('open:drawer', 'editSettings', {
					model: model,
					groupCollection: type.get('settingGroups')
				});
			}
		},

		/**
		 * Let user know that all data will be lost before actually deleting
		 *
		 * @since  3.0
		 * @param  Object			e     	event
		 * @param  backbone.model 	model 	action model
		 * @return void
		 */
		maybeDelete: function( e, dataModel ) {
			// we set deleting to true, so the edit event doesn't open drawer
			this.deleting = true;
			var modelID = dataModel.get( 'id' );
			var modelType = dataModel.get( 'objectType' );

			// Build a lookup table for fields that we don't save
			var nonSaveFields = [ 'html', 'submit', 'hr',
				'recaptcha', 'spam', 'creditcard', 'creditcardcvc',
				'creditcardexpiration', 'creditcardfullname',
				'creditcardnumber', 'creditcardzip' ];

			/*
			* If this is a new field that hasn't been saved, then we don't
			 * need to check for data
			 */
			if( 'field' != modelType.toLowerCase() ) {
				this.clickDelete( e, dataModel );
			} else {
				/*
				* If the field has been saved, then we need to check for
				 * submission data for this field
				 */
				if( 'tmp' === modelID.toString().substring( 0, 3 )
					|| -1 != jQuery.inArray( dataModel.get( 'type' ), nonSaveFields ) ) {
					// not a saved field so proceed as normal
					this.clickDelete( e, dataModel );
				} else {
					// need the form id
					var formModel = Backbone.Radio.channel('app').request('get:formModel');
					var data = {
						'action': 'nf_maybe_delete_field',
						'security': nfAdmin.ajaxNonce,
						'formID': formModel.get('id'),
						'fieldKey': dataModel.get('key'),
						'fieldID': modelID
					};
					var that = this;

					// make call to see if field has submission data
					jQuery.post(ajaxurl, data)
						.done(function (response) {
							var res = JSON.parse(response);

							if (res.data.hasOwnProperty('errors')) {
								var errors = res.data.errors;
								var errorMsg = '';

								if (Array.isArray(errors)) {
									errors.forEach(function(error) {
										errors += error + "\n";
									})
								} else {
									errors = errors;
								}
								console.log('Maybe Delete Field  Errors: ', errors);
								alert(errors);
								return null;
							}

							if (res.data.field_has_data) {
								// if it does, show warning modal
								that.doDeleteFieldModal(e, dataModel);
								return false;
							} else {
								// if not, proceed like normal
								that.clickDelete(e, dataModel);
								return false;
							}
						});
				}
			}
		},

		/**
		 * Create the field delete warning modal
		 *
		 * @param e
		 * @param dataModel
		 */
		doDeleteFieldModal: function( e, dataModel ) {
			// Build warning modal to warn user a losing all data related to field
            var that = this;
            var modalData = {
                width: 400,
                closeOnClick: false,
                closeOnEsc: true,
                content: nfi18n.fieldDataDeleteMsg,
                btnPrimary: {
                    text: nfi18n.delete,
                    callback: function() {
                        // close and destory modal.
                        deleteModal.toggleModal( false );
                        deleteModal.destroy();
                        // proceed as normal, data will be deleted in backend on publish
                        that.clickDelete( e, dataModel );
                    }
                },
                btnSecondary: {
                    text: nfi18n.cancel,
                    callback: function() {
                        // close and destory modal
                        deleteModal.toggleModal( false );
                        deleteModal.destroy();
                        // set deleting to false so edit can work as normal
                        that.deleting = false;
                    }
                }
            };
            var deleteModal = new NinjaModal( modalData );
		},

		/**
		 * Delete a action model from our collection
		 * 
		 * @since  3.0
		 * @param  Object			e     	event
		 * @param  backbone.model 	model 	action model
		 * @return void
		 */
		clickDelete: function( e, dataModel ) {
			var newModel = nfRadio.channel( 'app' ).request( 'clone:modelDeep', dataModel );

			// Add our action deletion to our change log.
			var label = {
				object: dataModel.get( 'objectType' ),
				label: dataModel.get( 'label' ),
				change: 'Removed',
				dashicon: 'dismiss'
			};

			var data = {
				collection: dataModel.collection
			};

			var changeCollection = nfRadio.channel( 'changes' ).request( 'get:collection' );
			var results = changeCollection.where( { model: dataModel } );

			_.each( results, function( changeModel ) {
				var data = changeModel.get( 'data' );
				if ( 'undefined' != typeof data.fields ) {
					_.each( data.fields, function( field, index ) {
						if ( field.model == dataModel ) {
							data.fields[ index ].model = newModel;					
						}
					} );
				}
				changeModel.set( 'data', data );
				changeModel.set( 'model', newModel );
				changeModel.set( 'disabled', true );
			} );

			nfRadio.channel( 'changes' ).request( 'register:change', 'removeObject', newModel, null, label, data );
			
			var currentDomain = nfRadio.channel( 'app' ).request( 'get:currentDomain' );
			var currentDomainID = currentDomain.get( 'id' );
			nfRadio.channel( currentDomainID ).request( 'delete', dataModel );
			this.deleting = false;
		},

		/**
		 * Duplicate a action within our collection, adding the word "copy" to the label.
		 * 
		 * @since  3.0
		 * @param  Object			e     	event
		 * @param  backbone.model 	model 	action model
		 * @return void
		 */
		clickDuplicate: function( e, model ) {
			var newModel = nfRadio.channel( 'app' ).request( 'clone:modelDeep', model );
			var currentDomain = nfRadio.channel( 'app' ).request( 'get:currentDomain' );
			var currentDomainID = currentDomain.get( 'id' );

			// Change our label.
			newModel.set( 'label', newModel.get( 'label' ) + ' Copy' );
			// Update our ID to the new tmp id.
			var tmpID = nfRadio.channel( currentDomainID ).request( 'get:tmpID' );
			newModel.set( 'id', tmpID );
			// Add new model.
			// Params are: model, silent, renderTrigger, action
			nfRadio.channel( currentDomainID ).request( 'add', newModel, false, false, 'duplicate' );
			
			// Add our action addition to our change log.
			var label = {
				object: model.get( 'objectType' ),
				label: model.get( 'label' ),
				change: 'Duplicated',
				dashicon: 'admin-page'
			};

			var data = {
				collection: nfRadio.channel( currentDomainID ).request( 'get:collection' )
			}

			nfRadio.channel( 'changes' ).request( 'register:change', 'duplicateObject', newModel, null, label, data );
			
			model.trigger( 'change:label', model );

			// Update preview.
			nfRadio.channel( 'app' ).request( 'update:db' );
		}

	});

	return controller;
} );