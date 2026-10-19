export type Skill = {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  dmg: number;
  type: 'single' | 'self' | 'aoe';
};

export type GameClass = {
  id: string;
  name: string;
  baseHP: number;
  baseMP: number;
  attack: number;
  defense: number;
  skills: Skill[];
};

export const CLASSES: GameClass[] = [
  {
    id: 'warrior',
    name: '전사',
    baseHP: 140,
    baseMP: 20,
    attack: 18,
    defense: 10,
    skills: [
      { id: 'slash', name: '베기', description: '강력한 근접 공격', mpCost: 0, dmg: 28, type: 'single' },
      { id: 'hero_shout', name: '전투의 함성', description: '자신 공격력 증가', mpCost: 6, dmg: 0, type: 'self' }
    ]
  },
  {
    id: 'mage',
    name: '마법사',
    baseHP: 90,
    baseMP: 60,
    attack: 8,
    defense: 4,
    skills: [
      { id: 'fireball', name: '화염구', description: '마법 공격', mpCost: 8, dmg: 40, type: 'single' },
      { id: 'arcane_blast', name: '신비 폭발', description: '광역 마법', mpCost: 12, dmg: 25, type: 'aoe' }
    ]
  },
  {
    id: 'priest',
    name: '성직자',
    baseHP: 100,
    baseMP: 50,
    attack: 6,
    defense: 6,
    skills: [
      { id: 'smite', name: '성스러운 일격', description: '빛의 타격', mpCost: 6, dmg: 20, type: 'single' },
      { id: 'heal', name: '치유', description: '자신을 회복', mpCost: 10, dmg: -30, type: 'self' }
    ]
  },
  {
    id: 'rogue',
    name: '도적',
    baseHP: 100,
    baseMP: 30,
    attack: 14,
    defense: 5,
    skills: [
      { id: 'stab', name: '급습', description: '치명타 확률이 높은 공격', mpCost: 0, dmg: 22, type: 'single' },
      { id: 'poison', name: '독주사', name: '독주사', description: '지속 피해 부여', mpCost: 6, dmg: 12, type: 'single' }
    ]
  }
];
