import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import MainScene from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [PreloadScene, MainScene],
};

new Phaser.Game(config);