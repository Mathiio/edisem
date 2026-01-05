<?php
/**
 * Test CORS simple - À uploader sur le serveur
 * URL: https://edisem.arcanes.ca/omk/test-cors-simple.php
 */

// Headers CORS en dur (pour tester si mod_headers fonctionne)
header('Access-Control-Allow-Origin: http://localhost:5174');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');

// Gérer OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Informations de diagnostic
$info = [
    'status' => 'OK',
    'message' => 'CORS Headers fonctionnent !',
    'server_info' => [
        'mod_headers_enabled' => function_exists('apache_get_modules') && in_array('mod_headers', apache_get_modules()),
        'mod_rewrite_enabled' => function_exists('apache_get_modules') && in_array('mod_rewrite', apache_get_modules()),
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'http_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    ],
    'htaccess_check' => [
        'file_exists' => file_exists(__DIR__ . '/.htaccess'),
        'file_readable' => is_readable(__DIR__ . '/.htaccess'),
        'file_size' => file_exists(__DIR__ . '/.htaccess') ? filesize(__DIR__ . '/.htaccess') : 0,
    ],
    'test_instructions' => [
        '1' => 'Si vous voyez ce message, PHP fonctionne',
        '2' => 'Si pas d\'erreur CORS, les headers PHP fonctionnent',
        '3' => 'Vérifiez mod_headers_enabled ci-dessus',
        '4' => 'Vérifiez file_exists pour .htaccess',
    ]
];

header('Content-Type: application/json');
echo json_encode($info, JSON_PRETTY_PRINT);
