<?php

use PHPUnit\Framework\TestCase;

final class NF_Telemetry_Email_SendCountTest extends TestCase
{
    public function testCountMetric()
    {
        $metric = new NF_Telemetry_CountMetric( new NF_Telemetry_MockRepository( 1 ) );
        $this->assertEquals( 2, $metric->increment() );
    }

    public function testMaxMetric()
    {
        $metric = new NF_Telemetry_MaxMetric( new NF_Telemetry_MockRepository( 2 ) );
        $this->assertEquals( 2, $metric->update( 1 ) );
        $this->assertEquals( 3, $metric->update( 3 ) );
    }
}