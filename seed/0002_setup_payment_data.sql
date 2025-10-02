-- Setup Payment Types and Payment Providers
-- Public payment data that all users can reference

-- Insert Payment Types (Public, system-wide)
INSERT INTO payment_types (id, code, name, icon, icon_type, is_public, vault_id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by) VALUES
('pt_cash', 'cash', 'Cash', '💵', 'emoji', 1, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pt_e_wallet', 'e_wallet', 'E-Wallet', '📱', 'emoji', 1, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pt_credit_card', 'credit_card', 'Credit Card', '💳', 'emoji', 1, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pt_debit_card', 'debit_card', 'Debit Card', '💳', 'emoji', 1, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pt_bank_transfer', 'bank_transfer', 'Bank Transfer', '🏦', 'emoji', 1, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL);

-- Insert Payment Providers - E-Wallets (Indonesia)
INSERT INTO payment_providers (id, name, type, icon, icon_type, color, is_public, vault_id, user_id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by) VALUES
('pp_gopay', 'GoPay', 'e_wallet', '📱', 'emoji', '#00AA13', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_ovo', 'OVO', 'e_wallet', '📱', 'emoji', '#4C3494', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_dana', 'Dana', 'e_wallet', '📱', 'emoji', '#118EEA', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_shopeepay', 'ShopeePay', 'e_wallet', '📱', 'emoji', '#EE4D2D', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_linkaja', 'LinkAja', 'e_wallet', '📱', 'emoji', '#E11E27', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL);

-- Insert Payment Providers - Banks (Indonesia)
INSERT INTO payment_providers (id, name, type, icon, icon_type, color, is_public, vault_id, user_id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by) VALUES
('pp_bca', 'BCA', 'bank', '🏦', 'emoji', '#003D79', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_mandiri', 'Mandiri', 'bank', '🏦', 'emoji', '#003D79', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_bni', 'BNI', 'bank', '🏦', 'emoji', '#ED7D31', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_bri', 'BRI', 'bank', '🏦', 'emoji', '#00529C', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_permata', 'Permata', 'bank', '🏦', 'emoji', '#7CB342', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL),
('pp_cimb', 'CIMB', 'bank', '🏦', 'emoji', '#C8102E', 1, NULL, NULL, datetime('now'), 'system', datetime('now'), NULL, NULL, NULL);
