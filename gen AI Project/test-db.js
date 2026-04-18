const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000 
    });
    console.log("Connected successfully.");
    
    // Check materials
    const materials = await mongoose.connection.db.collection('materials').find({}).toArray();
    console.log("Materials in DB:", materials.length);
    if(materials.length > 0) {
      console.log(materials.map(m => ({
         _id: m._id,
         title: m.title,
         userId: m.userId,
      })));
    }
  } catch(e) {
    console.log("Error:", e);
  } finally {
    process.exit(0);
  }
}
test();
