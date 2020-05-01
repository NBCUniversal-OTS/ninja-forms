<?php
$I = new AcceptanceTester( $scenario );

$I->wantTo( 'see the Dev Mode notice in Advanced Settings' );
// Login to wp-admin
$I->loginAsAdmin();
$I->nfHideUpdates( $I );

$I->amOnPage( '/wp-admin/admin.php?page=ninja-forms&form_id=1' );
$I->waitForText( 'Advanced' );
$I->click( 'Advanced' );

$I->waitForText( 'Display Settings' );
$I->waitForText( 'Restrictions' );
// TODO: This doesn't actually check for both, just one or the other.
try{
    $I->waitForText( 'Calculations' );
}catch(Exception $e){
    $I->waitForText( 'For more technical features, enable Developer Mode.' );
}

