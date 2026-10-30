import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority";

const correctedPlots = [
  {
    id: 1,
    plotNo: "1",
    status: "Available",
    facing: "East",
    width: "35'0\"",
    length: "22'0\"",
    area: "741 sq.ft",
    price: "₹ 25.93 Lakhs",
    svgPath: "M 307.82,374.2 L 372.33,374.2 L 372.33,422.58 L 330.04,441.99 L 321.71,407.61 Z",
    textX: 340.8,
    textY: 404.1
  },
  {
    id: 2,
    plotNo: "2",
    status: "Booked",
    facing: "East",
    width: "39'0\"",
    length: "26'0\"",
    area: "925 sq.ft",
    price: "₹ 32.37 Lakhs",
    svgPath: "M 290.05,327.16 L 372.33,327.16 L 372.33,374.2 L 307.82,374.2 Z",
    textX: 335.6,
    textY: 350.7
  },
  {
    id: 3,
    plotNo: "3",
    status: "Sold",
    facing: "East",
    width: "49'0\"",
    length: "30'0\"",
    area: "1170 sq.ft",
    price: "₹ 40.95 Lakhs",
    svgPath: "M 288.08,263.12 L 372.33,263.12 L 372.33,327.16 L 290.05,327.16 Z",
    textX: 330.7,
    textY: 295.1
  },
  {
    id: 4,
    plotNo: "4",
    status: "Available",
    facing: "East",
    width: "50'0\"",
    length: "20'0\"",
    area: "990 sq.ft",
    price: "₹ 34.65 Lakhs",
    svgPath: "M 286.77,220.21 L 372.33,220.21 L 372.33,263.12 L 288.08,263.12 Z",
    textX: 329.9,
    textY: 241.7
  },
  {
    id: 5,
    plotNo: "5",
    status: "Available",
    facing: "North",
    width: "50'0\"",
    length: "20'0\"",
    area: "1000 sq.ft",
    price: "₹ 35.00 Lakhs",
    svgPath: "M 415.11,220.21 L 500.67,220.21 L 500.67,262.99 L 415.11,262.99 Z",
    textX: 457.9,
    textY: 241.6
  },
  {
    id: 6,
    plotNo: "6",
    status: "Blocked",
    facing: "West",
    width: "40'0\"",
    length: "25'0\"",
    area: "1289 sq.ft",
    price: "₹ 45.11 Lakhs",
    svgPath: "M 415.11,262.99 L 500.67,262.99 L 500.67,316.47 L 415.11,316.47 Z",
    textX: 457.9,
    textY: 289.7
  },
  {
    id: 7,
    plotNo: "7",
    status: "Available",
    facing: "West",
    width: "40'0\"",
    length: "41'0\"",
    area: "1349 sq.ft",
    price: "₹ 47.21 Lakhs",
    svgPath: "M 415.11,316.47 L 500.67,316.47 L 500.67,367.38 L 415.11,403.42 Z",
    textX: 457.9,
    textY: 350.9
  },
  {
    id: 8,
    plotNo: "8",
    status: "Sold",
    facing: "South",
    width: "46'0\"",
    length: "20'0\"",
    area: "984 sq.ft",
    price: "₹ 34.44 Lakhs",
    svgPath: "M 500.67,305.72 L 586.24,305.72 L 586.24,331.33 L 500.67,367.38 Z",
    textX: 543.5,
    textY: 327.5
  },
  {
    id: 9,
    plotNo: "9",
    status: "Available",
    facing: "East",
    width: "46'0\"",
    length: "20'0\"",
    area: "920 sq.ft",
    price: "₹ 32.20 Lakhs",
    svgPath: "M 500.67,262.99 L 586.24,262.86 L 586.24,305.72 L 500.67,305.72 Z",
    textX: 543.5,
    textY: 284.3
  },
  {
    id: 10,
    plotNo: "10",
    status: "Booked",
    facing: "North",
    width: "50'0\"",
    length: "20'0\"",
    area: "1000 sq.ft",
    price: "₹ 35.00 Lakhs",
    svgPath: "M 500.67,220.21 L 586.24,220.21 L 586.24,262.86 L 500.67,262.99 Z",
    textX: 543.5,
    textY: 241.6
  },
  {
    id: 11,
    plotNo: "11",
    status: "Available",
    facing: "North",
    width: "35'0\"",
    length: "33'0\"",
    area: "1200 sq.ft",
    price: "₹ 42.00 Lakhs",
    svgPath: "M 606.74,219.86 L 682.5,220.21 L 682.5,290.78 L 629.02,313.3 L 629.02,262.86 L 606.74,262.86 Z",
    textX: 647.8,
    textY: 261.6
  },
  {
    id: 12,
    plotNo: "12",
    status: "Available",
    facing: "North",
    width: "35'0\"",
    length: "38'0\"",
    area: "949 sq.ft",
    price: "₹ 33.21 Lakhs",
    // Exact polygon for Plot 12 parcel (35' top, 33' left, 38' bottom, 19' right):
    svgPath: "M 682.5,220.21 L 757.37,220.21 L 757.37,259.23 L 682.5,290.78 Z",
    // Centroid of Plot 12:
    textX: 720.0,
    textY: 254.5
  }
];

async function updateDb() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('Crystal-Estate');
    const col = db.collection('kolapakkam_layout');
    await col.deleteMany({});
    const res = await col.insertMany(correctedPlots.map(p => ({ ...p, updatedAt: new Date() })));
    console.log(`Updated MongoDB kolapakkam_layout with ${res.insertedCount} plots!`);
    
    // Also verify
    const all = await col.find({}, { projection: { _id: 0, plotNo: 1, textX: 1, textY: 1, svgPath: 1 } }).toArray();
    console.log('Plot 12 in DB:', all.find(p => p.plotNo === '12'));
  } finally {
    await client.close();
  }
}

updateDb().catch(console.error);

