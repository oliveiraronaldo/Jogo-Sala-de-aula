//HUD.js
import Phaser from "phaser";
import { CONFIG } from "../config";

export default class HUD extends Phaser.GameObjects.Container{

    /**@type {Phaser.GameObjects.Container} */
    dialog;

    /** @type {Phaser.GameObjects.Text} */
    dialogText;

    /** @type {Phaser.GameObjects.Sprite} */
    dialogNext;

    dialogPositionShow;
    dailogPositionHide;

    
    isDialogBlocked = false;
    isSpaceBlocked = false;


    constructor(scene, x, y){
        super(scene, x, y);

        scene.add.existing(this); // Colocando o cara na cena

        this.createDialog();
        
    }


    createDialog(){
        //this.dialog = this.add.container(0, 0)
        //    .setDepth(10);
        console.log('Dialogo')

        this.dialog = this.add( new Phaser.GameObjects.Container(this.scene));
        this.dialog.setDepth(10);

        const tile = CONFIG.TILE_SIZE;
        const widthDialog = CONFIG.GAME_WIDTH-(2 * CONFIG.TILE_SIZE);
        const heightDialog = 3 * tile;

        this.dialogPositionShow = CONFIG.GAME_HEIGHT - heightDialog - tile * 2;
        this.dialogPositionHide = CONFIG.GAME_HEIGHT + tile

        this.dialog.add(
            [
            this.scene.add.image(0, 0, 'hud', 'dialog_topleft'),
            this.scene.add.image(16, 0, 'hud', 'dialog_top').setDisplaySize(widthDialog, tile),
            this.scene.add.image(widthDialog+tile, 0, 'hud', 'dialog_topright'),
            this.scene.add.image(0, 16, 'hud', 'dialog_left').setDisplaySize(16, heightDialog),
            this.scene.add.image(16, 16, 'hud', 'dialog_center').setDisplaySize(widthDialog, heightDialog),
            this.scene.add.image(widthDialog+tile, 16, 'hud', 'dialog_right').setDisplaySize(tile, heightDialog),
            this.scene.add.image(0, heightDialog+tile, 'hud', 'dialog_bottomleft'),
            this.scene.add.image(16, heightDialog+tile, 'hud', 'dialog_bottom').setDisplaySize(widthDialog, tile),
            this.scene.add.image(widthDialog+tile, heightDialog+tile, 'hud', 'dialog_bottomright')
            ]

        );
        
        this.dialog.setPosition(0, this.dialogPositionHide);
        const style = {
            fontFamily: 'Verdana',
            fontSize: 11,
            color: '#6b5052',
            maxLines: 3,
            wordWrap: {width: widthDialog}

        }

        this.dialogText = this.scene.add.text(tile, tile, 'Meu texto', style);
        this.dialog.add(this.dialogText);
        
    }

    showDialog(text) {
        //this.dialogText.text = text;
        this.dialogText.text = '';
        this.isDialogBlocked = true;


        //Verifica se está fora da tela
        if( this.dialog.y > this.dialogPositionShow ){
            this.scene.add.tween({
                targets: this.dialog,
                duration: 400,
                y: this.dialogPositionShow,
                ease: Phaser.Math.Easing.Back.Out, 
                onComplete: () => {
                    this.showText(text);
                }
                
            });
            this.isSpaceBlocked = true;
            
        }else{
            this.showText();

        }

    }

    showText(text){
        let i = 0;
        //this.dialogText.text = text; chama o texto quando o quadro sobe pelo "onComplete"
        this.scene.time.addEvent({
            repeat: text.length-1,
            delay: 26,
            callback: () => {
                this.dialogText.text += text[i++];
                if (this.dialogText.text.length == text.length){
                    //this.hideDialog();
                    this.isDialogBlocked = false;
                    
                }
            },
        })
    }

    hideDialog(){

        this.scene.add.tween({
            targets: this.dialog,
            duration: 400,
            y: this.dialogPositionHide,
            ease: Phaser.Math.Easing.Back.In, // Back, Elastic, Easing, Bouce, Expo, In, Out 
            //ease: Phaser.Math.Easing.Elastic.Out, 

        });
    }


}