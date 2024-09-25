import { injectable } from "inversify";

@injectable()
export class AudioManager{
    
    private scene!: Phaser.Scene;
    private mainTheme!: Phaser.Sound.BaseSound;

    public init(scene:Phaser.Scene) : void {
        console.log("init audio")
        this.scene = scene;
        scene.sound.mute = !this.getSoundEnabled();
    }
    
    // Start background music if not already playing
    public playMainTheme() : void {
        if (!this.mainTheme || !this.mainTheme.isPlaying) {
            this.mainTheme = this.scene.sound.add('main-theme', { loop: true });
            this.mainTheme.play({volume: 0.1});
        }
    }

    public switchSoundEnabled() : boolean {
        const soundEnabled = this.getSoundEnabled();
        this.scene.sound.mute = soundEnabled;
        this.setSoundEnabled(!soundEnabled);
        return !soundEnabled;
    }

    public getSoundEnabled() : boolean {
        return localStorage.getItem('soundEnabled') != 'false';
    }

    private setSoundEnabled(enabled: boolean) : void {
        localStorage.setItem('soundEnabled', enabled.toString());
    } 

}