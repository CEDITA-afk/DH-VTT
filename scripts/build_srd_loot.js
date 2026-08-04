import fs from 'fs';
import path from 'path';

async function fetchAllLoot() {
  console.log('Fetching list of loot from Foundryborne Daggerheart GitHub repository...');
  const res = await fetch('https://api.github.com/repos/Foundryborne/daggerheart/contents/src/packs/items/loot');

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub loot directory: ${res.statusText}`);
  }

  const files = await res.json();
  const lootFiles = files.filter((f) => f.name.endsWith('.json'));

  console.log(`Found ${lootFiles.length} loot JSON files. Downloading and parsing...`);

  const rawLoot = [];
  // Fetch in batches of 20
  for (let i = 0; i < lootFiles.length; i += 20) {
    const batch = lootFiles.slice(i, i + 20);
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
    rawLoot.push(...results.filter(Boolean));
    console.log(`Processed ${rawLoot.length}/${lootFiles.length}...`);
  }

  console.log(`Successfully fetched ${rawLoot.length} loot items.`);

  const parsedLoot = rawLoot.map((item) => {
    const sys = item.system || {};

    // HTML strip & clean description
    let description = (sys.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\[\[\/dr [^\]]+\]\]/g, '(Roll check)')
      .trim();

    // Extract Actions
    const actionFeatures = Object.values(sys.actions || {}).map((a) => {
      const aName = a.name || 'Action';
      let aDesc = (a.description || '').replace(/<[^>]*>/g, '').trim();

      const costParts = [];
      if (a.cost && a.cost.length > 0) {
        costParts.push(
          `Cost: ${a.cost.map((c) => `${c.value} ${c.key.toUpperCase()}`).join(', ')}`
        );
      }
      if (a.uses && a.uses.max) {
        costParts.push(`Uses: ${a.uses.max} per ${a.uses.recovery || 'rest'}`);
      }
      if (a.roll && a.roll.trait) {
        costParts.push(`Roll: ${a.roll.trait.toUpperCase()} ${a.roll.difficulty ? `(DC ${a.roll.difficulty})` : ''}`);
      }

      const metaStr = costParts.length > 0 ? ` [${costParts.join(' | ')}]` : '';
      return {
        name: `Action: ${aName}${metaStr}`,
        description: aDesc || 'Performable item action.',
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
        description: eDesc || (changes ? `Grants: ${changes}` : 'Passive or triggered item effect.'),
      };
    });

    const features = [...actionFeatures, ...effectFeatures];

    // Determine category / subCategory
    let category = 'Magic Item';
    let subCategory = 'Loot / Relic';

    const lowerName = item.name.toLowerCase();
    if (lowerName.includes('potion') || lowerName.includes('flask') || lowerName.includes('vial') || lowerName.includes('recipe')) {
      category = 'Gear';
      subCategory = 'Consumable / Potion / Recipe';
    } else if (lowerName.includes('charm') || lowerName.includes('stone') || lowerName.includes('gem') || lowerName.includes('relic')) {
      category = 'Magic Item';
      subCategory = 'Loot / Relic / Charm';
    } else if (lowerName.includes('amulet') || lowerName.includes('ring') || lowerName.includes('pendant') || lowerName.includes('locket')) {
      category = 'Magic Item';
      subCategory = 'Loot / Jewelry';
    } else if (lowerName.includes('cloak') || lowerName.includes('belt') || lowerName.includes('boots') || lowerName.includes('gloves')) {
      category = 'Magic Item';
      subCategory = 'Loot / Wondrous Gear';
    }

    return {
      id: item._id || `loot-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: item.name,
      category,
      subCategory,
      description: description || (features.length > 0 ? features.map((f) => `${f.name}: ${f.description}`).join(' ') : 'Official Daggerheart SRD Loot Item.'),
      features,
      cost: 'Loot',
    };
  });

  // Sort alphabetically by name
  parsedLoot.sort((a, b) => a.name.localeCompare(b.name));

  const fileContent = `import { SrdItem } from '../types';

export const SRD_LOOT: SrdItem[] = ${JSON.stringify(parsedLoot, null, 2)};
`;

  const outputPath = path.resolve('src/data/srdLoot.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written ${parsedLoot.length} SRD loot items to ${outputPath}`);
}

fetchAllLoot().catch((err) => {
  console.error('Fatal error building loot:', err);
  process.exit(1);
});
