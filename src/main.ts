import Phaser from 'phaser';
import LoadingScene from './scenes/LoadingScene';
import MainScene from './scenes/MainScene';
import PreloadScene from './scenes/PreloadScene';
import 'phaser/plugins/spine/dist/SpinePlugin'


const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Math.min(2200, 800 * Math.max(450/800, window.innerWidth / window.innerHeight)),
  height: 800,
  scene: [PreloadScene, LoadingScene, MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  plugins: {
    scene: [
      {
        key: 'SpinePlugin',
        plugin: window.SpinePlugin,
        sceneKey: 'spine'
      }
    ]
  }
};

const game = new Phaser.Game(config);



