import fs from 'fs';
import path from 'path';

async function fetchAllWeapons() {
  console.log('Fetching list of weapons from Foundryborne Daggerheart GitHub repository...');
  const res = await fetch('https://api.github.com/repos/Foundryborne/daggerheart/contents/src/packs/items/weapons');
  
  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub directory: ${res.statusText}`);
  }

  const files = await res.json();
  const weaponFiles = files.filter((f) => f.name.startsWith('weapon') && f.name.endsWith('.json'));

  console.log(`Found ${weaponFiles.length} weapon JSON files. Downloading and parsing...`);

  const rawWeapons = [];
  // Fetch in batches of 20 to avoid rate-limiting
  for (let i = 0; i < weaponFiles.length; i += 20) {
    const batch = weaponFiles.slice(i, i + 20);
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
    rawWeapons.push(...results.filter(Boolean));
    console.log(`Processed ${rawWeapons.length}/${weaponFiles.length}...`);
  }

  console.log(`Successfully fetched ${rawWeapons.length} weapons.`);

  const parsedWeapons = rawWeapons.map((w) => {
    const sys = w.system || {};
    const attack = sys.attack || {};
    const roll = attack.roll || sys.rules?.attack?.roll || {};
    const hpParts = attack.damage?.parts?.hitPoints || {};
    const hpVal = hpParts.value || {};
    const hpTypes = hpParts.type || ['physical'];

    // Damage string formatting
    let dice = hpVal.dice || '';
    let bonus = hpVal.bonus ? `+${hpVal.bonus}` : '';
    let dmgTypes = hpTypes.map((t) => (t === 'magical' ? 'Magick' : t.charAt(0).toUpperCase() + t.slice(1))).join('/');
    
    let damage = `${dice}${bonus} ${dmgTypes}`.trim();
    if (!dice) {
      damage = 'Special / Non-damaging';
    }

    // Range string formatting
    const rangeMap = {
      melee: 'Melee',
      veryClose: 'Very Close',
      close: 'Close',
      far: 'Far',
      veryFar: 'Very Far',
    };
    const range = rangeMap[attack.range] || attack.range || 'Melee';

    // Trait requirement formatting
    const traitRaw = roll.trait || 'strength';
    const trait = traitRaw.charAt(0).toUpperCase() + traitRaw.slice(1);

    // Hands & Secondary
    const hands = sys.burden === 'twoHanded' ? 2 : 1;
    const isSecondary = sys.secondary === true;
    const tier = sys.tier ?? 1;

    // Feature extraction
    const features = (sys.weaponFeatures || []).map((f) => {
      let featureName = f.value ? f.value.charAt(0).toUpperCase() + f.value.slice(1) : 'Feature';

      // Search in effects
      const effectMatches = (w.effects || [])
        .filter((e) => (f.effectIds || []).includes(e._id))
        .map((e) => (e.description ? e.description.replace(/<[^>]*>/g, '').trim() : e.name));

      // Search in actions
      const actionMatches = Object.values(sys.actions || {})
        .filter((a) => (f.actionIds || []).includes(a._id))
        .map((a) => {
          let desc = a.description ? a.description.replace(/<[^>]*>/g, '').trim() : '';
          let costStr = '';
          if (a.cost && a.cost.length > 0) {
            costStr = ` (Cost: ${a.cost.map((c) => `${c.value} ${c.key}`).join(', ')})`;
          }
          return desc ? `${desc}${costStr}` : a.name;
        });

      const combinedDescs = [...effectMatches, ...actionMatches].filter(Boolean);

      return {
        name: featureName,
        description: combinedDescs.length > 0 ? combinedDescs.join('; ') : 'Special weapon feature.',
      };
    });

    // Clean description HTML
    let rawDesc = (sys.description || '').replace(/<[^>]*>/g, '').trim();

    return {
      id: w._id || `wpn-${w.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: w.name,
      tier,
      category: 'Weapon',
      subCategory: `${isSecondary ? 'Secondary' : 'Primary'} Weapon (Tier ${tier})`,
      isSecondary,
      hands: hands,
      range,
      traitRequirement: trait,
      damage,
      features,
      description: rawDesc || (features.length > 0 ? features.map((f) => `**${f.name}**: ${f.description}`).join(' ') : 'Official Daggerheart SRD weapon.'),
      cost: `Tier ${tier}`,
    };
  });

  // Sort by Tier, then Primary vs Secondary, then Name
  parsedWeapons.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.isSecondary !== b.isSecondary) return a.isSecondary ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  const fileContent = `import { SrdItem } from '../types';

export const SRD_WEAPONS: SrdItem[] = ${JSON.stringify(parsedWeapons, null, 2)};
`;

  const outputPath = path.resolve('src/data/srdWeapons.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written ${parsedWeapons.length} SRD weapons to ${outputPath}`);
}

fetchAllWeapons().catch((err) => {
  console.error('Fatal error building weapons:', err);
  process.exit(1);
});
