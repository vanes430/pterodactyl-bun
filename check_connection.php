<?php
$host = '127.0.0.1';
$port = 8080;
$timeout = 5;
$fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
if ($fp) {
    echo "Connection to $host:$port successful";
    fclose($fp);
} else {
    echo "Connection to $host:$port failed: $errstr ($errno)";
}
