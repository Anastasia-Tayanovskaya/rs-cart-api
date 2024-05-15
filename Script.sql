create type status_cart_enum as enum ('OPEN', 'ORDERED');
create extension if not exists "uuid-ossp";

create table carts (
	id uuid not null default uuid_generate_v4() primary key,
	user_id uuid not null,
	created_at date not null,
	updated_at date not null,
	status status_cart_enum
);

create table cart_items (
	product_id uuid not null default uuid_generate_v4() primary key,
	"count" int,
	cart_id uuid not null,
	foreign key ("cart_id") references carts("id") on delete cascade
);

WITH insert_cart AS (INSERT INTO carts(user_id, created_at, updated_at, status) VALUES (uuid_generate_v4(), CURRENT_DATE, CURRENT_DATE, 'OPEN') returning id)
	insert into cart_items(cart_id, "count") select id, 4 from insert_cart;
WITH insert_cart AS (INSERT INTO carts(user_id, created_at, updated_at, status) VALUES (uuid_generate_v4(), CURRENT_DATE, CURRENT_DATE, 'ORDERED') returning id)
	insert into cart_items(cart_id, "count") select id, 5 from insert_cart;
WITH insert_cart AS (INSERT INTO carts(user_id, created_at, updated_at, status) VALUES (uuid_generate_v4(), CURRENT_DATE, CURRENT_DATE, 'OPEN') returning id)
	insert into cart_items(cart_id, "count") select id, 10 from insert_cart;

