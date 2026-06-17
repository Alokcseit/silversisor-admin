import mongoose from 'mongoose';
import 'dotenv/config';
import AdminUser from './src/models/AdminUser.js';
import CatalogService from './src/models/CatalogService.js';

const services = [
  { name: 'Classic Haircut', description: 'Traditional scissor & comb cut', category: 'haircut', displayOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=200&q=80' },
  { name: 'Beard Trim', description: 'Shape & define your beard', category: 'beard', displayOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665666?w=200&q=80' },
  { name: 'Hair Color', description: 'Full head color application', category: 'color', displayOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
  { name: 'Facial Cleanup', description: 'Basic facial grooming', category: 'facial', displayOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80' },
  { name: 'Head Massage', description: 'Relaxing scalp massage', category: 'massage', displayOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=200&q=80' },
  { name: 'Kids Haircut', description: 'Gentle cut for little ones', category: 'haircut', displayOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db7?w=200&q=80' },
];

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB connected');

  await AdminUser.updateOne(
    { email: 'admin@silverscisor.com' },
    { $set: { 'permissions.manageServices': true } }
  );
  console.log('Admin permissions updated');

  for (const svc of services) {
    await CatalogService.findOneAndUpdate(
      { name: svc.name },
      { $setOnInsert: svc },
      { upsert: true }
    );
  }
  console.log('Catalog services seeded');
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
