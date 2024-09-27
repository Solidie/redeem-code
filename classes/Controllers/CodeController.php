<?php
/**
 * Code handler methods
 *
 * @package solidie
 */

namespace Solidie_Redeem\Controllers;

use Solidie_Redeem\Models\RedeemCode;

/**
 * Code controller class
 */
class CodeController {

	const PREREQUISITES = array(
		'saveRedeemCodes' => array(
			'role' => 'administrator'
		),
		'applyRedeemCode' => array()
	);

	/**
	 * Create or update a content category
	 *
	 * @param array $codes
	 * @return void
	 */
	public static function saveRedeemCodes( int $product_id, int $variation_id, array $codes ) {
		
		$codes = array_map( 'trim', $codes );
		$codes = array_filter( $codes, function ( $code ) {
			return ! empty( $code );
		});

		RedeemCode::saveCodes( $product_id, $variation_id, $codes );

		wp_send_json_success();
	}

	/**
	 * Apply redeem code to current user
	 *
	 * @param string $code
	 * @return void
	 */
	public static function applyRedeemCode( string $code ) {

		$uid = get_current_user_id();
		
		// Limit brute force attempt
		$check_key    = 'redeem_code_applied_last_time';
		$last_checked = get_user_meta( $uid, $check_key, true );
		if ( ! empty( $last_checked ) && $last_checked > ( time() - ( 60 * 5 ) ) ) {
			// wp_send_json_error( array( 'message' => __( 'You can try once per 5 minute', 'redeem-code' ) ) );
		}
		update_user_meta( $uid, $check_key, time() );
		
		$applied = RedeemCode::applyCode( $uid, $code );

		if ( $applied ) {
			wp_send_json_success( array( 'redirect_to' => wc_get_endpoint_url( 'orders', '', wc_get_page_permalink( 'myaccount' ) ) ) );
		} else {
			wp_send_json_error( array( 'message' => __( 'The code is invalid or used already!', 'redeem-code' ) ) );
		}
	}
}
