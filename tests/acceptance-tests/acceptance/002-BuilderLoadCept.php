<?php
$I = new AcceptanceTester( $scenario );

$I->wantTo( 'confirm that the builder loads properly' );
// Login to wp-admin
$I->loginAsAdmin();
$I->nfHideUpdates( $I );

$I->amOnPage( '/wp-admin/admin.php?page=ninja-forms&form_id=new' );
$I->waitForText( 'Emails & Actions' );
