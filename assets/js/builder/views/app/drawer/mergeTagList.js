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

            if ( calc ) {
                this.calc = true;
            }

            if ( this.calc ) {
                var fieldsToRemove = this.excludeFromCalcs();

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
            if ( this.calc ) {
                var fieldsToRemove = this.excludeFromCalcs();
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

        },

        /**
         * TODO: This is a wonky fix for removing Product and Quantity fields from calcuation merge tags.
         * Merge tags don't respect the "exclude" merge tag settings.
         * Ultimately, the fix might include updating merge tags to respect those settings.
         */
        excludeFromCalcs: function(){
            /**
             * Remove any unwanted fields if we are in a calculation.
             * Get a list of all fields, then filter out unwanted fields.
             */
            var fieldCollection = nfRadio.channel( 'fields' ).request( 'get:collection' );
            // Stores the keys of unwanted fields.
            var fieldsToRemove = [];
            // Declare blacklisted field types.
            var blacklist = ['product', 'quantity', 'total', 'shipping', 'date'];
            // Remove them from the merge tag selection box.
            _.each( fieldCollection.models, function( model ) {
                if ( -1 != blacklist.indexOf( model.get('type') ) ) {
                    fieldsToRemove.push( '{field:' + model.get( 'key' ) + '}' );
                }
            });
            return fieldsToRemove;
        }
    });

    return view;
} );