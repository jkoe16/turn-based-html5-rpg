import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w / 2, 80, '무한던전', { color: '#ffffff', fontSize: '32px' }).setOrigin(0.5);

    const startBtn = this.add.rectangle(w / 2, h / 2, 220, 64, 0x4caf50).setInteractive();
    const startText = this.add.text(w / 2, h / 2, '게임 시작', { color: '#000000', fontSize: '20px' }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      this.scene.start('TownScene');
    });

    this.add.text(w / 2, h - 80, '터치로 진행', { color: '#ffffff' }).setOrigin(0.5);
  }
}
