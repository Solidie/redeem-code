<?php
/**
 * Custom routes manager for contents
 *
 * @package redeem-code
 */

namespace Solidie_Redeem\Setup;

use Solidie\Models\AdminSetting;

/**
 * Route manager class
 */
class Route {

	/**
	 * Route constructor
	 */
	public function __construct() {

		// Create a gallery page to load in side
		add_action( 'redeem_code_db_deployed', array( $this, 'createApplyFormPage' ) );

		// Register routes
		add_filter( 'the_content', array( $this, 'renderForm' ) );
	}

	/**
	 * Create gallery page if not already
	 *
	 * @return void
	 */
	public function createApplyFormPage() {

		// Check if the page is accessible
		$page_id = AdminSetting::getGalleryPageId();
		if ( ! empty( $page_id ) ) {
			$page = get_post( $page_id );
			if ( ! empty( $page ) && is_object( $page ) && $page->post_status === 'publish' ) {
				return;
			}
		}

		$page_id = wp_insert_post(
			array(
				'post_title'   => __( 'Gallery', 'solidie' ),
				'post_content' => '[' . Shortcode::SHORT_CODE . ']',
				'post_status'  => 'publish',
				'post_type'    => 'page',
			)
		);

		if ( is_numeric( $page_id ) ) {
			AdminSetting::saveSingle( 'gallery_page_id', $page_id );
		}
	}

	/**
	 * Output mountpoint for careers component
	 *
	 * @param string $contents The contents of other pages
	 * @return string
	 */
	public function renderForm( $contents ) {

		if ( ! has_shortcode( $contents, Shortcode::SHORT_CODE ) ) {
			$contents = do_shortcode( '[' . Shortcode::SHORT_CODE . ' _internal_call_=1]' );
		}

		return $contents;
	}
}
