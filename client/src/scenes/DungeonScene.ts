import Phaser from 'phaser';
import Player from '../player/Player';

export default class DungeonScene extends Phaser.Scene {
  player!: Player;
  enemyHP: number = 50;
  playerBar!: Phaser.GameObjects.Text;
  enemyBar!: Phaser.GameObjects.Text;
  mpBar!: Phaser.GameObjects.Text;
  isPlayerTurn: boolean = true;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor('#222831');
    this.add.text(w / 2, 24, '던전', { color: '#ffffff', fontSize: '24px' }).setOrigin(0.5);

    const classId = (this.registry.get('playerClass') as string) || 'warrior';
    this.player = new Player('p1', '플레이어', classId);

    this.add.rectangle(w / 2 - 60, h / 2, 60, 60, 0x00b894);
    this.add.rectangle(w / 2 + 60, h / 2, 60, 60, 0xd63031);

    this.playerBar = this.add.text(16, 56, `플레이어 HP: ${this.player.hp}/${this.player.maxHP}`, { color: '#ffffff' });
    this.enemyBar = this.add.text(16, 80, `적 HP: ${this.enemyHP}`, { color: '#ffffff' });
    this.mpBar = this.add.text(16, 104, `MP: ${this.player.mp}/${this.player.maxMP}`, { color: '#ffffff' });

    const attackBtn = this.add.rectangle(w / 2 - 90, h - 120, 140, 56, 0xff4757).setInteractive();
    this.add.text(w / 2 - 90, h - 120, '공격', { color: '#000000' }).setOrigin(0.5);

    const skillBtn1 = this.add.rectangle(w / 2 + 90, h - 120, 140, 56, 0x3742fa).setInteractive();
    const skill1Name = this.player.getSkills()[0]?.name || '스킬1';
    this.add.text(w / 2 + 90, h - 120, skill1Name, { color: '#ffffff' }).setOrigin(0.5);

    let skillBtn2: Phaser.GameObjects.Rectangle | null = null;
    if (this.player.getSkills()[1]) {
      skillBtn2 = this.add.rectangle(w / 2 + 90, h - 200, 140, 44, 0x6c5ce7).setInteractive();
      this.add.text(w / 2 + 90, h - 200, this.player.getSkills()[1].name, { color: '#ffffff' }).setOrigin(0.5);
    }

    const runBtn = this.add.rectangle(w / 2, h - 48, 200, 44, 0x8d6e63).setInteractive();
    this.add.text(w / 2, h - 48, '도망', { color: '#ffffff' }).setOrigin(0.5);

    runBtn.on('pointerdown', () => {
      this.showMessage('도망쳤습니다', () => this.scene.start('TownScene'));
    });

    attackBtn.on('pointerdown', () => {
      if (!this.isPlayerTurn) return;
      this.playerAttack();
    });

    skillBtn1.on('pointerdown', () => {
      if (!this.isPlayerTurn) return;
      this.playerUseSkill(0);
    });

    if (skillBtn2) {
      skillBtn2.on('pointerdown', () => {
        if (!this.isPlayerTurn) return;
        this.playerUseSkill(1);
      });
    }

    this.updateHUD();
  }

  playerAttack() {
    const dmg = this.player.attack;
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

  playerUseSkill(index: number) {
    const res = this.player.useSkill(index);
    if (!res.success) {
      this.showMessage(res.message || '스킬 실패');
      return;
    }
    const skill = res.skill!;
    if (skill.type === 'self') {
      if (skill.dmg < 0) {
        const heal = -skill.dmg;
        this.player.hp = Math.min(this.player.maxHP, this.player.hp + heal);
        this.updateHUD();
        this.showMessage(`${skill.name}으로 ${heal} 회복`, () => {
          this.afterPlayerAction();
        });
      } else {
        this.showMessage(`${skill.name} 사용: 버프 적용`, () => {
          this.afterPlayerAction();
        });
      }
    } else {
      const dmg = skill.dmg + this.player.attack;
      this.enemyHP -= dmg;
      this.updateHUD();
      this.showMessage(`${skill.name}으로 ${dmg} 피해`, () => {
        if (this.enemyHP <= 0) this.victory();
        else this.afterPlayerAction();
      });
    }
  }

  afterPlayerAction() {
    this.isPlayerTurn = false;
    this.time.delayedCall(600, () => this.enemyTurn(), []);
  }

  enemyTurn() {
    const dmg = 12;
    this.player.hp -= dmg;
    this.updateHUD();
    this.showMessage(`적이 ${dmg} 피해를 입혔습니다`, () => {
      if (this.player.hp <= 0) this.defeat();
      else this.isPlayerTurn = true;
    });
  }

  victory() {
    this.showMessage('승리! 경험치와 골드 획득', () => {
      this.time.delayedCall(800, () => this.scene.start('TownScene'));
    });
  }

  defeat() {
    this.showMessage('패배... 마을로 귀환', () => {
      this.time.delayedCall(800, () => this.scene.start('TownScene'));
    });
  }

  updateHUD() {
    this.playerBar.setText(`플레이어 HP: ${Math.max(0, this.player.hp)}/${this.player.maxHP}`);
    this.enemyBar.setText(`적 HP: ${Math.max(0, this.enemyHP)}`);
    this.mpBar.setText(`MP: ${Math.max(0, this.player.mp)}/${this.player.maxMP}`);
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
