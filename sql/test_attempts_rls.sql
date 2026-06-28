-- Admin can read ALL test attempts
drop policy if exists "Admin reads all attempts" on test_attempts;
create policy "Admin reads all attempts" on test_attempts
  for select to authenticated
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Juniors can read only their own attempts  
drop policy if exists "Junior reads own attempts" on test_attempts;
create policy "Junior reads own attempts" on test_attempts
  for select to authenticated
  using (auth.uid() = junior_id);

-- Anyone authenticated can insert their own attempt
drop policy if exists "Junior inserts attempt" on test_attempts;
create policy "Junior inserts attempt" on test_attempts
  for insert to authenticated
  with check (auth.uid() = junior_id);
