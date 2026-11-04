import { MongoClient } from 'mongodb';
import { KOLAPAKKAM_PLOTS, KOLAPAKKAM_METADATA } from '../src/data/kolapakkamPlots.js';
import { plots as initialFeaturedPlots } from '../src/data/site.js';

const uri = "mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority";

async function seed() {
  console.log('Seeding MongoDB database Crystal-Estate...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('Crystal-Estate');

    // 1. Seed featured_plots (the plot locations shown in the Plots UI)
    const featuredColl = db.collection('featured_plots');
    await featuredColl.deleteMany({});
    
    const enrichedPlots = initialFeaturedPlots.map(p => ({
      ...p,
      hasLayoutMap: p.name === 'Kolapakkam',
      layoutSlug: p.name === 'Kolapakkam' ? 'kolapakkam' : null,
      updatedAt: new Date()
    }));

    const resFeatured = await featuredColl.insertMany(enrichedPlots);
    console.log(`Seeded ${resFeatured.insertedCount} featured plots.`);

    // 2. Seed kolapakkam_layout (the 12 interactive plots with svg paths)
    const layoutColl = db.collection('kolapakkam_layout');
    await layoutColl.deleteMany({});
    
    // Store metadata
    await db.collection('layout_metadata').updateOne(
      { slug: 'kolapakkam' },
      { $set: { ...KOLAPAKKAM_METADATA, slug: 'kolapakkam', updatedAt: new Date() } },
      { upsert: true }
    );

    const resPlots = await layoutColl.insertMany(
      KOLAPAKKAM_PLOTS.map(p => ({ ...p, updatedAt: new Date() }))
    );
    console.log(`Seeded ${resPlots.insertedCount} Kolapakkam layout plots.`);

    console.log('Database successfully seeded!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.close();
  }
}

seed();

