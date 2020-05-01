<?php
$I = new AcceptanceTester( $scenario );

$I->wantTo( 'test and verify a currency masked field in a calculation' );

// Login to wp-admin
$I->loginAsAdmin();
$I->nfHideUpdates( $I );

/**
 * Create a new form.
 */

$I->amOnPage( '/wp-admin/admin.php?page=ninja-forms&form_id=new' );
$I->wait( 2 );
$I->executeJS( "jQuery( '#nf-drawer' ).scrollTop( 600 );" );

/**
 * Add new fields.
 */

$I->click( '[data-id="textbox"]' );
$I->waitForElement('#tmp-1', 30);

$I->click( '[data-id="html"]' );
$I->waitForElement('#tmp-2', 30);

$I->click( '[data-id="submit"]' );
$I->waitForElement('#tmp-3', 30);

$I->click( '[data-id="hidden"]' );
$I->waitForElement('#tmp-4', 30);

/**
 * Close the drawer.
 */

$I->executeJS( "jQuery( '#nf-drawer' ).scrollTop( 0 );" );
$I->wait( 1 );
$I->click( '.nf-close-drawer' );
$I->wait( 2 );

/**
 * Edit fields.
 */

// Edit textbox field.
$I->click( '#tmp-1' );
$I->wait( 2 );
// Open 'Restrictions' and 'Administration' settings sections.
$I->executeJS( 'jQuery( "h3.toggle" ).each( function() {
	if(
        \'Restrictions\' == jQuery( this ).text()
     || \'Administration\' == jQuery( this ).text()
    ) {
		jQuery( this ).click();
    }
});' );
// Set currency mask.
$I->waitForElement( '#mask' );
$I->selectOption( '#mask', 'currency' );
// Set key for referencing in the calculation.
$I->waitForElement( '#key' );
$I->fillField( '#key', 'textbox_with_currency_mask' );

// Edit HTML field.
$I->click( '#tmp-2' );
$I->wait( 2 );
$I->executeJS( 'Backbone.Radio.channel("app").request("get:formModel").get("fields").models[1].set("default", "JS {calc:withCurrency}");' );

// Edit hidden field's default value to the calc merge tag.
$I->wait( 2 );
$I->click( '[data-id="tmp-4"]' );
$I->wait( 2 );
$I->fillField( '#default', '{calc:withCurrency}' );
$I->wait( 2 );

/**
 * Close the drawer.
 */

$I->click( '.nf-close-drawer' );
$I->wait( 2 );

/**
 * Create calculation.
 */

$I->click( 'Advanced' );
$I->wait( 2 );

$I->waitForText( 'Calculations' );
$I->click( '.nf-setting-wrap.calculations' );

$I->wait( 2 );
$I->click( '.nf-add-new' );
$I->wait( 1 );
$I->fillField( '[data-id="name"]', 'withCurrency' );
$I->fillField( '[data-id="eq"]', '{field:textbox_with_currency_mask} * 1.10' );
$I->click( '.nf-close-drawer' );

// Update our success message action to include our calc merge tag
$I->wait( 1 );
$I->click( 'Emails & Actions' );
$I->executeJS( 'jQuery( "tr:first-child" ).find( ".nf-edit-settings" ).click();' );
$I->wait( 1 );
$I->executeJS( "Backbone.Radio.channel('app').request('get:formModel').get('actions').models[0].set('success_msg', 'PHP {calc:withCurrency}');" );
$I->click( '.nf-close-drawer' );

// Publish our form
$I->wait( 2 );
$I->click( 'PUBLISH' );
$I->wait( 2 );

$I->waitForElement( '#title' );
$I->fillField( '#title', 'CurrencyMaskCalculationsCept' );

$I->click( '.publish', '#nf-drawer' );
$I->waitForElement( '.preview' );
$I->waitForText( 'PUBLISH' );
$I->wait(2);

// Preview the form
$I->click( '.preview' );
$I->wait( 2 );

$I->executeInSelenium(function (\Facebook\WebDriver\Remote\RemoteWebDriver $webdriver) {
     $handles=$webdriver->getWindowHandles();
     $last_window = end($handles);
     $webdriver->switchTo()->window($last_window);
});

// Make sure that our total is 15
$I->waitForElementVisible( '.nf-form-content', 30 );
$I->executeJS( "jQuery( '.nf-form-content' ).scrollTop( 0 );" );
$I->executeJS( "jQuery( '#nf-field-5' ).val( '3.50' );" );
$I->wait( 1 );

// Check our JS total
$I->see( 'JS 3.85' );
$I->click( 'Submit' );

// Submit our form and check that our success message has the correct total.
$I->waitForText( 'PHP' );
$I->see( 'PHP 3.85' );

$I->amOnPage( '/wp-admin/edit.php?post_status=all&post_type=nf_sub&form_id=2&paged=1');
$I->executeJS( 'jQuery( ".row-actions" ).removeClass( "row-actions" );' );
$I->click( "span.edit > a" );
$I->wait( 2 );
$I->seeInField( '[name="fields[8]"]', '3.85' );