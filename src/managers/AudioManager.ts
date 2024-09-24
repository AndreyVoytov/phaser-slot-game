import { injectable } from "inversify";

@injectable()
export class AudioManager{
    
    private mainTheme!: Phaser.Sound.BaseSound;
    private soundOn: boolean = false;

    public playMainTheme(scene:Phaser.Scene) : void {

        // Start background music if not already playing
        if (!this.mainTheme || !this.mainTheme.isPlaying) {
            this.mainTheme = scene.sound.add('main-theme', { loop: true });
            this.mainTheme.play();
        }
    }

    public switchSound(scene) : void {
        this.soundOn = !this.soundOn;
        scene.sound.mute = !this.soundOn;
    }

}