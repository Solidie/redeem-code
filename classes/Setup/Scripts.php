<?php
/**
 * Script registrars
 *
 * @package redeem-code
 */

namespace Solidie_Redeem\Setup;

use SolidieLib\Colors;
use Solidie_Redeem\Main;
use SolidieLib\Variables;
use Solidie_Redeem\Helpers\Utilities;

/**
 * Script class
 */
class Scripts {

	/**
	 * Scripts constructor, register script hooks
	 *
	 * @return void
	 */
	public function __construct() {

		// Load scripts
		add_action( 'admin_enqueue_scripts', array( $this, 'adminScripts' ), 11 );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontendScripts' ), 11 );

		// Register script translations
		add_action( 'admin_enqueue_scripts', array( $this, 'scriptTranslation' ), 9 );
		add_action( 'wp_enqueue_scripts', array( $this, 'scriptTranslation' ), 9 );

		// Load text domain
		add_action( 'init', array( $this, 'loadTextDomain' ) );

		// JS Variables
		add_action( 'wp_enqueue_scripts', array( $this, 'loadVariables' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'loadVariables' ) );

		// Load css colors and style
		add_action( 'wp_head', array( $this, 'loadStyles' ) );
		add_action( 'admin_head', array( $this, 'loadStyles' ) );
	}

	/**
	 * Load styles
	 *
	 * @return void
	 */
	public function loadStyles() {

		// Load dynamic colors
		$dynamic_colors = Colors::getColors( $this->getColorScheme() );
		$redeem_colors = ':root{';
		foreach ( $dynamic_colors as $name => $code ) {
			$redeem_colors .= '--solidie-color-' . esc_attr( $name ) . ':' . esc_attr( $code ) . ';';
		}
		$redeem_colors .= '}';

		wp_enqueue_style( 'redeem-code-style', Main::$configs->dist_url . 'libraries/colors-loader.css' );
		wp_add_inline_style( 'redeem-code-style', $redeem_colors );
	}

	/**
	 * Get redeem-code color scheme dynamic values
	 *
	 * @return array
	 */
	private function getColorScheme() {
		return array(
			'color_scheme_materials' => '#0000aa',
			'color_scheme_texts'     => '#000033',
		);
	}

	/**
	 * Load environment and color variables
	 *
	 * @return void
	 */
	public function loadVariables() {

		// Prepare configs, add color schem
		$configs = Main::$configs;
		$configs->color_scheme = $this->getColorScheme();

		// Get common variables
		$data = ( new Variables( $configs ) )->get();

		// Register as localize data
		wp_localize_script( 'redeem-code-translations', Main::$configs->app_id, $data );
	}

	/**
	 * Load scripts for admin dashboard
	 *
	 * @return void
	 */
	public function adminScripts() {
		if ( Utilities::isAdminDashboard() ) {
			wp_enqueue_script( 'redeem-code-backend', Main::$configs->dist_url . 'admin-dashboard.js', array( 'jquery' ), Main::$configs->version, true );
		}
	}

	/**
	 * Load scripts for frontend view
	 *
	 * @return void
	 */
	public function frontendScripts() {
		if ( ! is_front_page() && ( is_singular() || is_single() ) ) {
			wp_enqueue_script( 'redeem-code-frontend', Main::$configs->dist_url . 'frontend.js', array( 'jquery' ), Main::$configs->version, true );
		}
	}

	/**
	 * Load text domain for translations
	 *
	 * @return void
	 */
	public function loadTextDomain() {
		load_plugin_textdomain( Main::$configs->text_domain, false, Main::$configs->dir . 'languages' );
	}

	/**
	 * Load translations
	 *
	 * @return void
	 */
	public function scriptTranslation() {

		$domain = Main::$configs->text_domain;
		$dir    = Main::$configs->dir . 'languages/';

		wp_enqueue_script( 'redeem-code-translations', Main::$configs->dist_url . 'libraries/translation-loader.js', array( 'jquery' ), Main::$configs->version, true );
		wp_set_script_translations( 'redeem-code-translations', $domain, $dir );
	}
}
