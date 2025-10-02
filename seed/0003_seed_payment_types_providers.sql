-- Seed payment types and providers
-- Run this manually after migrations

-- Insert payment types
INSERT INTO payment_types (id, code, name, icon, icon_type, is_public, created_at, created_by, updated_at)
VALUES
  ('pt_cash', 'cash', 'Cash', '💵', 'emoji', 1, datetime('now'), 'system', datetime('now')),
  ('pt_ewallet', 'e_wallet', 'E-Wallet', '📱', 'emoji', 1, datetime('now'), 'system', datetime('now')),
  ('pt_credit', 'credit_card', 'Credit Card', '💳', 'emoji', 1, datetime('now'), 'system', datetime('now')),
  ('pt_debit', 'debit_card', 'Debit Card', '💳', 'emoji', 1, datetime('now'), 'system', datetime('now')),
  ('pt_transfer', 'bank_transfer', 'Bank Transfer', '🏦', 'emoji', 1, datetime('now'), 'system', datetime('now'));

-- Insert e-wallet providers
INSERT INTO payment_providers (id, name, type, icon, icon_type, color, is_public, created_at, created_by, updated_at)
VALUES
  ('pp_gopay', 'GoPay', 'e_wallet', '💚', 'emoji', '#00AA13', 1, datetime('now'), 'system', datetime('now')),
  ('pp_ovo', 'OVO', 'e_wallet', '💜', 'emoji', '#4C3494', 1, datetime('now'), 'system', datetime('now')),
  ('pp_dana', 'Dana', 'e_wallet', '💙', 'emoji', '#118EEA', 1, datetime('now'), 'system', datetime('now')),
  ('pp_shopeepay', 'ShopeePay', 'e_wallet', '🧡', 'emoji', '#EE4D2D', 1, datetime('now'), 'system', datetime('now')),
  ('pp_linkaja', 'LinkAja', 'e_wallet', '❤️', 'emoji', '#E31E24', 1, datetime('now'), 'system', datetime('now'));

-- Insert bank providers
INSERT INTO payment_providers (id, name, type, icon, icon_type, color, is_public, created_at, created_by, updated_at)
VALUES
  ('pp_bca', 'BCA', 'bank', '🏦', 'emoji', '#003B71', 1, datetime('now'), 'system', datetime('now')),
  ('pp_mandiri', 'Mandiri', 'bank', '🏦', 'emoji', '#003D79', 1, datetime('now'), 'system', datetime('now')),
  ('pp_bni', 'BNI', 'bank', '🏦', 'emoji', '#F47920', 1, datetime('now'), 'system', datetime('now')),
  ('pp_bri', 'BRI', 'bank', '🏦', 'emoji', '#003B71', 1, datetime('now'), 'system', datetime('now')),
  ('pp_permata', 'Permata', 'bank', '🏦', 'emoji', '#8CC63F', 1, datetime('now'), 'system', datetime('now')),
  ('pp_cimb', 'CIMB', 'bank', '🏦', 'emoji', '#D0006F', 1, datetime('now'), 'system', datetime('now'));
