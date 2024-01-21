import { Scene } from "phaser";
import { CONFIG } from "../config";
import HUD from "../entities/HUD";


export default class Lab2 extends Scene{

    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    hud;

    spaceDown = false;

    constructor(){
        super('Lab2');
    }

    preload(){
        //carregar os dados do mapa
        this.load.tilemapTiledJSON('tilemap-lab-info', './sala.tmj');

        //carregar os tilesets do map (as imagens)
        this.load.image('tiles-office', './mapas/tiles/tiles_office.png');
        
        this.load.atlas('hud', 'hud.png', 'hud.json');

    }

    create(){
        this.cursors = this.input.keyboard.createCursorKeys();

        this.createMap();
        this.createLayers();
        
        // cria o HUD e coloca na cena (this=Lab2)
        this.hud = new HUD(this, 0, 0);// cria o HUD e coloca na cena (this=Lab2)

    }

    update(){

        const { space } = this.cursors;

        if ( space.isDown && !this.spaceDown ){
            console.log("Espaco!!");
            this.spaceDown = true;
            this.hud.showDialog('Este é o texto que deve aparecer na caixa de dialogo, por favor coloque um texto grande aqui para que use varias linhas'); 
            
        } else if (!space.isDown && this.spaceDown){
            this.spaceDown = false;
        }

    }

    createMap(){
        this.map = this.make.tilemap({
            key: 'tilemap-lab-info',
            tileWidth: CONFIG.TILE_SIZE,    
            tileHeight: CONFIG.TILE_SIZE
        });

        //fazendo a correspondencia entre as imagens usadas no tiled e as criadas pelo phaser

        //addTilesetImage(nome da imagem no tiled, nome da imagem carregada no phaser)
        this.map.addTilesetImage('tiles_office', 'tiles-office');
    }

    createLayers(){
        //pegando tilesets (usar nomes dados no tiled)
        const tilesOffice = this.map.getTileset('tiles_office');

        const layerNames = this.map.getTileLayerNames();

        for (let i = 0; i < layerNames.length; i++){
            const name = layerNames[i];

            this.layers[name] = this.map.createLayer(name, [tilesOffice], 0, 0);
            //definindo a profundidade de cada camada
            this.layers[name].setDepth(i);

            //verificando se o layer possui colisão
            if(name.endsWith('collision')){
                this.layers[name].setCollisionByProperty({collide: true});

                if ( CONFIG.DEBUG_COLLISION ) {
                    const debugGraphics = this.add.graphics().setAlpha(0.75).setDepth(i);
                    this.layers[name].renderDebug(debugGraphics, {
                        tileColor: null, // Color of non-colliding tiles
                        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                    });
                }
            }
        }

        //console.log(this.layers);
        //console.log(this.map.getTileLayerNames());
    }

}