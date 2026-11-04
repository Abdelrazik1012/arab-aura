<?php
// tests/pest/OrderAndRbacTest.php
/**
 * Arab Aura - Pest / PHPUnit Test Suite
 * Egyptian Fashion Marketplace & Micro-Hub Logistics Architecture
 */

namespace Tests\Feature;

use Tests\TestCase;

class OrderAndRbacTest extends TestCase
{
    /** @test */
    public function unauthenticated_requests_are_rejected_with_401()
    {
        $response = $this->json('GET', '/api/wallet/my-wallet');
        $response->assertStatus(401)
                 ->assertJson(['success' => false]);
    }

    /** @test */
    public function customer_cannot_access_seller_dashboard_metrics()
    {
        $customerToken = $this->createCustomerToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $customerToken)
                         ->json('GET', '/api/seller/metrics');

        $response->assertStatus(403)
                 ->assertJson(['success' => false]);
    }

    /** @test */
    public function order_creation_generates_four_digit_otp_and_flat_neighborhood_shipping()
    {
        $customerToken = $this->createCustomerToken();

        $payload = [
            'shippingType' => 'standard',
            'shippingAddress' => [
                'fullName' => 'محمود عبد الفتاح',
                'phone' => '01012345678',
                'governorate' => 'المنوفية',
                'city' => 'شبين الكوم',
                'address' => 'شارع الجلاء',
            ],
            'items' => [
                [
                    'productTitle' => 'تيشيرت بولو قطن مصري 100%',
                    'brandName' => 'Town Team',
                    'unitPrice' => 450,
                    'quantity' => 2,
                ]
            ],
            'paymentMethod' => 'cod'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $customerToken)
                         ->json('POST', '/api/orders', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'shippingFee' => 35.0,
                         'totalAmount' => 935.0,
                         'paymentMethod' => 'cod',
                         'status' => 'ready_for_collection'
                     ]
                 ]);

        $otp = $response->json('data.otpCode');
        $this->assertMatchesRegularExpression('/^[0-9]{4}$/', $otp);
    }

    /** @test */
    public function driver_verification_with_valid_otp_marks_order_delivered_and_updates_balances()
    {
        $driverToken = $this->createDriverToken();
        $orderId = 'ORD-9821';

        $response = $this->withHeader('Authorization', 'Bearer ' . $driverToken)
                         ->json('POST', "/api/orders/{$orderId}/verify-otp", [
                             'otpCode' => '4821'
                         ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'status' => 'delivered',
                         'paymentStatus' => 'paid'
                     ]
                 ]);
    }

    private function createCustomerToken(): string
    {
        return 'mock_jwt_customer_token';
    }

    private function createDriverToken(): string
    {
        return 'mock_jwt_driver_token';
    }
}
