import Phaser from 'phaser';

export default class DungeonScene extends Phaser.Scene {
  playerHP: number = 100;
  enemyHP: number = 50;
  playerBar!: Phaser.GameObjects.Text;
  enemyBar!: Phaser.GameObjects.Text;
  isPlayerTurn: boolean = true;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor('#222831');
    this.add.text(w / 2, 24, '던전', { color: '#ffffff', fontSize: '24px' }).setOrigin(0.5);

    // 플레이어/적 표시
    this.add.rectangle(w / 2 - 60, h / 2, 60, 60, 0x00b894);
    this.add.rectangle(w / 2 + 60, h / 2, 60, 60, 0xd63031);

    this.playerBar = this.add.text(16, 56, `플레이어 HP: ${this.playerHP}`, { color: '#ffffff' });
    this.enemyBar = this.add.text(16, 80, `적 HP: ${this.enemyHP}`, { color: '#ffffff' });

    // 공격 버튼
    const attackBtn = this.add.rectangle(w / 2 - 70, h - 120, 140, 56, 0xff4757).setInteractive();
    this.add.text(w / 2 - 70, h - 120, '공격', { color: '#000000' }).setOrigin(0.5);

    // 스킬 버튼
    const skillBtn = this.add.rectangle(w / 2 + 70, h - 120, 140, 56, 0x3742fa).setInteractive();
    this.add.text(w / 2 + 70, h - 120, '스킬', { color: '#ffffff' }).setOrigin(0.5);

    // 도망 버튼
    const runBtn = this.add.rectangle(w / 2, h - 48, 200, 44, 0x8d6e63).setInteractive();
    this.add.text(w / 2, h - 48, '도망', { color: '#ffffff' }).setOrigin(0.5);

    runBtn.on('pointerdown', () => {
      this.showMessage('도망쳤습니다', () => {
        this.scene.start('TownScene');
      });
    });

    attackBtn.on('pointerdown', () => {
      if (!this.isPlayerTurn) return;
      this.playerAttack();
    });

    skillBtn.on('pointerdown', () => {
      if (!this.isPlayerTurn) return;
      this.playerSkill();
    });

    this.updateHUD();
  }

  playerAttack() {
    const dmg = 20;
    this.enemyHP -= dmg;
    this.updateHUD();
    this.showMessage(`플레이어가 ${dmg} 피해를 입혔습니다`, () => {
      if (this.enemyHP <= 0) {
        this.victory();
      } else {
        this.isPlayerTurn = false;
        this.time.delayedCall(600, () => this.enemyTurn(), []);
      }
    });
  }

  playerSkill() {
    const dmg = 35;
    this.enemyHP -= dmg;
    this.updateHUD();
    this.showMessage(`스킬 성공! ${dmg} 피해`, () => {
      if (this.enemyHP <= 0) {
        this.victory();
      } else {
        this.isPlayerTurn = false;
        this.time.delayedCall(600, () => this.enemyTurn(), []);
      }
    });
  }

  enemyTurn() {
    const dmg = 12;
    this.playerHP -= dmg;
    this.updateHUD();
    this.showMessage(`적이 ${dmg} 피해를 입혔습니다`, () => {
      if (this.playerHP <= 0) {
        this.defeat();
      } else {
        this.isPlayerTurn = true;
      }
    });
  }

  victory() {
    this.showMessage('승리! 경험치와 골드 획득', () => {
      this.time.delayedCall(800, () => {
        this.scene.start('TownScene');
      });
    });
  }

  defeat() {
    this.showMessage('패배... 마을로 귀환', () => {
      this.time.delayedCall(800, () => {
        this.scene.start('TownScene');
      });
    });
  }

  updateHUD() {
    this.playerBar.setText(`플레이어 HP: ${Math.max(0, this.playerHP)}`);
    this.enemyBar.setText(`적 HP: ${Math.max(0, this.enemyHP)}`);
  }

  showMessage(text: string, cb?: () => void) {
    const w = this.scale.width;
    const h = this.scale.height;
    const box = this.add.rectangle(w / 2, h / 2 + 140, 320, 56, 0x000000, 0.7);
    const msg = this.add.text(w / 2, h / 2 + 140, text, { color: '#ffffff' }).setOrigin(0.5);

    this.time.delayedCall(700, () => {
      box.destroy();
      msg.destroy();
      if (cb) cb();
    });
  }
}
