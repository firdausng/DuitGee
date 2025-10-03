-- Seed Malaysian bank providers
-- Run this manually after migrations

-- Insert major Malaysian banks
INSERT INTO payment_providers (id, name, type, icon, icon_type, color, is_public, created_at, created_by, updated_at)
VALUES
  -- Major Malaysian Banks
  ('pp_maybank', 'Maybank', 'bank', '🏦', 'emoji', '#FFD700', 1, datetime('now'), 'system', datetime('now')),
  ('pp_cimb_my', 'CIMB Bank', 'bank', '🏦', 'emoji', '#D0006F', 1, datetime('now'), 'system', datetime('now')),
  ('pp_publicbank', 'Public Bank', 'bank', '🏦', 'emoji', '#E31837', 1, datetime('now'), 'system', datetime('now')),
  ('pp_rhb', 'RHB Bank', 'bank', '🏦', 'emoji', '#003B71', 1, datetime('now'), 'system', datetime('now')),
  ('pp_hongleong', 'Hong Leong Bank', 'bank', '🏦', 'emoji', '#003B71', 1, datetime('now'), 'system', datetime('now')),
  ('pp_ambank', 'AmBank', 'bank', '🏦', 'emoji', '#FF6600', 1, datetime('now'), 'system', datetime('now')),
  ('pp_uob', 'UOB Malaysia', 'bank', '🏦', 'emoji', '#0B2D82', 1, datetime('now'), 'system', datetime('now')),
  ('pp_ocbc', 'OCBC Bank', 'bank', '🏦', 'emoji', '#ED1C24', 1, datetime('now'), 'system', datetime('now')),
  ('pp_hsbc_my', 'HSBC Malaysia', 'bank', '🏦', 'emoji', '#DB0011', 1, datetime('now'), 'system', datetime('now')),
  ('pp_standardchartered', 'Standard Chartered', 'bank', '🏦', 'emoji', '#007A33', 1, datetime('now'), 'system', datetime('now')),

  -- Islamic Banks
  ('pp_bankislam', 'Bank Islam', 'bank', '🏦', 'emoji', '#007B5F', 1, datetime('now'), 'system', datetime('now')),
  ('pp_cimbislamic', 'CIMB Islamic', 'bank', '🏦', 'emoji', '#008542', 1, datetime('now'), 'system', datetime('now')),
  ('pp_maybankislamic', 'Maybank Islamic', 'bank', '🏦', 'emoji', '#00A651', 1, datetime('now'), 'system', datetime('now')),
  ('pp_rhbislamic', 'RHB Islamic', 'bank', '🏦', 'emoji', '#006633', 1, datetime('now'), 'system', datetime('now')),
  ('pp_publicislamic', 'Public Islamic Bank', 'bank', '🏦', 'emoji', '#007A33', 1, datetime('now'), 'system', datetime('now')),

  -- Other Banks
  ('pp_affin', 'Affin Bank', 'bank', '🏦', 'emoji', '#D71920', 1, datetime('now'), 'system', datetime('now')),
  ('pp_alliancebank', 'Alliance Bank', 'bank', '🏦', 'emoji', '#E30613', 1, datetime('now'), 'system', datetime('now')),
  ('pp_bsn', 'Bank Simpanan Nasional', 'bank', '🏦', 'emoji', '#003B71', 1, datetime('now'), 'system', datetime('now')),
  ('pp_muamalat', 'Bank Muamalat', 'bank', '🏦', 'emoji', '#005F32', 1, datetime('now'), 'system', datetime('now')),
  ('pp_agrobank', 'Agrobank', 'bank', '🏦', 'emoji', '#8BC53F', 1, datetime('now'), 'system', datetime('now'));

-- Insert Malaysian e-wallets
INSERT INTO payment_providers (id, name, type, icon, icon_type, color, is_public, created_at, created_by, updated_at)
VALUES
  ('pp_tng', 'Touch ''n Go eWallet', 'e_wallet', '💙', 'emoji', '#0055A5', 1, datetime('now'), 'system', datetime('now')),
  ('pp_boost', 'Boost', 'e_wallet', '💜', 'emoji', '#6441A5', 1, datetime('now'), 'system', datetime('now')),
  ('pp_grabpay', 'GrabPay', 'e_wallet', '💚', 'emoji', '#00B14F', 1, datetime('now'), 'system', datetime('now')),
  ('pp_mcash', 'MAE by Maybank', 'e_wallet', '🟡', 'emoji', '#FFD700', 1, datetime('now'), 'system', datetime('now')),
  ('pp_bigpay', 'BigPay', 'e_wallet', '🔵', 'emoji', '#0066FF', 1, datetime('now'), 'system', datetime('now'));
