import { getDb, closeDb } from './server/src/config/db.js';
import { computePathCentroid } from './server/src/lib/svgPathCentroid.js';

const rawData = [
  {
    path: `m 206.75252 93.535212
  107.94146 -8.546342
  -2.80975 78.67317
  -111.92195 1.63903
z`,
    plotNo: '1',
  },
  {
    path: `m 199.96228 165.30107
  -10.0683 85.22927
  121.28781 -1.17073
v -83.12196
z`,
    plotNo: '2',
  },
  {
    path: `m 310.7135 147.2718
  147.74634 12.6439
v 60.64391
l -84.76098 5.97073
  -0.70244 -22.82927
  -61.58048 -5.85366
z`,
    plotNo: '3a',
  },
  {
    path: `m 311.88423 249.35961
  -0.46829 -45.65854
h 61.58048
l 2.34147 45.65854
z`,
    plotNo: '3',
  },
  {
    path: `M 385.40618 249.35961
V 221.0279
h 46.12683
l 1.87317 27.39512
z`,
    plotNo: '4b',
  },
  {
    path: `m 436.68423 221.73034
h 22.47805
v 27.62927
h -22.47805
z`,
    plotNo: '4c',
  },
  {
    path: `m 459.16228 221.73034
  22.71219 -0.70244
v 28.33171
h -22.71219
z`,
    plotNo: '5d',
  },
  {
    path: `m 462.44033 161.08643
  -3.27805 59.47318
  22.71219 0.46829
v 28.33171
h 61.34634
l -5.85366 -62.51708
z`,
    plotNo: '5',
  },
  {
    path: `m 618.81597 199.53107
  -1.34819 51.90505
  -74.15006 -0.67409
  -0.0969 -40.97316
z`,
    plotNo: '6',
  },
  {
    path: `m 618.49886 201.00839
  -0.81951 48.35122
h 35.82439
l 0.93659 -52.21464
z`,
    plotNo: '7C',
  },
  {
    path: `m 654.90862 196.67668
  -0.93659 52.68293
h 59.23903
v -48.93659
l -23.18049 -8.66342
z`,
    plotNo: '7B',
  },
  {
    path: `m 712.50862 200.0718
  21.30732 8.07805
v 41.20976
h -19.6683
v -48.4683
z`,
    plotNo: '7A',
  },
  {
    path: `m 733.34764 207.68156
  0.93659 41.67805
  21.30732 2.34146
  -0.93659 -35.82439
z`,
    plotNo: '7A',
  },
  {
    path: `m 756.6452 215.17424
  71.06342 24.81951
  0.93658 12.87805
  -73.05365 -1.17073
z`,
    plotNo: '9',
  },
];

