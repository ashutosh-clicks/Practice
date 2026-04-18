const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const materials = await db.collection('materials').find({}).toArray();
  console.log("Total materials in DB:", materials.length);
  if (materials.length > 0) {
    console.log("Sample ID:", materials[0]._id.toString(), "| Title:", materials[0].title);
    console.log("User ID:", materials[0].userId.toString(), "Type:", typeof materials[0].userId);
  }
  
  process.exit(0);
}

check();
