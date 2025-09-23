-- Add sample redemption items
INSERT INTO public.redemption_items (name, description, partner_name, price_in_luvs, redemption_code, validity_start, validity_end) VALUES
(
  '$10 Amazon Gift Card',
  'Redeem this for a $10 Amazon gift card that can be used for any purchase on Amazon.com',
  'Amazon',
  50,
  'AMZ10-GIFT',
  '2025-01-01 00:00:00',
  '2025-12-31 23:59:59'
),
(
  'Starbucks Coffee for Two',
  'Enjoy two premium coffee drinks at any Starbucks location with this exclusive voucher.',
  'Starbucks',
  30,
  'SBX-COFFEE2',
  '2025-01-01 00:00:00',
  '2025-06-30 23:59:59'
),
(
  '$25 Target Gift Card',
  'Shop for anything at Target stores or online with this $25 gift card.',
  'Target',
  125,
  'TGT25-CARD',
  '2025-01-01 00:00:00',
  '2025-12-31 23:59:59'
),
(
  'Netflix 1-Month Subscription',
  'Enjoy one month of unlimited Netflix streaming on us!',
  'Netflix',
  75,
  'NFX-1MONTH',
  '2025-01-01 00:00:00',
  '2025-12-31 23:59:59'
),
(
  'Local Restaurant $15 Voucher',
  'Enjoy a $15 voucher at participating local restaurants in your area.',
  'Local Partners',
  40,
  'LOCAL-15',
  '2025-01-01 00:00:00',
  '2025-09-30 23:59:59'
),
(
  'Spotify Premium 3-Month Subscription',
  'Experience ad-free music streaming for 3 months with Spotify Premium.',
  'Spotify',
  100,
  'SPOT-3MO',
  '2025-01-15 00:00:00',
  '2025-12-31 23:59:59'
);