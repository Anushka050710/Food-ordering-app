import { PrismaClient, Role, Country } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const adapter = tursoUrl && tursoToken
  ? new PrismaLibSql({ url: tursoUrl, authToken: tursoToken })
  : new PrismaLibSql({ url: 'file:' + path.join(process.cwd(), 'prisma', 'dev.db') });

const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@india.com', name: 'Admin India', role: Role.ADMIN, country: Country.INDIA },
    { email: 'manager@india.com', name: 'Manager India', role: Role.MANAGER, country: Country.INDIA },
    { email: 'member@india.com', name: 'Member India', role: Role.MEMBER, country: Country.INDIA },
    { email: 'admin@america.com', name: 'Admin America', role: Role.ADMIN, country: Country.AMERICA },
    { email: 'manager@america.com', name: 'Manager America', role: Role.MANAGER, country: Country.AMERICA },
    { email: 'member@america.com', name: 'Member America', role: Role.MEMBER, country: Country.AMERICA },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hashedPassword },
    });
  }

  const spiceGarden = await prisma.restaurant.upsert({
    where: { id: 'rest-india-1' }, update: {},
    create: { id: 'rest-india-1', name: 'Spice Garden', cuisine: 'North Indian', country: Country.INDIA, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  });
  const dosaDen = await prisma.restaurant.upsert({
    where: { id: 'rest-india-2' }, update: {},
    create: { id: 'rest-india-2', name: 'Dosa Den', cuisine: 'South Indian', country: Country.INDIA, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
  });
  const burgerBarn = await prisma.restaurant.upsert({
    where: { id: 'rest-usa-1' }, update: {},
    create: { id: 'rest-usa-1', name: 'Burger Barn', cuisine: 'American', country: Country.AMERICA, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  });
  const pizzaPalace = await prisma.restaurant.upsert({
    where: { id: 'rest-usa-2' }, update: {},
    create: { id: 'rest-usa-2', name: 'Pizza Palace', cuisine: 'Italian-American', country: Country.AMERICA, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  });

  for (const item of [
    { id: 'sg-1', name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 320, category: 'Main Course', restaurantId: spiceGarden.id },
    { id: 'sg-2', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 280, category: 'Starters', restaurantId: spiceGarden.id },
    { id: 'sg-3', name: 'Dal Makhani', description: 'Slow-cooked black lentils', price: 220, category: 'Main Course', restaurantId: spiceGarden.id },
    { id: 'sg-4', name: 'Garlic Naan', description: 'Soft bread with garlic butter', price: 60, category: 'Breads', restaurantId: spiceGarden.id },
    { id: 'sg-5', name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', price: 120, category: 'Desserts', restaurantId: spiceGarden.id },
    { id: 'dd-1', name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 180, category: 'Main Course', restaurantId: dosaDen.id },
    { id: 'dd-2', name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 120, category: 'Breakfast', restaurantId: dosaDen.id },
    { id: 'dd-3', name: 'Vada', description: 'Crispy lentil fritters', price: 80, category: 'Starters', restaurantId: dosaDen.id },
    { id: 'dd-4', name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 60, category: 'Beverages', restaurantId: dosaDen.id },
    { id: 'dd-5', name: 'Payasam', description: 'Sweet rice pudding', price: 100, category: 'Desserts', restaurantId: dosaDen.id },
    { id: 'bb-1', name: 'Classic Cheeseburger', description: 'Beef patty with cheddar and veggies', price: 12.99, category: 'Burgers', restaurantId: burgerBarn.id },
    { id: 'bb-2', name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce with crispy bacon', price: 15.99, category: 'Burgers', restaurantId: burgerBarn.id },
    { id: 'bb-3', name: 'Loaded Fries', description: 'Fries with cheese sauce and jalapeños', price: 7.99, category: 'Sides', restaurantId: burgerBarn.id },
    { id: 'bb-4', name: 'Onion Rings', description: 'Crispy battered onion rings', price: 5.99, category: 'Sides', restaurantId: burgerBarn.id },
    { id: 'bb-5', name: 'Chocolate Milkshake', description: 'Thick creamy chocolate shake', price: 6.99, category: 'Beverages', restaurantId: burgerBarn.id },
    { id: 'pp-1', name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil', price: 14.99, category: 'Pizzas', restaurantId: pizzaPalace.id },
    { id: 'pp-2', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni slices', price: 17.99, category: 'Pizzas', restaurantId: pizzaPalace.id },
    { id: 'pp-3', name: 'Caesar Salad', description: 'Romaine, croutons, parmesan', price: 9.99, category: 'Salads', restaurantId: pizzaPalace.id },
    { id: 'pp-4', name: 'Garlic Bread', description: 'Toasted bread with garlic butter', price: 5.99, category: 'Sides', restaurantId: pizzaPalace.id },
    { id: 'pp-5', name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 8.99, category: 'Desserts', restaurantId: pizzaPalace.id },
  ]) {
    await prisma.menuItem.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  console.log('✅ Seed completed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
