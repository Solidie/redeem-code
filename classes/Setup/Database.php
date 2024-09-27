<?php
/**
 * Database importer for Solidie
 *
 * @package solidie
 */

namespace Solidie_Redeem\Setup;

use Solidie_Redeem\Main;

/**
 * The database manager class
 */
class Database {

	/**
	 * Constructor that registeres hook to deploy database on plugin activation
	 *
	 * @return void
	 */
	public function __construct() {
		$this->prepareTableNames();
	}

	/**
	 * Add table names into wpdb object
	 *
	 * @return void
	 */
	private function prepareTableNames() {
		global $wpdb;

		// WP and Plugin prefix
		$prefix = $wpdb->prefix . Main::$configs->db_prefix;

		$wpdb->redeem_codes = $prefix . 'codes';
	}
}
