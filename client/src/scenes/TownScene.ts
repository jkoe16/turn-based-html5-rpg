import Phaser from 'phaser';

export default class TownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TownScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor('#2b2f3a');
    this.add.text(w / 2, 40, '마을', { color: '#ffffff', fontSize: '28px' }).setOrigin(0.5);

    // 플레이어 정보(더미)
    this.add.text(16, 80, '레벨: 1\nHP: 100/100\n골드: 0', { color: '#ffffff' });

    // 던전 입장 버튼
    const dungeonBtn = this.add.rectangle(w / 2, h / 2, 220, 64, 0xff7043).setInteractive();
    this.add.text(w / 2, h / 2, '던전 입장', { color: '#000000', fontSize: '20px' }).setOrigin(0.5);

    dungeonBtn.on('pointerdown', () => {
      this.scene.start('DungeonScene');
    });

    // 타이틀로 돌아가기 버튼
    const menuBtn = this.add.rectangle(w / 2, h / 2 + 90, 180, 48, 0x9e9e9e).setInteractive();
    this.add.text(w / 2, h / 2 + 90, '타이틀로', { color: '#000000' }).setOrigin(0.5);
    menuBtn.on('pointerdown', () => {
      this.scene.start('StartScene');
    });
  }
}