async function run() {
  try {
    const db = await getDb();

    // 1. Prepare formatted plot objects
    const phase1Plots = rawData.map((item, idx) => {
      const cleanPath = item.path.trim();
      const centroid = computePathCentroid(cleanPath) || { textX: 100, textY: 100 };
      const idNum = idx + 1;

      return {
        id: idNum,
        plotNo: String(item.plotNo),
        status: 'Available',
        facing: 'East',
        area: '1200 sq.ft',
        dimensions: "30'0\" x 40'0\"",
        width: "30'0\"",
        length: "40'0\"",
        price: '₹ 42.00 Lakhs',
        roadWidth: '30 ft Road',
        type: 'Residential Plot',
        surveyNo: '',
        svgPath: cleanPath,
        textX: Math.round(centroid.textX * 10) / 10,
        textY: Math.round(centroid.textY * 10) / 10,
        updatedAt: new Date(),
        phase: 'Phase 1',
      };
    });

    console.log(`Generated ${phase1Plots.length} Phase 1 plots.`);

    // 2. Fetch existing Somamangalam property document
    const prop = await db.collection('featured_plots').findOne({ name: /somamangalam/i });
    if (!prop) {
      throw new Error('Somamangalam property not found in featured_plots!');
    }

    console.log(`Found property: ${prop.name} (ID: ${prop._id})`);

    // Preserve Phase 2 plots
    const existingLayouts = Array.isArray(prop.layouts) ? [...prop.layouts] : [];
    const phase2Layout = existingLayouts.find(l => l.name?.toLowerCase().includes('phase 2') || l.id?.includes('1794468233177'));
    const phase2Plots = phase2Layout?.plots || [];

    console.log(`Phase 2 plots preserved: ${phase2Plots.length}`);

    // Update layouts array
    const updatedLayouts = existingLayouts.map(l => {
      if (l.id === 'phase-1' || l.name?.toLowerCase().includes('phase 1')) {
        return {
          ...l,
          name: 'Phase 1',
          plots: phase1Plots,
          totalPlots: phase1Plots.length,
          availablePlots: phase1Plots.filter(p => p.status === 'Available').length,
          updatedAt: new Date(),
        };
      }
      return l;
    });

    // If Phase 1 was not in layouts, add it
    if (!updatedLayouts.some(l => l.id === 'phase-1' || l.name?.toLowerCase().includes('phase 1'))) {
      updatedLayouts.unshift({
        id: 'phase-1',
        name: 'Phase 1',
        layoutUrl: prop.layoutUrl || '/plots/layout-somangalam_clean_vector-1794462511723.svg',
        layoutBackgroundUrl: prop.layoutBackgroundUrl || '/plots/layout-somangalam_clean_vector-1794462511723.svg',
        viewBox: prop.viewBox || '0 0 2245.4668 1588.2133',
        width: prop.width || 2245.4668,
        height: prop.height || 1588.2133,
        plots: phase1Plots,
        totalPlots: phase1Plots.length,
        availablePlots: phase1Plots.filter(p => p.status === 'Available').length,
        updatedAt: new Date(),
      });
    }

    // Combined plots list (Phase 1 + Phase 2)
    const allCombinedPlots = [...phase1Plots, ...phase2Plots];

    // 3. Update featured_plots collection
    await db.collection('featured_plots').updateOne(
      { _id: prop._id },
      {
        $set: {
          layouts: updatedLayouts,
          phases: updatedLayouts,
          plots: allCombinedPlots,
          totalPlots: allCombinedPlots.length,
          availablePlots: allCombinedPlots.filter(p => p.status === 'Available').length,
          updatedAt: new Date(),
        },
      }
    );
    console.log('Updated featured_plots document successfully.');

    // 4. Update somangalam_clean_vector_layout collection
    // Remove old Phase 1 plots in collection
    await db.collection('somangalam_clean_vector_layout').deleteMany({
      $or: [
        { phase: 'Phase 1' },
        { phase: { $exists: false } },
        { phase: null },
      ],
    });

    // Insert new Phase 1 plots
    await db.collection('somangalam_clean_vector_layout').insertMany(phase1Plots);
    console.log(`Inserted ${phase1Plots.length} plots into somangalam_clean_vector_layout.`);

    // 5. Update layout_metadata if exists
    await db.collection('layout_metadata').updateMany(
      { slug: { $in: ['somangalam_clean_vector', 'somangalam_clean_vector_no_dashed_lines'] } },
      {
        $set: {
          layouts: updatedLayouts,
          phases: updatedLayouts,
          updatedAt: new Date(),
        },
      }
    );
    console.log('Updated layout_metadata collection.');

    // 6. Verification read
    const verifyDoc = await db.collection('featured_plots').findOne({ _id: prop._id });
    const p1 = verifyDoc.layouts.find(l => l.name === 'Phase 1');
    console.log('Verification: Phase 1 plots in featured_plots:', p1?.plots?.length);
    const colCount = await db.collection('somangalam_clean_vector_layout').countDocuments();
    console.log('Verification: total docs in somangalam_clean_vector_layout:', colCount);

    console.log('SUCCESS: All 14 Somamangalam Phase 1 plots added to DB!');
  } catch (err) {
    console.error('Error applying plots:', err);
  } finally {
    await closeDb();
    process.exit(0);
  }
}

run();

