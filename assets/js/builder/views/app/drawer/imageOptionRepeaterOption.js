define( ['views/app/drawer/optionRepeaterError'], function( ErrorView ) {
    var view = Marionette.LayoutView.extend({
        tagName: 'div',
        className: 'nf-table-row',
        template: '#tmpl-nf-edit-setting-image-option-repeater-default-row',
        id: function() {
            return this.model.cid;
        },

        regions: {
            error: '.nf-option-error'
        },

        initialize: function( data ) {
            this.settingModel = data.settingModel;
            this.dataModel = data.dataModel;
            this.collection = data.collection;
            this.columns = data.columns;
            this.parentView = data.parentView;
            this.model.on( 'change:errors', this.renderErrors, this );

            // Removed because the re-render was breaking tag insertion for merge tags.
            // this.model.on( 'change', this.render, this );

            if ( 'undefined' != typeof this.settingModel.get( 'tmpl_row' ) ) {
                this.template = '#' + this.settingModel.get( 'tmpl_row' );
            }

            this.listenTo( nfRadio.channel( 'image-option-repeater' ), 'click:extra', this.clickExtra );

            this.hasErrors = false;
        },

        onBeforeDestroy: function() {    
            this.model.off( 'change', this.render );
            this.model.off( 'change:errors', this.renderErrors );
        },

        onBeforeRender: function() {
            /*
             * We want to escape any HTML being output for our image.
             */
            if ( this.model.get( 'image' ) ) {
                var image = this.model.get( 'image' );
                this.model.set( 'image', _.escape( image ), { silent: true } );
            }
            
        },

        onRender: function() {
            nfRadio.channel( 'mergeTags' ).request( 'init', this );
            /*
             * Send out a radio message.
             */
            nfRadio.channel( 'setting-' + this.settingModel.get( 'name' ) + '-option' ).trigger( 'render:setting', this.model, this.dataModel, this );
            /*
             * We want to unescape any HTML being output for our image.
             */
            if ( this.model.get( 'image' ) ) {
                var image = this.model.get( 'image' );
                this.model.set( 'image', _.unescape( image ), { silent: true } );
            }
        },

        onShow: function() {
            if ( this.model.get( 'new' ) ) {
                jQuery( this.el ).find( 'input:first' ).focus();
                this.model.set( 'new', false );
            }
        },

        events: {
            'change .setting': 'changeOption',
            'click .nf-delete': 'deleteOption',
            'keyup': 'keyupOption',
            // 'click .open-media-manager': 'openMediaModal'
        },

        changeOption: function( e ) {
            nfRadio.channel( 'image-option-repeater' ).trigger( 'change:option', e, this.model, this.dataModel, this.settingModel, this );
        },

        deleteOption: function( e ) {
            nfRadio.channel( 'image-option-repeater' ).trigger( 'click:deleteOption', this.model, this.collection, this.dataModel, this );
        },

        keyupOption: function( e ) {
            this.maybeAddOption( e );
            nfRadio.channel( 'image-option-repeater' ).trigger( 'keyup:option', e, this.model, this.dataModel, this.settingModel, this )
            nfRadio.channel( 'image-option-repeater-' + this.settingModel.get( 'name' ) ).trigger( 'keyup:option', e, this.model, this.dataModel, this.settingModel, this )
        },

        maybeAddOption: function( e ) {
            if ( 13 == e.keyCode && 'calculations' != this.settingModel.get( 'name' ) ) {
                nfRadio.channel( 'image-option-repeater' ).trigger( 'click:addOption', this.collection, this.dataModel, this );
                jQuery( this.parentView.children.findByIndex(this.parentView.children.length - 1).el ).find( '[data-id="image"]' ).focus();
            }
        },

        clickExtra: function(e, settingModel, dataModel, settingView) {
            
            var textEl = jQuery(e.target).parent().find('.setting');
            var optionContainerDiv = jQuery(e.target).parent().parent().parent();

            var valueEl = jQuery(optionContainerDiv[0]).find('[data-id="value"]');

            var imageIdEl = jQuery(optionContainerDiv[0]).find('[data-id="image_id"]');

            var labelEl = jQuery(optionContainerDiv[0]).find('[data-id="label"]');
            
            if ( jQuery( e.target ).hasClass( 'open-media-manager' )
                && this.el.id === optionContainerDiv[0].id) {
                // If the frame already exists, re-open it.
                if ( this.meta_image_frame ) {
                    this.meta_image_frame.open();
                    return;
                }

                // Sets up the media library frame
                this.meta_image_frame = wp.media.frames.meta_image_frame = wp.media({
                    title: 'Select a file',
                    button: { text:  'insert' }
                });

                var that = this;

                // Runs when an image is selected.
                this.meta_image_frame.on('select', function(){
                    // Grabs the attachment selection and creates a JSON representation of the model.
                    var media_attachment = that.meta_image_frame.state().get('selection').first().toJSON();
                    
                    textEl.val(media_attachment.url).change();
                    valueEl.val(media_attachment.filename).change();
                    labelEl.val(media_attachment.title).change();
                    imageIdEl.val(media_attachment.id).change();
                    var img_container = optionContainerDiv.find('.option-image-container');

                    if(img_container) {
                        $imgs = jQuery(img_container).find('img');
                        if($imgs.length > 0) {
                            jQuery($imgs[0]).attr('src', media_attachment.url);
                        } else {
                            var new_img = document.createElement('img');
                            new_img.style="max-width:100px;display:inline-block;";
                            new_img.src = media_attachment.url;
                            jQuery(img_container).append(new_img);
                        }
                    }
                });

                // Opens the media library frame.
                this.meta_image_frame.open();
            }
        },

        renderErrors: function() {
            
            // if ( jQuery.isEmptyObject( this.model.get( 'errors' ) ) ) {
            //     return false;
            // }

            /*
             * We don't want to redraw the entire row, which would remove focus from the eq textarea,
             * so we add and remove error classes manually.
             */
            if ( 0 == Object.keys( this.model.get( 'errors' ) ) ) {
                if ( this.hasErrors ) {
                    this.error.empty();
                    jQuery( this.el ).removeClass( 'nf-error' );
                }
            } else {
                this.hasErrors = true;
                this.error.show( new ErrorView( { model: this.model } ) );
                jQuery( this.el ).addClass( 'nf-error' );
            }
        },

        templateHelpers: function() {
            var that = this;
            return {
                getColumns: function() {
                    var columns = that.columns;
                    if(!nfAdmin.devMode){
                        delete columns.value;
                        delete columns.calc;
                    }
                    return columns;
                },
                renderFieldSelect: function( dataID, value ){
                    var initialOption, select, emptyContainer, image;

                    var fields = nfRadio.channel( 'fields' ).request( 'get:collection' );

                    initialOption = document.createElement( 'option' );
                    initialOption.value = '';
                    initialOption.image = '';
                    initialOption.innerHTML = '--';

                    select = document.createElement( 'select' );
                    select.classList.add( 'setting' );
                    select.setAttribute( 'data-id', dataID );
                    select.appendChild( initialOption );

                    fields.each( function( field ){
                        var option = document.createElement( 'option' );
                        if ( value == field.get( 'key' ) ) {
                            option.setAttribute( 'selected', 'selected' );
                        }
                        option.value = field.get( 'key' );
                        option.innerHTML = field.formatLabel();
                        option.image = field.formatLabel();
                        select.appendChild( option );
                    });

                    image = document.createElement( 'image' );
                    image.classList.add( 'nf-select' );
                    image.appendChild( select );

                    // Select Lists need an empty '<div></div>' for styling purposes.
                    emptyContainer = document.createElement( 'div' );
                    emptyContainer.style.bottom = '6px';
                    image.appendChild( emptyContainer );

                    // The template requires a string.
                    return image.innerHTML;
                },
                renderNonSaveFieldSelect: function( dataID, value ){
                    var initialOption, select, emptyContainer, image;

                    var fields = nfRadio.channel( 'fields' ).request( 'get:collection' );

                    initialOption = document.createElement( 'option' );
                    initialOption.value = '';
                    initialOption.image = '';
                    initialOption.innerHTML = '--';

                    select = document.createElement( 'select' );
                    select.classList.add( 'setting' );
                    select.setAttribute( 'data-id', dataID );
                    select.appendChild( initialOption );

                    // Build a lookup table for fields we want to remove from our fields list.
                    var removeFieldsLookup = [ 'html', 'submit', 'hr',
                        'recaptcha', 'spam', 'creditcard', 'creditcardcvc',
                        'creditcardexpiration', 'creditcardfullname',
                        'creditcardnumber', 'creditcardzip' ];

                    fields.each( function( field ){
                        // Check for the field type in our lookup array and...
                        if( jQuery.inArray( field.get( 'type' ), removeFieldsLookup ) !== -1 ) {
                            // Return if the type is in our lookup array.
                            return '';
                        }

                        var option = document.createElement( 'option' );
                        if ( value == field.get( 'key' ) ) {
                            option.setAttribute( 'selected', 'selected' );
                        }
                        option.value = field.get( 'key' );
                        option.innerHTML = field.formatLabel();
                        option.image = field.formatLabel();
                        select.appendChild( option );
                    });

                    image = document.createElement( 'image' );
                    image.classList.add( 'nf-select' );
                    image.appendChild( select );

                    // Select Lists need an empty '<div></div>' for styling purposes.
                    emptyContainer = document.createElement( 'div' );
                    emptyContainer.style.bottom = '6px';
                    image.appendChild( emptyContainer );

                    // The template requires a string.
                    return image.innerHTML;
                },
                renderOptions: function( column, value ) {

                    if( 'undefined' == typeof that.options.columns[ column ] ) return;

                    var select = document.createElement( 'select' );
                    
                    _.each( that.options.columns[ column ].options, function( option ){
                        var optionNode = document.createElement( 'option' );
                        if ( value === option.value ) {
                            optionNode.setAttribute( 'selected', 'selected' );
                        }
                        optionNode.setAttribute( 'value', option.value );
                        optionNode.setAttribute( 'image_id', option.image_id);
                        optionNode.setAttribute( 'image', option.image );
                        optionNode.innerText = option.image;
                        select.appendChild( optionNode );
                    });

                    // The template only needs the options.
                    return select.innerHTML;
                }

            }
        }

    });

    return view;
} );
