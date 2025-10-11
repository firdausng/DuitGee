-- User ID Migration Script
-- This script updates all user ID references in the app database
-- from app user IDs to auth user IDs based on email matching
-- Generated: 2025-10-11T11:56:14.337Z
-- Matched users: 2

BEGIN TRANSACTION;

-- Update for user: hotmail.com
-- App DB ID: du6dtqt4e5hodo7qb6ewpdie -> Auth DB ID: H0RehTUceRA655c6hMKx0i0TbKOVfpPo

-- Update vaults table
UPDATE vaults SET owner_id = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE owner_id = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE vaults SET created_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE created_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE vaults SET updated_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE updated_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE vaults SET deleted_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE deleted_by = 'du6dtqt4e5hodo7qb6ewpdie';

-- Update vault_members table
UPDATE vault_members SET user_id = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE user_id = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE vault_members SET invited_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE invited_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE vault_members SET updated_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE updated_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE vault_members SET deleted_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE deleted_by = 'du6dtqt4e5hodo7qb6ewpdie';

-- Update expenses table
UPDATE expenses SET user_id = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE user_id = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expenses SET created_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE created_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expenses SET updated_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE updated_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expenses SET deleted_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE deleted_by = 'du6dtqt4e5hodo7qb6ewpdie';

-- Update expense_templates table
UPDATE expense_templates SET user_id = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE user_id = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expense_templates SET default_user_id = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE default_user_id = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expense_templates SET created_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE created_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expense_templates SET updated_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE updated_by = 'du6dtqt4e5hodo7qb6ewpdie';
UPDATE expense_templates SET deleted_by = 'H0RehTUceRA655c6hMKx0i0TbKOVfpPo' WHERE deleted_by = 'du6dtqt4e5hodo7qb6ewpdie';

------------------------------------------------------------

-- Update for user: gmail.com
-- App DB ID: qak2fkm8jmmshxszcfnscigr -> Auth DB ID: KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb

-- Update vaults table
UPDATE vaults SET owner_id = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE owner_id = 'qak2fkm8jmmshxszcfnscigr';
UPDATE vaults SET created_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE created_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE vaults SET updated_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE updated_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE vaults SET deleted_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE deleted_by = 'qak2fkm8jmmshxszcfnscigr';

-- Update vault_members table
UPDATE vault_members SET user_id = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE user_id = 'qak2fkm8jmmshxszcfnscigr';
UPDATE vault_members SET invited_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE invited_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE vault_members SET updated_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE updated_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE vault_members SET deleted_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE deleted_by = 'qak2fkm8jmmshxszcfnscigr';

-- Update expenses table
UPDATE expenses SET user_id = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE user_id = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expenses SET created_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE created_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expenses SET updated_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE updated_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expenses SET deleted_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE deleted_by = 'qak2fkm8jmmshxszcfnscigr';

-- Update expense_templates table
UPDATE expense_templates SET user_id = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE user_id = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expense_templates SET default_user_id = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE default_user_id = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expense_templates SET created_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE created_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expense_templates SET updated_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE updated_by = 'qak2fkm8jmmshxszcfnscigr';
UPDATE expense_templates SET deleted_by = 'KUxMeHpTlIrQ0R1G63geVM2EqNiTgAqb' WHERE deleted_by = 'qak2fkm8jmmshxszcfnscigr';

------------------------------------------------------------

COMMIT;

-- End of migration script
-- Please review carefully before executing
-- Recommendation: Backup your database before running this script
