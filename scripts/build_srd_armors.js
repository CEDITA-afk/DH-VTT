import fs from 'fs';
import path from 'path';

async function fetchAllArmors() {
  console.log('Fetching list of armors from Foundryborne Daggerheart GitHub repository...');
  const res = await fetch('https://api.github.com/repos/Foundryborne/daggerheart/contents/src/packs/items/armors');

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub armors directory: ${res.statusText}`);
  }

  const files = await res.json();
  const armorFiles = files.filter((f) => f.name.endsWith('.json'));

  console.log(`Found ${armorFiles.length} armor JSON files. Downloading and parsing...`);

  const rawArmors = [];
  // Fetch in batches of 20
  for (let i = 0; i < armorFiles.length; i += 20) {
    const batch = armorFiles.slice(i, i + 20);
    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const r = await fetch(file.download_url);
          return await r.json();
        } catch (err) {
          console.error(`Error downloading ${file.name}:`, err);
          return null;
        }
      })
    );
    rawArmors.push(...results.filter(Boolean));
    console.log(`Processed ${rawArmors.length}/${armorFiles.length}...`);
  }

  console.log(`Successfully fetched ${rawArmors.length} armors.`);

  const parsedArmors = rawArmors.map((item) => {
    const sys = item.system || {};

    // Clean HTML description
    let description = (sys.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\[\[\/dr [^\]]+\]\]/g, '(Roll check)')
      .replace(/@Template\[[^\]]+\]/g, '')
      .trim();

    // Extract Actions and Features
    const actionFeatures = Object.values(sys.actions || {}).map((a) => {
      const aName = a.name || 'Feature';
      let aDesc = (a.description || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/@Template\[[^\]]+\]/g, '')
        .trim();

      const costParts = [];
      if (a.cost && a.cost.length > 0) {
        costParts.push(
          `Cost: ${a.cost.map((c) => `${c.value} ${c.key.toUpperCase()}`).join(', ')}`
        );
      }
      if (a.uses && a.uses.max) {
        costParts.push(`Uses: ${a.uses.max} per ${a.uses.recovery || 'rest'}`);
      }

      const metaStr = costParts.length > 0 ? ` [${costParts.join(' | ')}]` : '';
      return {
        name: `${aName}${metaStr}`,
        description: aDesc || 'Armor feature.',
      };
    });

    // Extract Effects
    const effectFeatures = (item.effects || []).map((e) => {
      const eName = e.name || 'Effect';
      let eDesc = (e.description || '').replace(/<[^>]*>/g, '').trim();

      const changes = (e.system?.changes || e.changes || [])
        .map((c) => `${c.key.split('.').pop()} ${c.type || '+'} ${c.value}`)
        .join(', ');

      const statusList = (e.statuses || []).join(', ');

      const metaParts = [];
      if (changes) metaParts.push(`Bonus: ${changes}`);
      if (statusList) metaParts.push(`Applies: ${statusList}`);

      const metaStr = metaParts.length > 0 ? ` [${metaParts.join(' | ')}]` : '';

      return {
        name: `Effect: ${eName}${metaStr}`,
        description: eDesc || (changes ? `Grants: ${changes}` : 'Armor passive effect.'),
      };
    });

    const features = [...actionFeatures, ...effectFeatures];

    const armorScore = sys.baseScore !== undefined ? Number(sys.baseScore) : (sys.armor?.max !== undefined ? Number(sys.armor.max) : (sys.armorScore !== undefined ? Number(sys.armorScore) : 1));
    const tier = sys.tier !== undefined ? Number(sys.tier) : 1;

    return {
      id: item._id || `armor-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: item.name,
      category: 'Armor',
      subCategory: `Armor (Tier ${tier})`,
      tier: tier,
      armorRating: armorScore,
      description: description || (features.length > 0 ? features.map((f) => f.description).join(' ') : 'Official Daggerheart SRD Armor.'),
      features,
      cost: sys.price ? `${sys.price} Gold` : 'Armor',
    };
  });

  // Sort by Tier ascending, then Name alphabetically
  parsedArmors.sort((a, b) => {
    if ((a.tier || 0) !== (b.tier || 0)) return (a.tier || 0) - (b.tier || 0);
    return a.name.localeCompare(b.name);
  });

  const fileContent = `import { SrdItem } from '../types';

export const SRD_ARMORS: SrdItem[] = ${JSON.stringify(parsedArmors, null, 2)};
`;

  const outputPath = path.resolve('src/data/srdArmors.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written ${parsedArmors.length} SRD armor items to ${outputPath}`);
}

fetchAllArmors().catch((err) => {
  console.error('Fatal error building armors:', err);
  process.exit(1);
});
