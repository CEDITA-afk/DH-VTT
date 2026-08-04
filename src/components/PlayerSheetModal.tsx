import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Shield,
  Heart,
  Flame,
  Award,
  BookOpen,
  Backpack,
  Compass,
  User,
  Users,
  Feather,
  Plus,
  Trash2,
  Edit3,
  Check,
  Zap,
} from 'lucide-react';
import { PlayerCharacter, DomainCardRef, Experience, Condition } from '../types';
import { DOMAIN_CARDS_DATA, ANCESTRIES_DATA, COMMUNITIES_DATA, CLASSES_DATA } from '../data/domainsAndClasses';
import { getSubclassesForClass, getSubclassByName } from '../data/subclassesData';
import { soundFX } from '../utils/audioSynth';

interface PlayerSheetModalProps {
  player: PlayerCharacter | null;
  onClose: () => void;
  onUpdatePlayer: (updated: PlayerCharacter) => void;
}

const ALL_CONDITIONS: Condition[] = [
  'Vulnerable',
  'Restrained',
  'Dazed',
  'Hidden',
  'Weakened',
  'Silenced',
  'Impaired',
];

export const PlayerSheetModal: React.FC<PlayerSheetModalProps> = ({
  player,
  onClose,
  onUpdatePlayer,
}) => {
  if (!player) return null;

  const [activeTab, setActiveTab] = useState<
    'heritage' | 'class' | 'domains' | 'equipment' | 'traits' | 'experiences' | 'background'
  >('traits');

  const [isEditing, setIsEditing] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [newEquipItem, setNewEquipItem] = useState('');
  const [newExpName, setNewExpName] = useState('');
  const [newExpVal, setNewExpVal] = useState(1);

  // Editable local state copy
  const [editedPlayer, setEditedPlayer] = useState<PlayerCharacter>(player);

  const handleSave = () => {
    onUpdatePlayer(editedPlayer);
    setIsEditing(false);
    soundFX.playHopeChime();
  };

  const handleStatChange = (field: keyof PlayerCharacter, value: any) => {
    setEditedPlayer((prev) => ({ ...prev, [field]: value }));
  };

  const handleHpChange = (delta: number) => {
    const nextHp = Math.max(0, Math.min(player.maxHp, player.currentHp + delta));
    if (delta < 0) soundFX.playDamageHit();
    onUpdatePlayer({ ...player, currentHp: nextHp });
  };

  const handleStressChange = (delta: number) => {
    const nextStress = Math.max(0, Math.min(player.maxStress, player.currentStress + delta));
    onUpdatePlayer({ ...player, currentStress: nextStress });
  };

  const handleHopeChange = (delta: number) => {
    const nextHope = Math.max(0, Math.min(player.maxHope, player.hope + delta));
    if (delta > 0) soundFX.playHopeChime();
    onUpdatePlayer({ ...player, hope: nextHope });
  };

  const handleArmorSlotToggle = (index: number) => {
    const nextSlots = index < player.currentArmorSlots ? index : index + 1;
    onUpdatePlayer({ ...player, currentArmorSlots: nextSlots });
  };

  const toggleCondition = (cond: Condition) => {
    const exists = player.conditions.includes(cond);
    const nextConds = exists
      ? player.conditions.filter((c) => c !== cond)
      : [...player.conditions, cond];
    onUpdatePlayer({ ...player, conditions: nextConds });
  };

  const handleAddEquipment = () => {
    if (!newEquipItem.trim()) return;
    const currentEquip = player.equipment || [];
    onUpdatePlayer({ ...player, equipment: [...currentEquip, newEquipItem.trim()] });
    setNewEquipItem('');
  };

  const handleRemoveEquipment = (index: number) => {
    const currentEquip = player.equipment || [];
    onUpdatePlayer({
      ...player,
      equipment: currentEquip.filter((_, i) => i !== index),
    });
  };

  const handleAddExperience = () => {
    if (!newExpName.trim()) return;
    onUpdatePlayer({
      ...player,
      experiences: [...player.experiences, { name: newExpName.trim(), value: newExpExpVal() }],
    });
    setNewExpName('');
  };

  const newExpExpVal = () => newExpVal;

  const handleRemoveExperience = (index: number) => {
    onUpdatePlayer({
      ...player,
      experiences: player.experiences.filter((_, i) => i !== index),
    });
  };

  const handleAddDomainCard = (card: { name: string; domain: string; level: number; description: string }) => {
    onUpdatePlayer({
      ...player,
      domainCards: [...player.domainCards, { name: card.name, domain: card.domain, level: card.level, description: card.description }],
    });
    setShowCardPicker(false);
    soundFX.playHopeChime();
  };

  const handleRemoveDomainCard = (index: number) => {
    onUpdatePlayer({
      ...player,
      domainCards: player.domainCards.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                player.avatarColor || 'from-amber-600 to-amber-800'
              } flex items-center justify-center font-serif font-bold text-xl text-slate-950 shadow-md`}
            >
              {player.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-xl text-amber-200">
                  {player.name}
                </h2>
                {player.pronouns && (
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                    {player.pronouns}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-400/90 font-medium">
                Level {player.level} {player.ancestry} {player.class} ({player.subclass})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Editing Sheet' : 'Edit Details'}</span>
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 7 Section Navigation Tabs */}
        <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 flex items-center space-x-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/30 shrink-0">
          {[
            { id: 'heritage', label: '1. Heritage', icon: Feather },
            { id: 'class', label: '2. Class & Subclass', icon: Sparkles },
            { id: 'domains', label: '3. Domain Cards', icon: BookOpen },
            { id: 'equipment', label: '4. Equipment & Inventory', icon: Backpack },
            { id: 'traits', label: '5. Traits & Statistics', icon: Shield },
            { id: 'experiences', label: '6. Experiences & Description', icon: Award },
            { id: 'background', label: '7. Background & Connections', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : 'text-slate-400 hover:text-amber-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* 1. HERITAGE SECTION */}
          {activeTab === 'heritage' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                  <Feather className="w-5 h-5 text-amber-400" />
                  <span>Heritage: Ancestry & Community</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Ancestry Card */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                      Ancestry
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPlayer.ancestry}
                        onChange={(e) => handleStatChange('ancestry', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold"
                      />
                    ) : (
                      <div className="font-serif font-bold text-xl text-slate-100">
                        {player.ancestry}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block mb-1">
                        Ancestry Feature:
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedPlayer.ancestryFeature || ''}
                          onChange={(e) => handleStatChange('ancestryFeature', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          placeholder="e.g. Constructed Resilience..."
                        />
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {player.ancestryFeature || 'No special ancestry trait listed.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Community Card */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400/90 tracking-wider">
                      Community
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPlayer.community}
                        onChange={(e) => handleStatChange('community', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold"
                      />
                    ) : (
                      <div className="font-serif font-bold text-xl text-slate-100">
                        {player.community}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block mb-1">
                        Community Feature:
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedPlayer.communityFeature || ''}
                          onChange={(e) => handleStatChange('communityFeature', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          placeholder="e.g. Darkvision & Tunnel Navigation..."
                        />
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {player.communityFeature || 'No special community trait listed.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CLASS & SUBCLASS SECTION */}
          {activeTab === 'class' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Class and Subclass Archetype</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Class & Level
                    </span>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editedPlayer.class}
                          onChange={(e) => handleStatChange('class', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold"
                        />
                        <input
                          type="number"
                          value={editedPlayer.level}
                          onChange={(e) => handleStatChange('level', Number(e.target.value))}
                          className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold"
                        />
                      </div>
                    ) : (
                      <div className="font-serif font-bold text-xl text-slate-100">
                        {player.class} <span className="text-sm font-sans font-normal text-amber-300">(Level {player.level})</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block mb-1">
                        Class Primary Feature:
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editedPlayer.classFeature || ''}
                          onChange={(e) => handleStatChange('classFeature', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                        />
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {player.classFeature || 'Class powers active during combat and narrative checks.'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                      Subclass Specialization
                    </span>
                    {isEditing ? (
                      <select
                        value={editedPlayer.subclass}
                        onChange={(e) => handleStatChange('subclass', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold"
                      >
                        {getSubclassesForClass(editedPlayer.class).map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-serif font-bold text-xl text-purple-300">
                        {player.subclass}
                      </div>
                    )}

                    {/* Subclass Feature Cards */}
                    {(() => {
                      const currentSubName = isEditing ? editedPlayer.subclass : player.subclass;
                      const activeSubDef = getSubclassByName(currentSubName);
                      if (!activeSubDef) {
                        return (
                          <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                            Subclass specialization unlocks unique domain deck cards and Hope features at Level {player.level}.
                          </p>
                        );
                      }

                      return (
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <p className="text-xs text-slate-300 italic">
                            "{activeSubDef.description}"
                          </p>

                          <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-950">
                            <span className="text-xs font-bold text-amber-300 block">
                              Foundation: {activeSubDef.foundationFeature.name}
                            </span>
                            <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                              {activeSubDef.foundationFeature.description}
                            </p>
                          </div>

                          {activeSubDef.specializationFeature && (
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-950">
                              <span className="text-xs font-bold text-cyan-300 block">
                                Specialization: {activeSubDef.specializationFeature.name}
                              </span>
                              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                                {activeSubDef.specializationFeature.description}
                              </p>
                            </div>
                          )}

                          {activeSubDef.masteryFeature && (
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-950">
                              <span className="text-xs font-bold text-purple-300 block">
                                Mastery: {activeSubDef.masteryFeature.name}
                              </span>
                              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                                {activeSubDef.masteryFeature.description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. DOMAIN CARDS SECTION */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>Domain Cards Loadout ({player.domainCards.length})</span>
                  </h3>

                  <button
                    onClick={() => setShowCardPicker(!showCardPicker)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-xs font-bold text-purple-200 border border-purple-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Domain Card</span>
                  </button>
                </div>

                {/* Domain Card Library Picker Modal / Drawer */}
                {showCardPicker && (
                  <div className="bg-slate-900 p-4 rounded-2xl border border-purple-500/40 space-y-3">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Select Domain Card to Equip:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {DOMAIN_CARDS_DATA.map((card) => (
                        <div
                          key={card.id}
                          className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between font-bold text-xs text-amber-300">
                              <span>{card.name}</span>
                              <span className="text-[10px] uppercase text-purple-400">
                                {card.domain} Lvl {card.level}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{card.description}</p>
                          </div>
                          <button
                            onClick={() => handleAddDomainCard(card)}
                            className="mt-2 text-[10px] font-bold py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition text-center"
                          >
                            + Equip Card
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipped Domain Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {player.domainCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md relative space-y-2"
                    >
                      <div className="flex justify-between items-start border-b border-slate-800/80 pb-2">
                        <div>
                          <h4 className="font-serif font-bold text-base text-amber-300">
                            {card.name}
                          </h4>
                          <span className="text-[10px] uppercase font-semibold text-purple-400">
                            {card.domain} Domain (Level {card.level})
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveDomainCard(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Unequip Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  ))}

                  {player.domainCards.length === 0 && (
                    <p className="text-xs text-slate-500 italic col-span-2 text-center py-6">
                      No domain cards currently equipped. Click "+ Add Domain Card" to equip powers.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. EQUIPMENT & INVENTORY SECTION */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                    <Backpack className="w-5 h-5 text-amber-400" />
                    <span>Equipment, Weapons & Carrying Satchel</span>
                  </h3>

                  <div className="flex items-center space-x-2 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/40">
                    <span className="text-xs font-bold text-amber-300">Gold:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedPlayer.gold || 0}
                        onChange={(e) => handleStatChange('gold', Number(e.target.value))}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-amber-300"
                      />
                    ) : (
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {player.gold || 0} Gold
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Gear & Weapons */}
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Equipped Gear & Weapons:
                  </span>
                  <div className="space-y-2">
                    {(player.equipment || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-200"
                      >
                        <span className="font-medium">{item}</span>
                        <button
                          onClick={() => handleRemoveEquipment(idx)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Equipment Row */}
                  <div className="flex items-center space-x-2 mt-3">
                    <input
                      type="text"
                      value={newEquipItem}
                      onChange={(e) => setNewEquipItem(e.target.value)}
                      placeholder="Add item (e.g. Broadsword [1d8+2], Healing Potion x2)..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:border-amber-500"
                    />
                    <button
                      onClick={handleAddEquipment}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shrink-0"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Inventory / Notes */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Satchel Inventory & Consumable Notes:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editedPlayer.inventory || ''}
                      onChange={(e) => handleStatChange('inventory', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                      placeholder="List torches, rations, rope, tools, keys..."
                    />
                  ) : (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {player.inventory || 'No additional inventory items listed.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. TRAITS & STATISTICS SECTION */}
          {activeTab === 'traits' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-5">
                <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>Attribute Traits & Vital Defense Statistics</span>
                </h3>

                {/* Core Attribute Traits Grid */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Attribute Modifier Traits
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { key: 'agility', label: 'Agility', desc: 'Sprinting, dodging' },
                      { key: 'strength', label: 'Strength', desc: 'Lifting, striking' },
                      { key: 'finesse', label: 'Finesse', desc: 'Precision, stealth' },
                      { key: 'instinct', label: 'Instinct', desc: 'Perception, survival' },
                      { key: 'presence', label: 'Presence', desc: 'Charisma, speech' },
                      { key: 'knowledge', label: 'Knowledge', desc: 'Lore, magic' },
                    ].map((trait) => {
                      const val = (player as any)[trait.key] || 0;
                      return (
                        <div
                          key={trait.key}
                          className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center space-y-1"
                        >
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            {trait.label}
                          </span>
                          <div className="font-mono text-xl font-extrabold text-amber-300">
                            {val >= 0 ? `+${val}` : val}
                          </div>
                          <span className="text-[9px] text-slate-500 block">{trait.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Defenses & Trackers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* HP Box */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-red-300">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        Hit Points
                      </span>
                      <span>
                        {player.currentHp} / {player.maxHp}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1">
                      <button
                        onClick={() => handleHpChange(-1)}
                        className="px-2 py-1 bg-slate-800 text-slate-300 rounded font-bold text-xs hover:bg-slate-700"
                      >
                        -1 HP
                      </button>
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: player.maxHp }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 h-5 rounded ${
                              idx >= player.currentHp ? 'bg-slate-950 border border-slate-800' : 'bg-red-600'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleHpChange(1)}
                        className="px-2 py-1 bg-red-900 text-red-100 rounded font-bold text-xs hover:bg-red-800"
                      >
                        +1 HP
                      </button>
                    </div>
                  </div>

                  {/* Stress Box */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-300">
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-purple-400" />
                        Stress
                      </span>
                      <span>
                        {player.currentStress} / {player.maxStress}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1">
                      <button
                        onClick={() => handleStressChange(-1)}
                        className="px-2 py-1 bg-slate-800 text-slate-300 rounded font-bold text-xs hover:bg-slate-700"
                      >
                        -1
                      </button>
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: player.maxStress }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 h-5 rounded ${
                              idx < player.currentStress ? 'bg-purple-600' : 'bg-slate-950 border border-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleStressChange(1)}
                        className="px-2 py-1 bg-purple-900 text-purple-100 rounded font-bold text-xs hover:bg-purple-800"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  {/* Hope Box */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Hope Points
                      </span>
                      <span>
                        {player.hope} / {player.maxHope}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 space-x-2">
                      <button
                        onClick={() => handleHopeChange(-1)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded font-bold text-xs hover:bg-slate-700"
                      >
                        Spend 1 Hope
                      </button>
                      <span className="font-mono text-lg font-bold text-amber-300">
                        {player.hope}
                      </span>
                      <button
                        onClick={() => handleHopeChange(1)}
                        className="px-3 py-1 bg-amber-600 text-slate-950 rounded font-bold text-xs hover:bg-amber-500"
                      >
                        +1 Hope
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evasion & Damage Thresholds */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Evasion</span>
                    <span className="font-mono text-lg font-bold text-cyan-300">{player.evasion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Minor Threshold</span>
                    <span className="font-mono text-lg font-bold text-amber-300">{player.thresholds.minor}+</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Major Threshold</span>
                    <span className="font-mono text-lg font-bold text-amber-400">{player.thresholds.major}+</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Severe Threshold</span>
                    <span className="font-mono text-lg font-bold text-red-400">{player.thresholds.severe}+</span>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Active Conditions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CONDITIONS.map((cond) => {
                      const isActive = player.conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          onClick={() => toggleCondition(cond)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                            isActive
                              ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. EXPERIENCES & DESCRIPTION SECTION */}
          {activeTab === 'experiences' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Experiences and Physical Description</span>
                </h3>

                {/* Experiences List */}
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Character Experiences (+1 / +2 Modifiers):
                  </span>
                  <div className="space-y-2">
                    {player.experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                      >
                        <span className="text-slate-200 font-semibold">{exp.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                            +{exp.value}
                          </span>
                          <button
                            onClick={() => handleRemoveExperience(idx)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Experience Input */}
                  <div className="flex items-center space-x-2 mt-3">
                    <input
                      type="text"
                      value={newExpName}
                      onChange={(e) => setNewExpName(e.target.value)}
                      placeholder="e.g. Sylvan Flora Whisperer, Lockpicking..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    />
                    <select
                      value={newExpVal}
                      onChange={(e) => setNewExpVal(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-amber-300 font-mono font-bold"
                    >
                      <option value={1}>+1</option>
                      <option value={2}>+2</option>
                    </select>
                    <button
                      onClick={handleAddExperience}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shrink-0"
                    >
                      + Add Exp
                    </button>
                  </div>
                </div>

                {/* Character Visual Description */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Physical Appearance & Visual Notes:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editedPlayer.description || ''}
                      onChange={(e) => handleStatChange('description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                      placeholder="Describe hair, armor markings, eyes, height..."
                    />
                  ) : (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {player.description || 'No physical description provided.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. BACKGROUND & CONNECTIONS SECTION */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Background Story & Party Connections</span>
                </h3>

                {/* Background Story */}
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Origin Story & Background Lore:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editedPlayer.background || ''}
                      onChange={(e) => handleStatChange('background', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                      placeholder="Where did this hero come from? What drives them?"
                    />
                  ) : (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {player.background || 'No background story recorded yet.'}
                    </div>
                  )}
                </div>

                {/* Party Connections */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
                    Party Connections & Bonds:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editedPlayer.connections || ''}
                      onChange={(e) => handleStatChange('connections', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                      placeholder="e.g. Owes a life-debt to Lyra for repairing core gemstone..."
                    />
                  ) : (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                      {player.connections || 'No party connections recorded yet.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
