const mongoose = require('mongoose');
async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const materials = await db.collection('materials').find({}).toArray();
  console.log(JSON.stringify(materials, null, 2));
  process.exit(0);
}
test();
