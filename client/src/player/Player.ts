import { CLASSES, GameClass, Skill } from '../data/classes';

export default class Player {
  id: string;
  name: string;
  clazz: GameClass;
  maxHP: number;
  hp: number;
  maxMP: number;
  mp: number;
  attack: number;
  defense: number;

  constructor(id: string, name: string, classId: string) {
    this.id = id;
    this.name = name;
    const c = CLASSES.find((x) => x.id === classId) || CLASSES[0];
    this.clazz = c;
    this.maxHP = c.baseHP;
    this.hp = this.maxHP;
    this.maxMP = c.baseMP;
    this.mp = this.maxMP;
    this.attack = c.attack;
    this.defense = c.defense;
  }

  getSkills(): Skill[] {
    return this.clazz.skills;
  }

  useSkill(index: number): { success: boolean; skill?: Skill; message?: string } {
    const skills = this.getSkills();
    if (index < 0 || index >= skills.length) return { success: false, message: '스킬 없음' };
    const skill = skills[index];
    if (this.mp < skill.mpCost) return { success: false, message: 'MP 부족' };
    this.mp -= skill.mpCost;
    return { success: true, skill };
  }
}
