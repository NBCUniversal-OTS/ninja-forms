<?php
$I = new AcceptanceTester( $scenario );

$I->wantTo( 'confirm that the dashboard loads properly' );
// Login to wp-admin
$I->loginAsAdmin();

$I->amOnPage( '/wp-admin/plugins.php' );
$I->see( 'Ninja Forms' );
$I->see( 'Ninja Forms is a webform builder with unparalleled ease of use and features.' );

$I->nfHideUpdates( $I );

$I->amOnPage( '/wp-admin/admin.php?page=ninja-forms' );
$I->waitForText( 'Add New' );
