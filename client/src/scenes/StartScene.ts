import Phaser from 'phaser';
import { CLASSES } from '../data/classes';

export default class StartScene extends Phaser.Scene {
  selectedClassId: string | null = null;

  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w / 2, 40, '무한던전', { color: '#ffffff', fontSize: '32px' }).setOrigin(0.5);

    // 클래스 선택 영역
    this.add.text(w / 2, 90, '클래스 선택', { color: '#ffffff' }).setOrigin(0.5);

    const startY = 140;
    const spacing = 68;

    CLASSES.forEach((c, idx) => {
      const y = startY + idx * spacing;
      const box = this.add.rectangle(w / 2, y, 300, 52, 0x37474f).setInteractive();
      const text = this.add.text(w / 2 - 120, y, `${c.name} - HP:${c.baseHP} MP:${c.baseMP} ATK:${c.attack}`, { color: '#ffffff' }).setOrigin(0, 0.5);

      box.on('pointerdown', () => {
        this.selectedClassId = c.id;
        // 시각적 선택 표시
        this.children.list.forEach((child) => {
          if (child instanceof Phaser.GameObjects.Rectangle && child !== box && child.width === 300 && child.height === 52) {
            (child as Phaser.GameObjects.Rectangle).setFillStyle(0x37474f);
          }
        });
        box.setFillStyle(0x00b894);
      });
    });

    // 시작 버튼
    const startBtn = this.add.rectangle(w / 2, h - 80, 220, 64, 0x4caf50).setInteractive();
    this.add.text(w / 2, h - 80, '게임 시작', { color: '#000000', fontSize: '20px' }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      const chosen = this.selectedClassId || CLASSES[0].id;
      // 씬 레지스트리에 저장
      this.registry.set('playerClass', chosen);
      this.scene.start('TownScene');
    });

    this.add.text(w / 2, h - 40, '터치로 진행', { color: '#ffffff' }).setOrigin(0.5);
  }
}
