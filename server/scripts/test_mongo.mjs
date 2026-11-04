import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority";

async function testConnection() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected successfully!');
    const db = client.db('Crystal-Estate');
    const collections = await db.listCollections().toArray();
    console.log('Collections in Crystal-Estate:', collections.map(c => c.name));
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.close();
  }
}

testConnection();

