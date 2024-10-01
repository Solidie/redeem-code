<?php
/**
 * Plugin Name: Redeem Code
 * Plugin URI: https://solidie.com
 * Description: Unlock product using redeem code
 * Author: JK
 * Version: 1.0.0
 * Author URI: https://www.linkedin.com/in/jayedulk/
 * Requires Plugins: woocommerce
 * Requires at least: 6.1
 * Tested up to: 6.6.2
 * Requires PHP: 7.4
 * License: GPLv3
 * License URI: https://opensource.org/licenses/GPL-3.0
 * Text Domain: redeem-code
 *
 * @package redeem-code
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Load autoloader
require_once __DIR__ . '/vendor/autoload.php';

(new Solidie_Redeem\Main())->init( 
	(object) array(
		'file'      => __FILE__,
		'mode'      => 'development',
		'db_prefix' => 'redeem_'
	)
);
