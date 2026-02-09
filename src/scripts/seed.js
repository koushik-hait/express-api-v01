import { v4 as uuidv4 } from "uuid";
import db from "../db/index.js";
import {
  users,
  roles,
  categories,
  products,
  tags,
  coupons,
  settings,
} from "../db/schema/index.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  console.log("🌱 Starting database seed...");

  try {
    // Create roles
    console.log("Creating roles...");
    const [adminRole] = await db
      .insert(roles)
      .values({
        name: "admin",
        displayName: "Administrator",
        description: "Full system access",
      })
      .returning();

    const [customerRole] = await db
      .insert(roles)
      .values({
        name: "customer",
        displayName: "Customer",
        description: "Regular customer",
      })
      .returning();

    console.log("✅ Roles created");

    // Create admin user
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await db.insert(users).values({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
    });
    console.log("✅ Admin user created (admin@example.com / Admin@123)");

    // Create categories
    console.log("Creating categories...");
    const categoryData = [
      {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and gadgets",
      },
      {
        name: "Clothing",
        slug: "clothing",
        description: "Fashion and apparel",
      },
      {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        description: "Home appliances and kitchen items",
      },
      { name: "Books", slug: "books", description: "Books and publications" },
      {
        name: "Sports",
        slug: "sports",
        description: "Sports and outdoor equipment",
      },
    ];

    const createdCategories = [];
    for (const cat of categoryData) {
      const [created] = await db.insert(categories).values(cat).returning();
      createdCategories.push(created);
    }
    console.log("✅ Categories created");

    // Create tags
    console.log("Creating tags...");
    const tagData = [
      { name: "New Arrival", slug: "new-arrival" },
      { name: "Best Seller", slug: "best-seller" },
      { name: "Featured", slug: "featured" },
      { name: "Sale", slug: "sale" },
      { name: "Limited Edition", slug: "limited-edition" },
    ];

    for (const tag of tagData) {
      await db.insert(tags).values(tag);
    }
    console.log("✅ Tags created");

    // Create sample products
    console.log("Creating sample products...");
    const productData = [
      {
        name: "Wireless Bluetooth Headphones",
        slug: "wireless-bluetooth-headphones",
        description: "Premium wireless headphones with noise cancellation",
        mrp: 2999,
        sellingPrice: 1999,
        stock: 100,
        categoryId: createdCategories[0].id,
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Cotton T-Shirt",
        slug: "cotton-t-shirt",
        description: "Comfortable 100% cotton t-shirt",
        mrp: 799,
        sellingPrice: 499,
        stock: 200,
        categoryId: createdCategories[1].id,
        isActive: true,
      },
      {
        name: "Stainless Steel Water Bottle",
        slug: "stainless-steel-water-bottle",
        description: "Insulated water bottle keeps drinks cold for 24 hours",
        mrp: 999,
        sellingPrice: 699,
        stock: 150,
        categoryId: createdCategories[2].id,
        isActive: true,
      },
    ];

    for (const product of productData) {
      await db.insert(products).values(product);
    }
    console.log("✅ Sample products created");

    // Create coupons
    console.log("Creating coupons...");
    await db.insert(coupons).values([
      {
        code: "WELCOME10",
        type: "discount",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 500,
        isActive: true,
      },
      {
        code: "FLAT100",
        type: "discount",
        discountType: "fixed",
        discountValue: 100,
        minOrderAmount: 1000,
        isActive: true,
      },
    ]);
    console.log("✅ Coupons created");

    // Create default settings
    console.log("Creating default settings...");
    await db.insert(settings).values([
      {
        group: "public",
        key: "siteName",
        value: "E-commerce Store",
        type: "string",
      },
      { group: "public", key: "currency", value: "INR", type: "string" },
      { group: "public", key: "minOrderAmount", value: "100", type: "number" },
      {
        group: "shipping",
        key: "freeShippingThreshold",
        value: "500",
        type: "number",
      },
      {
        group: "shipping",
        key: "defaultShippingCost",
        value: "50",
        type: "number",
      },
    ]);
    console.log("✅ Default settings created");

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
