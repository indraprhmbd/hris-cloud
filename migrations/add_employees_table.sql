-- Employees Table for Manual HR Management
create table employees (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text not null unique,
    role text not null,
    department text,
    join_date date not null default CURRENT_DATE,
    leave_remaining int default 12,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone default '1970-01-01 00:00:00+00'::timestamp with time zone
);

create index idx_employees_email on employees(email);
create index idx_employees_deleted_at on employees(deleted_at);
