import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Shield,
  Layers,
  Award,
  Users,
  Feather,
  Sword,
  Package,
  Compass,
  ExternalLink,
  HelpCircle,
  Flame,
  Clock,
  Skull,
  Zap,
  Dices,
  FileText,
} from 'lucide-react';
import {
  DOMAIN_CARDS_DATA,
  CLASSES_DATA,
  ANCESTRIES_DATA,
  COMMUNITIES_DATA,
} from '../data/domainsAndClasses';
import { ITEMS_DATA } from '../data/itemsData';
import { GM_HELP_DATA, GmGuideSection } from '../data/gmHelpData';
import { DAGGERHEART_ROLLTABLES, RollTable } from '../data/rollTablesData';
import { DomainCard, DomainName, SrdItem } from '../types';
import { soundFX } from '../utils/audioSynth';

export const DomainDeckLibrary: React.FC = () => {
  const [subTab, setSubTab] = useState<'cards' | 'items' | 'classes' | 'ancestries' | 'communities' | 'gm-help'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Item filters
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<'All' | 'Weapon' | 'Loot' | 'Consumable' | 'Armor' | 'Gear' | 'Magic Item'>('All');
  const [itemTierFilter, setItemTierFilter] = useState<number | 'All'>('All');

  // GM Help filters & modal
  const [gmHelpSearch, setGmHelpSearch] = useState('');
  const [gmHelpCategory, setGmHelpCategory] = useState<'All' | 'GM Core' | 'Moves & Fear' | 'Encounters & Hazards' | 'Clocks & Story' | 'Campaigns & Tools' | 'Rolltables' | 'SRD Reference'>('All');
  const [isSrdModalOpen, setIsSrdModalOpen] = useState(false);
  const [activeSrdUrl, setActiveSrdUrl] = useState('https://callmepartario.github.io/og-dhsrd/#gm-guidance');

  // Interactive Rolltables State
  const [rolledTableResults, setRolledTableResults] = useState<
    Record<string, { roll: number; text: string; details?: string }>
  >({});
  const [isTableRolling, setIsTableRolling] = useState<Record<string, boolean>>({});
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<SrdItem | null>(null);

  const findItemData = (itemText: string): SrdItem | undefined => {
    if (!itemText) return undefined;
    const clean = itemText.trim().toLowerCase();

    let match = ITEMS_DATA.find((i) => i.name.toLowerCase() === clean);
    if (match) return match;

    match = ITEMS_DATA.find((i) => i.name.toLowerCase().includes(clean) || clean.includes(i.name.toLowerCase()));
    if (match) return match;

    const parts = clean.split(' ');
    if (parts.length > 1) {
      const double = `${parts[0]} ${parts[1]}`;
      match = ITEMS_DATA.find((i) => i.name.toLowerCase().includes(double));
      if (match) return match;
    }

    if (parts[0].length > 3) {
      match = ITEMS_DATA.find((i) => i.name.toLowerCase().includes(parts[0]));
    }

    return match;
  };

  const handleInspectItemName = (itemName: string) => {
    const item = findItemData(itemName);
    if (item) {
      setSelectedItemForModal(item);
    } else {
      setSelectedItemForModal({
        id: `custom-${itemName}`,
        name: itemName,
        category: 'Magic Item',
        subCategory: 'Loot / Consumable',
        description: `Official Daggerheart SRD item: ${itemName}. View the Items & Loot Vault tab for full details.`,
        cost: 'Loot',
      });
    }
  };

  const handleRollTable = (table: RollTable) => {
    soundFX.playDiceRoll();
    setIsTableRolling((prev) => ({ ...prev, [table.id]: true }));

    setTimeout(() => {
      let roll = 1;
      if (table.dice === '1d60') roll = Math.floor(Math.random() * 60) + 1;
      else if (table.dice === '1d12') roll = Math.floor(Math.random() * 12) + 1;
      else if (table.dice === '1d20') roll = Math.floor(Math.random() * 20) + 1;
      else if (table.dice === '1d10') roll = Math.floor(Math.random() * 10) + 1;
      else if (table.dice === '1d6') roll = Math.floor(Math.random() * 6) + 1;
      else if (table.dice === '2d6') roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;

      const match = table.results.find((res) => roll >= res.range[0] && roll <= res.range[1]) || table.results[0];

      setRolledTableResults((prev) => ({
        ...prev,
        [table.id]: { roll, text: match.text, details: match.details },
      }));
      setIsTableRolling((prev) => ({ ...prev, [table.id]: false }));
    }, 250);
  };

  const filteredCards = DOMAIN_CARDS_DATA.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.effectDetails && card.effectDetails.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === 'all' || card.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const filteredItems = ITEMS_DATA.filter((item) => {
    const s = itemSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !s ||
      item.name.toLowerCase().includes(s) ||
      item.description.toLowerCase().includes(s) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(s)) ||
      (item.traitRequirement && item.traitRequirement.toLowerCase().includes(s)) ||
      (item.damage && item.damage.toLowerCase().includes(s)) ||
      (item.features &&
        item.features.some(
          (f) => f.name.toLowerCase().includes(s) || f.description.toLowerCase().includes(s)
        ));

    let matchesCategory = true;
    if (itemCategoryFilter === 'Weapon') matchesCategory = item.category === 'Weapon';
    else if (itemCategoryFilter === 'Loot') matchesCategory = item.cost === 'Loot' || item.subCategory?.includes('Loot') || false;
    else if (itemCategoryFilter === 'Consumable') matchesCategory = item.cost === 'Consumable' || item.subCategory?.includes('Consumable') || false;
    else if (itemCategoryFilter === 'Armor') matchesCategory = item.category === 'Armor';
    else if (itemCategoryFilter === 'Gear') matchesCategory = item.category === 'Gear';
    else if (itemCategoryFilter === 'Magic Item') matchesCategory = item.category === 'Magic Item';

    const matchesTier =
      itemTierFilter === 'All' || item.tier === undefined || item.tier === itemTierFilter;

    return matchesSearch && matchesCategory && matchesTier;
  });

  const filteredGmHelp = GM_HELP_DATA.filter((guide) => {
    const s = gmHelpSearch.toLowerCase().trim();
    const matchesSearch =
      !s ||
      guide.title.toLowerCase().includes(s) ||
      guide.summary.toLowerCase().includes(s) ||
      guide.details.some((d) => d.toLowerCase().includes(s)) ||
      guide.bulletPoints.some((b) => b.toLowerCase().includes(s));

    const matchesCategory = gmHelpCategory === 'All' || guide.category === gmHelpCategory;

    return matchesSearch && matchesCategory;
  });

  const DOMAIN_COLORS: Record<DomainName, { bg: string; text: string; border: string }> = {
    Arcana: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
    Blade: { bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-700/50' },
    Bone: { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700/50' },
    Codex: { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
    Grace: { bg: 'bg-pink-950/60', text: 'text-pink-300', border: 'border-pink-700/50' },
    Midnight: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-700/50' },
    Sage: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
    Splendor: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
    Valor: { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700/50' },
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Daggerheart Data SRD</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore official Domain Cards, Weapons, Armors, Consumables, Loot, Classes, Ancestries, and Communities.
            </p>
          </div>

          {/* Subtabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSubTab('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'cards'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Domain Cards</span>
            </button>

            <button
              onClick={() => setSubTab('items')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'items'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              <span>Equipment & Items ({ITEMS_DATA.length})</span>
            </button>

            <button
              onClick={() => setSubTab('classes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'classes'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Classes</span>
            </button>

            <button
              onClick={() => setSubTab('ancestries')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'ancestries'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Ancestries</span>
            </button>

            <button
              onClick={() => setSubTab('communities')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'communities'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Communities</span>
            </button>

            <button
              onClick={() => setSubTab('gm-help')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'gm-help'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>GM Help & SRD</span>
            </button>
          </div>
        </div>

        {/* Filter Bar for Cards */}
        {subTab === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domain cards..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All 9 Domains</option>
              <option value="Arcana">Arcana</option>
              <option value="Blade">Blade</option>
              <option value="Bone">Bone</option>
              <option value="Codex">Codex</option>
              <option value="Grace">Grace</option>
              <option value="Midnight">Midnight</option>
              <option value="Sage">Sage</option>
              <option value="Splendor">Splendor</option>
              <option value="Valor">Valor</option>
            </select>
          </div>
        )}

        {/* Filter Bar for Items */}
        {subTab === 'items' && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  placeholder="Search weapons, loot, relics, features, damage..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'Weapon', 'Loot', 'Consumable', 'Armor', 'Gear', 'Magic Item'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setItemCategoryFilter(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      itemCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Weapon Tier Filter */}
            {(itemCategoryFilter === 'All' || itemCategoryFilter === 'Weapon') && (
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                <span className="font-sans font-semibold text-slate-400 uppercase text-[10px]">Tier Filter:</span>
                {(['All', 0, 1, 2, 3, 4] as const).map((t) => (
                  <button
                    key={String(t)}
                    onClick={() => setItemTierFilter(t)}
                    className={`px-2 py-0.5 rounded text-xs transition ${
                      itemTierFilter === t
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {t === 'All' ? 'All Tiers' : `Tier ${t}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Domain Cards Vault View */}
      {subTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const style = DOMAIN_COLORS[card.domain] || {
              bg: 'bg-slate-900',
              text: 'text-slate-200',
              border: 'border-slate-800',
            };

            return (
              <div
                key={card.id}
                className={`${style.bg} border ${style.border} rounded-2xl p-5 shadow-lg space-y-3 relative hover:border-amber-500/50 transition`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${style.border} ${style.text}`}
                      >
                        {card.domain} Domain • Level {card.level}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {card.type}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-slate-100 mt-1">
                      {card.name}
                    </h3>
                  </div>

                  {card.hopeCost !== undefined && card.hopeCost > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold">
                      {card.hopeCost} Hope
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 italic">{card.description}</p>

                {card.effectDetails && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                    {card.effectDetails}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Items & Loot View */}
      {subTab === 'items' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 hover:border-amber-500/50 transition relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Item Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.tier !== undefined && (
                        <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-800/80 px-1.5 py-0.2 rounded font-mono">
                          Tier {item.tier}
                        </span>
                      )}
                    </h3>
                    <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1 mt-0.5">
                      <span>{item.subCategory || item.category}</span>
                      {item.hands && <span>• {item.hands}H</span>}
                      {item.isSecondary !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] ${
                            item.isSecondary
                              ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.isSecondary ? 'Secondary' : 'Primary'}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    {item.cost || 'Loot'}
                  </span>
                </div>

                {/* Stats Grid */}
                {(item.damage || item.range || item.traitRequirement || item.armorRating !== undefined) && (
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono">
                    {item.damage && (
                      <div>
                        <span className="text-red-400 font-bold">DMG:</span>{' '}
                        <span className="text-slate-200">{item.damage}</span>
                      </div>
                    )}
                    {item.range && (
                      <div>
                        <span className="text-blue-400 font-bold">RNG:</span>{' '}
                        <span className="text-slate-200">{item.range}</span>
                      </div>
                    )}
                    {item.traitRequirement && (
                      <div>
                        <span className="text-purple-400 font-bold">Trait:</span>{' '}
                        <span className="text-slate-200">{item.traitRequirement}</span>
                      </div>
                    )}
                    {item.armorRating !== undefined && (
                      <div>
                        <span className="text-amber-400 font-bold">Armor:</span>{' '}
                        <span className="text-slate-200">+{item.armorRating}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Features & Actions */}
                {item.features && item.features.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">
                      {item.category === 'Weapon' ? 'Weapon Features:' : 'Item Actions & Effects:'}
                    </span>
                    <div className="space-y-1.5">
                      {item.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs"
                        >
                          <span className="font-bold text-amber-300">{feat.name}: </span>
                          <span className="text-slate-300 leading-relaxed">{feat.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-slate-300 leading-relaxed italic border-t border-slate-800/60 pt-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Classes View */}
      {subTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CLASSES_DATA.map((cls) => (
            <div
              key={cls.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-amber-200">{cls.name}</h3>
                  <p className="text-xs text-purple-400 font-semibold mt-0.5">
                    Domains: {cls.domains.join(' & ')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  Evasion: {cls.evasionBase}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    Class Feature: {cls.classFeature.name}
                  </span>
                  <p className="text-slate-400">{cls.classFeature.description}</p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-purple-300 block mb-0.5">
                    Hope Feature: {cls.hopeFeature.name}
                  </span>
                  <p className="text-slate-400">{cls.hopeFeature.description}</p>
                </div>
              </div>

              {/* Subclasses */}
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500 font-bold block mb-1">Subclasses:</span>
                <div className="flex flex-wrap gap-1">
                  {cls.subclasses.map((sc) => (
                    <span
                      key={sc}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono border border-slate-800"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ancestries View */}
      {subTab === 'ancestries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ANCESTRIES_DATA.map((anc) => (
            <div
              key={anc.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2"
            >
              <h3 className="font-serif font-bold text-base text-amber-200">{anc.name}</h3>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-amber-400 block mb-0.5">
                  {anc.featureName}
                </span>
                <p className="text-slate-300">{anc.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Communities View */}
      {subTab === 'communities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMUNITIES_DATA.map((com) => (
            <div
              key={com.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2"
            >
              <h3 className="font-serif font-bold text-base text-purple-200">{com.name}</h3>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-purple-300 block mb-0.5">
                  {com.featureName}
                </span>
                <p className="text-slate-300">{com.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GM Help & SRD View */}
      {subTab === 'gm-help' && (
        <div className="space-y-6">
          {/* Official OG-DHSRD Quick Launch Banner */}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 p-5 rounded-2xl border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono">
                  Official SRD Web Reference
                </span>
                <h3 className="font-serif font-bold text-lg text-amber-200">
                  Open Gaming Daggerheart SRD Guide
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Direct community & official documentation for running Daggerheart: GM moves, fear mechanics, difficulty thresholds, and campaign guidelines from{' '}
                <span className="text-amber-300 font-mono">https://callmepartario.github.io/og-dhsrd/</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveSrdUrl('https://callmepartario.github.io/og-dhsrd/');
                  setIsSrdModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open SRD Viewer</span>
              </button>

              <a
                href="https://callmepartario.github.io/og-dhsrd/pdfs/old-gus-daggerheart-gm-screen.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold rounded-xl text-xs border border-amber-500/50 transition flex items-center gap-1.5 shadow-md"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Old Gus' GM Screen PDF</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>

              <a
                href="https://callmepartario.github.io/og-dhsrd/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* GM Help Category & Search Filters */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={gmHelpSearch}
                  onChange={(e) => setGmHelpSearch(e.target.value)}
                  placeholder="Search GM moves, fear rules, target difficulty, encounter budget..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'GM Core', 'Moves & Fear', 'Encounters & Hazards', 'Clocks & Story', 'Rolltables', 'SRD Reference'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGmHelpCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      gmHelpCategory === cat
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daggerheart Interactive Rolltables Section */}
          {(gmHelpCategory === 'All' || gmHelpCategory === 'Rolltables') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center space-x-2">
                  <Dices className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif font-bold text-lg text-amber-200">
                    Daggerheart Rolltables (Foundryborne & Core SRD)
                  </h3>
                </div>
                <span className="text-xs text-amber-400 font-mono">
                  {DAGGERHEART_ROLLTABLES.length} Rollable Tables
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {DAGGERHEART_ROLLTABLES.filter((table) => {
                  if (!gmHelpSearch) return true;
                  const s = gmHelpSearch.toLowerCase();
                  return (
                    table.title.toLowerCase().includes(s) ||
                    table.description.toLowerCase().includes(s) ||
                    table.category.toLowerCase().includes(s) ||
                    table.results.some((r) => r.text.toLowerCase().includes(s))
                  );
                }).map((table) => {
                  const lastRoll = rolledTableResults[table.id];
                  const rolling = isTableRolling[table.id];
                  const isExpanded = expandedTableId === table.id;

                  return (
                    <div
                      key={table.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                                {table.category}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {table.dice}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-base text-amber-200 mt-1">
                              {table.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleRollTable(table)}
                            disabled={rolling}
                            className={`px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 ${
                              rolling ? 'opacity-50 animate-pulse' : ''
                            }`}
                          >
                            <Dices className="w-4 h-4" />
                            <span>{rolling ? 'Rolling...' : `Roll ${table.dice}`}</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{table.description}</p>

                        {/* Active Roll Result Callout Box */}
                        {lastRoll && (
                          <div className="bg-amber-950/40 border border-amber-500/50 p-3.5 rounded-xl space-y-2 shadow-inner">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-amber-500/30 pb-1">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Rolled [{lastRoll.roll}] on {table.dice}:</span>
                              </span>
                              <span className="font-mono text-[10px] text-amber-400/80">Result</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-100">{lastRoll.text}</p>
                                {lastRoll.details && (
                                  <p className="text-[11px] text-amber-200/90 italic leading-snug mt-0.5">
                                    {lastRoll.details}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleInspectItemName(lastRoll.text)}
                                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-[11px] font-semibold shrink-0 transition flex items-center gap-1.5 shadow-sm"
                                title="Inspect item details and SRD stats"
                              >
                                <Package className="w-3.5 h-3.5 text-amber-400" />
                                <span>View Item</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Table Rows Preview or Collapsible Full List */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                              Table Results ({table.results.length} Outcomes)
                            </span>
                            <button
                              onClick={() => setExpandedTableId(isExpanded ? null : table.id)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline"
                            >
                              {isExpanded ? 'Hide Table Rows' : 'View Full Table'}
                            </button>
                          </div>

                          {/* Rolltable Rows */}
                          <div
                            className={`bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden ${
                              isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-48 overflow-y-auto'
                            }`}
                          >
                            {table.results.map((res, idx) => {
                              const isSelected = lastRoll && lastRoll.roll >= res.range[0] && lastRoll.roll <= res.range[1];
                              return (
                                <div
                                  key={idx}
                                  className={`p-2.5 text-xs flex items-start gap-3 transition ${
                                    isSelected
                                      ? 'bg-amber-500/20 text-amber-200 font-medium'
                                      : 'text-slate-300 hover:bg-slate-900/50'
                                  }`}
                                >
                                  <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0 text-[10px]">
                                    {res.range[0] === res.range[1] ? res.range[0] : `${res.range[0]}-${res.range[1]}`}
                                  </span>
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="leading-snug font-medium">{res.text}</p>
                                      <button
                                        onClick={() => handleInspectItemName(res.text)}
                                        className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline shrink-0 flex items-center gap-1 font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800/80 transition"
                                        title="Inspect SRD Item Card"
                                      >
                                        <span>Inspect</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                    {res.details && (
                                      <p className="text-[10px] text-slate-400 italic">{res.details}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GM Help Guide Cards */}
          {(gmHelpCategory !== 'Rolltables') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGmHelp.map((guide) => (
              <div
                key={guide.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3.5 hover:border-amber-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2 border-b border-slate-800/80 pb-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                        {guide.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-amber-200">
                        {guide.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setActiveSrdUrl(guide.anchorUrl);
                          setIsSrdModalOpen(true);
                        }}
                        className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono flex items-center gap-1 transition"
                        title="View in Embedded SRD Viewer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>#{guide.anchorId}</span>
                      </button>

                      <a
                        href={guide.anchorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-amber-300 transition"
                        title="Open direct link in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {guide.summary}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                      Key Guidelines:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {guide.bulletPoints.map((bp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Details Paragraphs */}
                  <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {guide.details.map((det, idx) => (
                      <p key={idx}>{det}</p>
                    ))}
                  </div>

                  {/* Quick Tips */}
                  {guide.quickTips && guide.quickTips.length > 0 && (
                    <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40 text-xs text-amber-200 italic space-y-1">
                      {guide.quickTips.map((tip, idx) => (
                        <p key={idx}>💡 {tip}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hyperlink Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setActiveSrdUrl(guide.anchorUrl);
                      setIsSrdModalOpen(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                  >
                    <span>Read on OG-DHSRD #{guide.anchorId}</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={guide.anchorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[10px] transition"
                  >
                    <span>Direct Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Interactive SRD Iframe Modal Viewer */}
          {isSrdModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
              <div className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-serif font-bold text-base text-amber-200">
                        Open Gaming Daggerheart SRD Guide (OG-DHSRD)
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {activeSrdUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={activeSrdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <span>Open External</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setIsSrdModalOpen(false)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      Close Viewer
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 relative">
                  <iframe
                    src={activeSrdUrl}
                    title="Open Gaming Daggerheart SRD"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Item Inspector Modal */}
          {selectedItemForModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
                <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                      {selectedItemForModal.category} {selectedItemForModal.subCategory ? `• ${selectedItemForModal.subCategory}` : ''}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-amber-200 mt-1">
                      {selectedItemForModal.name}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 shrink-0">
                    {selectedItemForModal.cost || 'Loot'}
                  </span>
                </div>

                {/* Stats row if applicable */}
                {(selectedItemForModal.damage || selectedItemForModal.range || selectedItemForModal.traitRequirement || selectedItemForModal.armorRating !== undefined) && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                    {selectedItemForModal.damage && (
                      <div>
                        <span className="text-red-400 font-bold">DMG:</span>{' '}
                        <span className="text-slate-200">{selectedItemForModal.damage}</span>
                      </div>
                    )}
                    {selectedItemForModal.range && (
                      <div>
                        <span className="text-blue-400 font-bold">RNG:</span>{' '}
                        <span className="text-slate-200">{selectedItemForModal.range}</span>
                      </div>
                    )}
                    {selectedItemForModal.traitRequirement && (
                      <div>
                        <span className="text-purple-400 font-bold">Trait:</span>{' '}
                        <span className="text-slate-200">{selectedItemForModal.traitRequirement}</span>
                      </div>
                    )}
                    {selectedItemForModal.armorRating !== undefined && (
                      <div>
                        <span className="text-amber-400 font-bold">Armor:</span>{' '}
                        <span className="text-slate-200">+{selectedItemForModal.armorRating}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  {selectedItemForModal.description}
                </p>

                {/* Features */}
                {selectedItemForModal.features && selectedItemForModal.features.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Features & Special Actions</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedItemForModal.features.map((feat, fIdx) => (
                        <div key={fIdx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-0.5">
                          <p className="font-bold text-amber-300 font-mono text-[11px]">{feat.name}</p>
                          <p className="text-[11px] text-slate-400 leading-snug">{feat.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => {
                      setSubTab('items');
                      setItemSearchQuery(selectedItemForModal.name);
                      setSelectedItemForModal(null);
                    }}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search in Items Vault</span>
                  </button>

                  <button
                    onClick={() => setSelectedItemForModal(null)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

