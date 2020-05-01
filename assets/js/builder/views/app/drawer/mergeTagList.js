/**
 * @package Ninja Forms builder
 * @subpackage App
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( [ 'views/app/drawer/mergeTag' ], function( mergeTagView ) {
    var view = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: mergeTagView,
        calc: false,

        initialize: function() {
            nfRadio.channel( 'merge-tags' ).reply( 'update:taglist', this.sectionFilter, this );
            nfRadio.channel( 'merge-tags' ).reply( 'filtersearch', this.searchFilter, this );
        },

        filter: function( child, index, collection ){
            return 'fields' == child.get( 'section' );
        },

        sectionFilter: function( section, calc ){
            this.filter = function( child, index, collection ){
                return section == child.get( 'section' );
            }

            /**
             * TODO: This is a wonky fix for removing Product and Quantity fields from calcuation merge tags.
             * Merge tags don't respect the "exclude" merge tag settings.
             * Ultimately, the fix might include updating merge tags to respect those settings.
             *
             * If we've been passed a calc value, then set our object calc tracker to true.
             */
            if ( calc ) {
                this.calc = true;
            }

            if ( this.calc ) {
                /**
                 * Remove any Product and Quantity fields if we are in a calculation.
                 * Get a list of all fields, then filter out Product and Quantity fields.
                 */
                var fieldCollection = nfRadio.channel( 'fields' ).request( 'get:collection' );
                // Stores the keys of product and quantity fields.
                var fieldsToRemove = [];
                // Grab our product fields.
                var productFields = fieldCollection.where( { 'type': 'product' } );
                // Grab our quantity fields.
                var quantityFields = fieldCollection.where( { 'type': 'quantity' } );
                // Loop over product fields, adding their key to our tracker.
                _.each( productFields, function( field ) {
                    fieldsToRemove.push( '{field:' + field.get( 'key' ) + '}' );
                } );
                // Loop over quantity fields, adding their key to our tracker.
                _.each( quantityFields, function( field ) {
                    fieldsToRemove.push( '{field:' + field.get( 'key' ) + '}' );
                } );

                /**
                 * Filters our merge tags.
                 * Make sure that we're in the right section, and then check to see if the merge tag is in our remove tracker.
                 */
                this.filter = function( child, index, collection ) {
                    return section == child.get( 'section' ) && -1 == fieldsToRemove.indexOf( child.get( 'tag' ) );
                }
            }

            this.render();
            nfRadio.channel( 'merge-tags' ).trigger( 'after:filtersearch', section );
        },

        searchFilter: function( term ){
            /**
             * TODO: This is a wonky fix for removing Product and Quantity fields from calcuation merge tags.
             * Merge tags don't respect the "exclude" merge tag settings.
             * Ultimately, the fix might include updating merge tags to respect those settings.
             */
            if ( this.calc ) {
                /**
                 * Remove any Product and Quantity fields if we are in a calculation.
                 * Get a list of all fields, then filter out Product and Quantity fields.
                 */
                var fieldCollection = nfRadio.channel( 'fields' ).request( 'get:collection' );
                // Stores the keys of product and quantity fields.
                var fieldsToRemove = [];
                // Get all of our product fields.
                var productFields = fieldCollection.where( { 'type': 'product' } );
                // Get all of our quantity fields.
                var quantityFields = fieldCollection.where( { 'type': 'quantity' } );
                // Loop over product fields, adding their key to our tracker.
                _.each( productFields, function( field ) {
                    fieldsToRemove.push( '{field:' + field.get( 'key' ) + '}' );
                } );
                // Loop over quantity fields, adding their key to our tracker.
                _.each( quantityFields, function( field ) {
                    fieldsToRemove.push( '{field:' + field.get( 'key' ) + '}' );
                } );
            }

            this.filter = function( child, index, collection ){
                var label = child.get( 'label' ).toLowerCase().indexOf( term.toLowerCase().replace( ':', '' ) ) >= 0;
                var tag   = child.get( 'tag' ).toLowerCase().indexOf( term.toLowerCase() ) >= 0;
                // If we are in a calculation setting and this tag is in our remove tracker, early return false.
                if ( this.calc && -1 != fieldsToRemove.indexOf( child.get( 'tag' ) ) ) {
                    return false;
                }
                return label || tag;
            }

            this.render();
            nfRadio.channel( 'merge-tags' ).trigger( 'after:filtersearch' );

        }
    });

    return view;
} );