# express

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts

This project was created using `bun init` in bun v1.2.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


plan:
- develop a rest api for an ecommerce platform
- follow the db-schemas below
- follow the api-endpoints below
- use bun for development
- use drizzle for orm(libsql)
- use turso for database
- use express for api framework
- use zod for validation
- use bcrypt for password hashing
- use jsonwebtoken for authentication
- use swagger for api documentation
- use pm2 for process management
- use cache.sqlite for caching db
- use razorpay for payment processing
- seeds db with initial data
- upload file in public folder
- use multer for file upload


db-schemas:
- users(id, name, email, password, role_id, created_at, updated_at)
- roles(id, name, created_at, updated_at)
- permissions(id, name, created_at, updated_at)
- products(id, name, short_description, long_description,featured_image, gallery_images, mrp, selling_price, discount_percentage, stock, category_id, created_at, updated_at)
- product_variants(id, product_id, key, value, created_at, updated_at)
- categories(id, name, slug, description, image, parent_id, created_at, updated_at)
- orders(id, user_id, total, status, created_at, updated_at)
- order_items(id, order_id, product_id,variant_id, quantity, price, created_at, updated_at)
- payments(id, order_id, amount, status, created_at, updated_at)
- reviews(id, user_id, product_id, rating, comment, created_at, updated_at)
- wishlist(id, user_id, product_id, created_at, updated_at)
- cart(id, user_id, created_at, updated_at)
- cart_items(id, cart_id, product_id, variant_id, quantity, created_at, updated_at)
- notifications(id, user_id, message, read, created_at, updated_at)
- sessions(id, user_id, token, created_at, updated_at)
- tokens(id, user_id, token, created_at, updated_at)
- logs(id, user_id, action, created_at, updated_at)
- settings(id, key, value, created_at, updated_at)
- coupons(id, code, type, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, end_date, usage_limit, usage_count, created_at, updated_at)
- addresses(id, user_id,landmark, address_line_1, address_line_2, city, state, zip, country, created_at, updated_at)
- newsletters(id, email, created_at, updated_at)
- tags(id, name, created_at, updated_at)
- notifications(id, user_id, message, read, created_at, updated_at)
- sessions(id, user_id, token, created_at, updated_at)
- tokens(id, user_id, token, created_at, updated_at)
- logs(id, user_id, action, created_at, updated_at)
- settings(id, group, key, value, created_at, updated_at)
- coupons(id, code, discount, created_at, updated_at)


api-endpoints:
- /api/v1/auth(login, register, logout, me)
- /api/v1/users(get, update, delete)
- /api/v1/roles(get, update, delete)
- /api/v1/permissions(get, update, delete)
- /api/v1/products(get, update, delete)
- /api/v1/product_variants(get, update, delete)
- /api/v1/categories(get, update, delete)
- /api/v1/orders(get, update, delete)
- /api/v1/payments(get, update, delete)
- /api/v1/reviews(get, update, delete)
- /api/v1/wishlist(get, update, delete)
- /api/v1/cart(get, update, delete)
- /api/v1/notifications(get, update, delete)
- /api/v1/sessions(get, update, delete)
- /api/v1/tokens(get, update, delete)
- /api/v1/logs(get, update, delete)
- /api/v1/settings(get, update, delete)
- /api/v1/coupons(get, update, delete)
- /api/v1/addresses(get, update, delete)
- /api/v1/newsletters(get, update, delete)
- /api/v1/tags(get, update, delete)

admin api-endpoints:
- /api/v1/admin/users(create, get, update, delete)
- /api/v1/admin/roles(create, get, update, delete)
- /api/v1/admin/permissions(create, get, update, delete)
- /api/v1/admin/products(create, get, update, delete)
- /api/v1/admin/product_variants(create, get, update, delete)
- /api/v1/admin/categories(create, get, update, delete)
- /api/v1/admin/orders(create, get, update, delete)
- /api/v1/admin/payments(create, get, update, delete)
- /api/v1/admin/reviews(create, get, update, delete)
- /api/v1/admin/wishlist(create, get, update, delete)
- /api/v1/admin/cart(create, get, update, delete)
- /api/v1/admin/notifications(create, get, update, delete)
- /api/v1/admin/sessions(create, get, update, delete)
- /api/v1/admin/tokens(create, get, update, delete)
- /api/v1/admin/logs(create, get, update, delete)
- /api/v1/admin/settings(create, get, update, delete)
- /api/v1/admin/coupons(create, get, update, delete)
- /api/v1/admin/addresses(create, get, update, delete)
- /api/v1/admin/newsletters(create, get, update, delete)
- /api/v1/admin/tags(create, get, update, delete)

```
