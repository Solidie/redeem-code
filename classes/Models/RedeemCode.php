<?php
/**
 * Redeem code
 *
 * @package redeem-code
 */

namespace Solidie_Redeem\Models;

use Solidie_Redeem\Helpers\Utilities;
use SolidieLib\_Array;

/**
 * Redeem code CRUD
 */
class RedeemCode {

	/**
	 * Save new redeem codes
	 *
	 * @param int $product_id
	 * @param int $variation_id
	 * @param array $codes
	 * @return void
	 */
	public static function saveCodes( $product_id, $variation_id, $codes ) {
		
		global $wpdb;

		foreach ( $codes as $code ) {

			if ( ! empty( self::getCodeStatus( $code ) ) ) {
				continue;
			}
			
			$wpdb->insert(
				$wpdb->redeem_codes,
				array(
					'redeem_code'  => $code,	
					'product_id'   => $product_id,
					'variation_id' => $variation_id,
					'product_type' => 'wc',
					'created_at'   => Utilities::gmDate()	
				)
			);
		}
	}

	/**
	 * Get redeem row by code
	 *
	 * @param string $code
	 * @return array
	 */
	public static function getCodeStatus( $code ) {
		
		global $wpdb;

		$redeem = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT 
					* 
				FROM 
					{$wpdb->redeem_codes}
				WHERE 
					redeem_code=%s
				LIMIT 1",
				$code
			),
			ARRAY_A
		);

		return _Array::castRecursive( $redeem );
	}

	/**
	 * Apply redeem code for a user
	 *
	 * @param int $user_id
	 * @param string $code
	 * @return bool
	 */
	public static function applyCode( $user_id, $code ) {

		global $wpdb;

		$redeem = self::getCodeStatus( $code );

		if ( empty( $redeem ) || ! empty( $redeem['order_id'] ) ) {
			return false;
		}

		// Load WooCommerce Order Object
		$order = wc_create_order();
		
		// Get the variation product object
		$variation_product = wc_get_product( $redeem['variation_id'] );
		
		if ( $variation_product && $variation_product->is_type( 'variation' ) ) {

			// Add the variation to the order
			$order->add_product( $variation_product, 1, array(
				'subtotal' => 0, // Set subtotal as 0
				'total' => 0     // Set total as 0
			));

			// Set customer data if needed
			$order->set_customer_id( $user_id );

			// Set the status of the order (e.g., processing or completed)
			$order->set_status( 'completed' );
			
			// Calculate totals and save the order
			$order->calculate_totals();
			$order->save();
			$order->add_order_note( 'Redeem Code: ' . $code );
			$order->update_meta_data( 'redeem_code_applied_code', $code );
			$order->update_meta_data( 'redeem_code_code_id', $redeem['code_id'] );

			// Remove the reedeem code as it is used
			$wpdb->update(
				$wpdb->redeem_codes,
				array(
					'order_id'     => $order->get_id(),
					'customer_id'  => $user_id,
					'applied_time' => Utilities::gmDate()
				),
				array(
					'code_id' => $redeem['code_id']
				)
			);

			return true;
		}
		
		return false;
	}
}
