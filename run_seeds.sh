#!/bin/bash

echo "Running seed files..."

node src/seeds/user.seeds.js
node src/seeds/blog-app/profile.seeds.js
node src/seeds/blog-app/category.seeds.js
node src/seeds/blog-app/post.seeds.js
node src/seeds/blog-app/comment.seeds.js
node src/seeds/blog-app/like.seeds.js
node src/seeds/blog-app/bookmark.seeds.js
node src/seeds/blog-app/follow.seeds.js

echo "All seed files have been run successfully."