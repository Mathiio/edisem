<?php

namespace CartoAffect\Service\ViewHelper;

use CartoAffect\View\Helper\AnalyticsViewHelper;
use Interop\Container\ContainerInterface;
use Laminas\ServiceManager\Factory\FactoryInterface;

class AnalyticsFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $services, $requestedName, array $options = null)
    {
        $api = $services->get('Omeka\ApiManager');
        $conn = $services->get('Omeka\Connection');
        return new AnalyticsViewHelper($api, $conn);
    }
}
