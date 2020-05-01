<?php

ini_set('error_reporting', E_ALL); // or error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

require_once 'includes/Telemetry/Metric.php';
require_once 'includes/Telemetry/CountMetric.php';
require_once 'includes/Telemetry/MaxMetric.php';
require_once 'includes/Telemetry/RepositoryInterface.php';
require_once 'includes/Handlers/LocaleNumberFormatting.php';

function update_option( $value ) {
    return $value;
}

class NF_Telemetry_MockRepository implements NF_Telemetry_RepositoryInterface
{
    protected $value;

    public function __construct( $value )
    {
        $this->value = $value;
    }

    public function get()
    {
        return $this->value;
    }

    public function save( $new_value )
    {
        return $new_value;
    }
}

class NF_MockLocale
{
    public $number_format = array();

    public function __construct($thousands_sep = ',', $decimal_point = '.')
    {
        $this->number_format['thousands_sep'] = $thousands_sep;
        $this->number_format['decimal_point'] = $decimal_point;
    }
}
