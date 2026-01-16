-- Policy Logs Table for HR Audit
create table policy_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null,
    query text not null,
    answer text not null,
    reasoning text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_policy_logs_user on policy_logs(user_id);
