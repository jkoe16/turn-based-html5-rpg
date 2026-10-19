import Phaser from 'phaser';
import StartScene from './scenes/StartScene';
import TownScene from './scenes/TownScene';
import DungeonScene from './scenes/DungeonScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game',
  backgroundColor: '#1d212d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [StartScene, TownScene, DungeonScene]
};

new Phaser.Game(config);
