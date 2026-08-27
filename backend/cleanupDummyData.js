require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for cleanup...');

    // 1. Delete Orders
    const ordersResult = await mongoose.connection.collection('orders').deleteMany({});
    console.log(`Deleted ${ordersResult.deletedCount} orders.`);

    // 2. Delete Customer Users
    const usersResult = await mongoose.connection.collection('users').deleteMany({ role: 'customer' });
    console.log(`Deleted ${usersResult.deletedCount} customer users.`);

    // 3. Delete Coupons starting with TEST_
    const couponsResult = await mongoose.connection.collection('coupons').deleteMany({ code: /^TEST_/i });
    console.log(`Deleted ${couponsResult.deletedCount} test coupons.`);

    // 4. Delete Products (candles or TEST)
    const productsResult = await mongoose.connection.collection('products').deleteMany({
      $or: [
        { name: /candle/i },
        { name: /^TEST/i }
      ]
    });
    console.log(`Deleted ${productsResult.deletedCount} dummy products.`);

    // 5. Delete dummy Categories
    const categoriesResult = await mongoose.connection.collection('categories').deleteMany({
      $or: [
        { name: /Candle/i },
        { name: /^TEST/i }
      ]
    });
    console.log(`Deleted ${categoriesResult.deletedCount} dummy categories.`);

    // 6. Delete dummy SubCategories
    const subcatsResult = await mongoose.connection.collection('subcategories').deleteMany({
      $or: [
        { name: /^Test/i },
        { name: /^New Test/i }
      ]
    });
    console.log(`Deleted ${subcatsResult.deletedCount} dummy subcategories.`);

    console.log('Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanup();
