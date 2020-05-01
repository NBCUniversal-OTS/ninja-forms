<?php
namespace Helper;

// here you can define custom actions
// all public methods declared in helper class will be available in $I

class Acceptance extends \Codeception\Module
{
    // TODO: This is not the best way of handling this, since at some point, we'll probably remove the check for zuul in Required Updates.
    public function nfHideUpdates( $I, $visible = false ) {
        $I->amOnPage('/wp-admin/options.php');
        if ( $visible ) {
            $I->executeJS( 'jQuery( "#ninja_forms_zuul" ).val( "0" );' );
        } else {
            $I->executeJS( 'jQuery( "#ninja_forms_zuul" ).val( "101" );' );
        }
        $I->executeJS( 'jQuery( "#Update" ).trigger( "click" );' );
        $I->waitForText( 'Settings saved.' );
    }
}
