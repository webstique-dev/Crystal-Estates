import fs from 'fs';
import { getDb, closeDb } from './server/src/config/db.js';
import { computePathCentroid } from './server/src/lib/svgPathCentroid.js';

function parseCSV(text) {
  const lines = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === '\n' && !inQuotes) {
      lines.push(cur);
      cur = '';
    } else if (c === '\r' && !inQuotes) {
      // ignore
    } else {
      cur += c;
    }
  }
  if (cur) lines.push(cur);

  const rows = [];
  for (const line of lines) {
    const cols = [];
    let cell = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (c === ',' && !inQ) {
        cols.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cols.push(cell.trim());
    rows.push(cols);
  }
  return rows;
}

async function run() {
  try {
    const content = fs.readFileSync('somangalam_raw.csv', 'utf8');
    const rows = parseCSV(content);

    // Extract Table 1 (SNO 1 to 145)
    const phase1Plots = [];
    for (const r of rows) {
      const sno = parseInt(r[0], 10);
      if (!isNaN(sno) && sno >= 1 && sno <= 145) {
        const plotNo = String(r[1] || sno).trim();
        const rawStatus = (r[2] || '').trim().toLowerCase();
        const status = rawStatus === 'sold' ? 'Sold' : 'Available';
        const rawPath = (r[3] || '').trim();
        const hasPath = rawPath.length > 5 && (rawPath.startsWith('m') || rawPath.startsWith('M'));
        const svgPath = hasPath ? rawPath : '';
        const centroid = hasPath ? computePathCentroid(svgPath) : null;

        phase1Plots.push({
          id: sno,
          plotNo,
          status,
          facing: 'East',
          area: '1200 sq.ft',
          dimensions: "30'0\" x 40'0\"",
          width: "30'0\"",
          length: "40'0\"",
          price: status === 'Sold' ? '₹ 42.00 Lakhs' : '₹ 42.00 Lakhs',
          roadWidth: '30 ft Road',
          type: 'Residential Plot',
          surveyNo: '',
          svgPath,
          textX: centroid ? Math.round(centroid.textX * 10) / 10 : null,
          textY: centroid ? Math.round(centroid.textY * 10) / 10 : null,
          phase: 'Phase 1',
          updatedAt: new Date(),
        });
      }
    }

    console.log(`Parsed ${phase1Plots.length} plots for Somamangalam Phase 1 from Table 1.`);
    const soldCount = phase1Plots.filter(p => p.status === 'Sold').length;
    const availCount = phase1Plots.filter(p => p.status === 'Available').length;
    const pathCount = phase1Plots.filter(p => p.svgPath).length;
    console.log(`Phase 1 Breakdown -> Sold: ${soldCount}, Available: ${availCount}, With SVG Path: ${pathCount}`);

    const db = await getDb();

    // 1. Fetch existing Somamangalam property
    const prop = await db.collection('featured_plots').findOne({ name: /somamangalam/i });
    if (!prop) {
      throw new Error('Somamangalam property not found in featured_plots!');
    }

    console.log(`Found property: ${prop.name} (ID: ${prop._id})`);

    // Preserve Phase 2 layout and plots
    const existingLayouts = Array.isArray(prop.layouts) ? [...prop.layouts] : [];
    const phase2Layout = existingLayouts.find(l => l.name?.toLowerCase().includes('phase 2') || l.id?.includes('1794468233177'));
    const phase2Plots = phase2Layout?.plots || [];
    console.log(`Preserving Phase 2 plots: ${phase2Plots.length}`);

    // Update Phase 1 in layouts
    const updatedLayouts = existingLayouts.map(l => {
      if (l.id === 'phase-1' || l.name?.toLowerCase().includes('phase 1')) {
        return {
          ...l,
          name: 'Phase 1',
          plots: phase1Plots,
          totalPlots: phase1Plots.length,
          availablePlots: availCount,
          soldPlots: soldCount,
          updatedAt: new Date(),
        };
      }
      return l;
    });

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
        availablePlots: availCount,
        soldPlots: soldCount,
        updatedAt: new Date(),
      });
    }

    const allCombinedPlots = [...phase1Plots, ...phase2Plots];
    const totalAvail = allCombinedPlots.filter(p => p.status === 'Available').length;
    const totalSold = allCombinedPlots.filter(p => p.status === 'Sold').length;

    // 2. Update featured_plots
    await db.collection('featured_plots').updateOne(
      { _id: prop._id },
      {
        $set: {
          layouts: updatedLayouts,
          phases: updatedLayouts,
          plots: allCombinedPlots,
          totalPlots: allCombinedPlots.length,
          availablePlots: totalAvail,
          soldPlots: totalSold,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`Updated featured_plots: totalPlots = ${allCombinedPlots.length}, available = ${totalAvail}, sold = ${totalSold}`);

    // 3. Update somangalam_clean_vector_layout collection
    // Remove old Phase 1 plots
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

    // 4. Update layout_metadata
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

    // 5. Verification
    const verifyDoc = await db.collection('featured_plots').findOne({ _id: prop._id });
    const p1 = verifyDoc.layouts.find(l => l.name === 'Phase 1');
    console.log(`Verification: Phase 1 plots count in featured_plots = ${p1?.plots?.length}`);
    const colCount = await db.collection('somangalam_clean_vector_layout').countDocuments();
    console.log(`Verification: Total documents in somangalam_clean_vector_layout = ${colCount}`);

    console.log('SUCCESS: All 145 Table 1 plots updated in DB for Somamangalam Phase 1!');
  } catch (err) {
    console.error('Error in database update:', err);
  } finally {
    await closeDb();
    process.exit(0);
  }
}

run();

