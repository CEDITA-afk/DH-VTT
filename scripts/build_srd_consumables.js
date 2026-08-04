import fs from 'fs';
import path from 'path';

async function fetchAllConsumables() {
  console.log('Fetching list of consumables from Foundryborne Daggerheart GitHub repository...');
  const res = await fetch('https://api.github.com/repos/Foundryborne/daggerheart/contents/src/packs/items/consumables');

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub consumables directory: ${res.statusText}`);
  }

  const files = await res.json();
  const consumableFiles = files.filter((f) => f.name.endsWith('.json'));

  console.log(`Found ${consumableFiles.length} consumable JSON files. Downloading and parsing...`);

  const rawConsumables = [];
  // Fetch in batches of 20
  for (let i = 0; i < consumableFiles.length; i += 20) {
    const batch = consumableFiles.slice(i, i + 20);
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
    rawConsumables.push(...results.filter(Boolean));
    console.log(`Processed ${rawConsumables.length}/${consumableFiles.length}...`);
  }

  console.log(`Successfully fetched ${rawConsumables.length} consumables.`);

  const parsedConsumables = rawConsumables.map((item) => {
    const sys = item.system || {};

    // Clean HTML description
    let description = (sys.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\[\[\/dr [^\]]+\]\]/g, '(Roll check)')
      .replace(/@Template\[[^\]]+\]/g, '')
      .trim();

    // Extract Actions and Damage
    const actionFeatures = Object.values(sys.actions || {}).map((a) => {
      const aName = a.name || 'Use';
      let aDesc = (a.description || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/@Template\[[^\]]+\]/g, '')
        .trim();

      const costParts = [];
      if (a.range) costParts.push(`Range: ${a.range}`);
      if (a.roll && a.roll.trait) {
        costParts.push(`Roll: ${a.roll.trait.toUpperCase()}`);
      }
      if (a.damage && a.damage.parts && a.damage.parts.hitPoints) {
        const hpDmg = a.damage.parts.hitPoints;
        if (hpDmg.value) {
          const dice = hpDmg.value.dice || '';
          const mult = hpDmg.value.flatMultiplier || hpDmg.value.multiplier || '';
          costParts.push(`Damage: ${mult !== 1 ? mult : ''}${dice}`);
        }
      }

      const metaStr = costParts.length > 0 ? ` [${costParts.join(' | ')}]` : '';
      return {
        name: `Action: ${aName}${metaStr}`,
        description: aDesc || 'Consumable action.',
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
        description: eDesc || (changes ? `Grants: ${changes}` : 'Consumable passive/active effect.'),
      };
    });

    const features = [...actionFeatures, ...effectFeatures];

    // Determine subCategory based on name
    let subCategory = 'Consumable';
    const lowerName = item.name.toLowerCase();
    if (lowerName.includes('potion')) subCategory = 'Consumable / Potion';
    else if (lowerName.includes('tea')) subCategory = 'Consumable / Tea';
    else if (lowerName.includes('orb') || lowerName.includes('stone') || lowerName.includes('seed')) subCategory = 'Consumable / Magical Object';
    else if (lowerName.includes('elixir') || lowerName.includes('tonic') || lowerName.includes('flask')) subCategory = 'Consumable / Elixir';

    return {
      id: item._id || `consumable-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: item.name,
      category: 'Gear',
      subCategory,
      description: description || (features.length > 0 ? features.map((f) => f.description).join(' ') : 'Official Daggerheart SRD Consumable.'),
      features,
      cost: 'Consumable',
    };
  });

  // Sort alphabetically by name
  parsedConsumables.sort((a, b) => a.name.localeCompare(b.name));

  const fileContent = `import { SrdItem } from '../types';

export const SRD_CONSUMABLES: SrdItem[] = ${JSON.stringify(parsedConsumables, null, 2)};
`;

  const outputPath = path.resolve('src/data/srdConsumables.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written ${parsedConsumables.length} SRD consumable items to ${outputPath}`);
}

fetchAllConsumables().catch((err) => {
  console.error('Fatal error building consumables:', err);
  process.exit(1);
});
