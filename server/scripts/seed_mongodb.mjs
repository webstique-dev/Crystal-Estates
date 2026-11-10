import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority";

async function verifyDb() {
  console.log('Connecting to MongoDB database Crystal-Estate...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('Crystal-Estate');

    // Ensure indexes for dynamic queries
    await db.collection('featured_plots').createIndex({ projectId: 1 });
    await db.collection('featured_plots').createIndex({ slug: 1 });
    await db.collection('layout_metadata').createIndex({ slug: 1 });
    await db.collection('leads').createIndex({ id: 1 });

    const plotCount = await db.collection('featured_plots').countDocuments();
    const leadsCount = await db.collection('leads').countDocuments();

    console.log(`Database connected successfully!`);
    console.log(`Dynamic Featured Plots in DB: ${plotCount}`);
    console.log(`Leads in DB: ${leadsCount}`);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.close();
  }
}

verifyDb();
