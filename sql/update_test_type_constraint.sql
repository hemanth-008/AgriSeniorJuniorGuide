-- Drop the old constraint that restricted test types to specific lengths
alter table tests drop constraint if exists tests_test_type_check;

-- Add new flexible constraint
alter table tests add constraint tests_test_type_check
  check (test_type in ('unit', 'grand', 'numerical'));
