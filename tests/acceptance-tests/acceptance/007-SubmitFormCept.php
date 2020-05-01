<?php
$I = new AcceptanceTester( $scenario );

$I->wantTo( 'confirm that form submits properly' );
// Login to wp-admin
$I->loginAsAdmin();

$I->amOnPage( '/?nf_preview_form=1' );
$I->waitForElementVisible( '.nf-form-content', 30 );

$I->fillField( 'Name', 'Bob' );
$I->fillField( 'Email', 'me@me.net' );
$I->fillField( 'Message', 'Hey, Mr. Tambourine Man, play a song for me!' );

$I->click( 'Submit' );

$I->waitForText( 'Form submitted successfully.' );