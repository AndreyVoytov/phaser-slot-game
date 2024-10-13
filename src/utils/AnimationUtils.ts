import { gsap } from 'gsap';

export default class AnimationUtils{
    public static emphasize(symbol) : void {
        gsap.to(symbol, {
            scaleX: 1.3, // Увеличение по X
            scaleY: 1.3, // Увеличение по Y
            duration: 0.2, // Длительность увеличения
            ease: "power1.inOut", // Эффект плавности
            onComplete: () => {
            // После завершения увеличения, делаем уменьшение
            gsap.to(symbol, {
                scaleX: 1, // Возвращаем к оригинальному размеру по X
                scaleY: 1, // Возвращаем к оригинальному размеру по Y
                duration: 0.5, // Длительность уменьшения
                ease: "power1.inOut"
            });
            }
        });
    }

    // Функция для запуска анимации полета монетки по параболе
    public static animateCoins(scene:Phaser.Scene, x0:number, y0:number, numberOfCoins:number) {

        scene.anims.create({
            key: 'coinSpin',
            frames: [
              { key: 'coinRotation1' },
              { key: 'coinRotation2' },
              { key: 'coinRotation3' },
              { key: 'coinRotation4' },
              { key: 'coinRotation5' },
              { key: 'coinRotation6' },
              { key: 'coinRotation7' },
            ],
            frameRate: 10,
            repeat: -1
          });
            
        // Создаём монетку в центре слота
        for (let i = 0; i < numberOfCoins; i++) {
            // Создаём монетку в центре (x0, y0)
            const coin = scene.add.sprite(x0, y0, 'coinSpritesheet');
            const initialRotation = Phaser.Math.FloatBetween(0, 360); // Случайный угол от 0 до 360 градусов
            coin.setRotation(Phaser.Math.DegToRad(initialRotation));  // Устанавливаем начальный угол вращения
        
            const randomFrame = Phaser.Math.Between(1, 7); // Случайное значение от 1 до 7
            coin.setFrame(`coinRotation${randomFrame}`); // Устанавливаем случайный стартовый кадр
        

            // Устанавливаем анимацию вращения монетки
            coin.play('coinSpin');
        
            // Случайный угол вращения для некоторых монет
            const randomRotationSpeed = Phaser.Math.Between(-30, 30); // угловое вращение в градусах в секунду
        
            // Добавляем постоянное вращение
            gsap.to(coin, {
              rotation: Phaser.Math.DegToRad(randomRotationSpeed),
              duration: 2,
              repeat: -1,
              ease: "none"
            });
        
            // Определяем случайные смещения по X и Y
            const deltaX = Phaser.Math.Between(-200, 200);  // Случайное смещение по X
            const deltaY = Phaser.Math.Between(200, 400);   // Случайное смещение по Y
        
            // Создаём timeline для последовательной анимации
            const yTimeline = gsap.timeline({
              onComplete: () => {
                coin.destroy(); // Удаляем монетку после завершения анимации
              }
            });
        
            // Первая часть: подъем монетки вверх + движение по X
            yTimeline.to(coin, {
              y: y0 - Phaser.Math.Between(100, 150), // Поднимаем монетку выше начальной позиции
              duration: 0.5,              // Длительность подъема
              ease: "quad.out"
            });
        
            // Вторая часть: полет вниз по параболе и увеличение размера, продолжение движения по X
            yTimeline.to(coin, {
              y: y0 + deltaY * 3,  // Увеличиваем расстояние по Y от центра в 3 раза
              duration: 1,      // Длительность полета вниз
              ease: "quad.in"
            });

            const xTimeline = gsap.timeline();

            // Монетка начинает движение по оси X одновременно с подъёмом по Y и продолжает двигаться
            xTimeline.to(coin, {
            x: x0 + deltaX * 3,  // Увеличиваем расстояние по X в 3 раза
            scaleX: 3,           // Увеличиваем размер монетки в 3 раза
            scaleY: 3,
            duration: 1.5,       // Общая длительность движения по оси X
            ease: "linear"       // Равномерное движение по X
            });
          }
        }
      
}
