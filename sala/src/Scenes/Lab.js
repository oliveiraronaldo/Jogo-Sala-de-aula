import {Scene, UP} from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/touch";

export default class Lab extends Scene {

    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    /**@type {Player} */
    player;
    touch;

    aviso = true;
    quadro = true;
    lixeiraAz = true;
    lixoAz = false;
    lixeiraLr = true;
    lixoLr = false;
    lixeiraObjLr;
    lixeiraObjAz;
    text;
    textQuadro;


    /**@type {Phaser.Physics.Arcade.Group} */
    groupObjects;

    isTouching = false;

    constructor(){
        super('Lab');
    }

    preload(){
        //carregar os dados do mapa
        this.load.tilemapTiledJSON('tilemap-lab-info', './sala.tmj');

        //carregar os tilesets do map (as imagens)
        this.load.image('tiles-office', './mapas/tiles/tiles_office.png');

        //importando spritesheet
        this.load.spritesheet('player', './mapas/tiles/player.png', {
            frameWidth: CONFIG.TILE_SIZE,
            frameHeight: CONFIG.TILE_SIZE * 2
        });

        this.load.spritesheet('trash', './mapas/tiles/lixeiras_spritesheet.png', {
            frameWidth: CONFIG.TILE_SIZE,
            frameHeight: CONFIG.TILE_SIZE*2
        });
    }

    create(){
        this.createMap();
        this.createLayers();
        this.createObjectsTrash();
        this.createPlayer();
        this.createObjects();
        this.createCamera();
        this.createColliders();
    }

    update(){

        
    }

    createPlayer(){

        this.touch = new Touch(this, 10*16, 5*16);
        this.player = new Player(this, 10*16, 5*16, this.touch);
        this.player.setDepth(2);

        
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

    //criando layers de forma automatica
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

    createObjects(name){
        //criar um grupo para os objetos

        //criando sprites para cada objeto que vier da camada de objetos do tiled
        //Parametros: nome da camada no tiles, propriedade de seleção
        const objects = this.map.createFromObjects("Objetos", {
            name: name,
            //qual imagem sera carregada no sprite (se houver)
            //key:"player"
        });



        //Tornando todos os objetos, sprites com physics (que possuem body)
        this.physics.world.enable(objects);


        for(let i = 0; i < objects.length; i++){
            //pegando o objeto atual
            const obj = objects[i];
            //pegando as informações do Objeto definidas no Tiled
            const prop = this.map.objects[0].objects[i];

            obj.setDepth(this.layers.length+1);
            obj.setVisible(false);

            this.groupObjects.add(obj);

            //console.log(obj);
        }
    }


    createObjectsTrash(name){
        //criar um grupo para os objetos
        this.groupObjects = this.physics.add.group();


        //criando sprites para cada objeto que vier da camada de objetos do tiled
        //Parametros: nome da camada no tiles, propriedade de seleção
        const objects = this.map.createFromObjects("Objetos_lixeiras", {
            name: name,
            //qual imagem sera carregada no sprite (se houver)
            //key: 'player'
        });

        

        //Tornando todos os objetos, sprites com physics (que possuem body)
        this.physics.world.enable(objects);


        for(let i = 0; i < objects.length; i++){
            //pegando o objeto atual
            const obj = objects[i];
            //pegando as informações do Objeto definidas no Tiled
            const prop = this.map.objects[0].objects[i];
            if (obj.name == 'lixo_laranja') {
                obj.setTexture('trash');
                obj.setFrame(0);
                obj.setScale(1);
                obj.body.setSize(13,16);
                this.lixeiraObjLr = obj;
                this.groupObjects.add(obj);
                obj.body.immovable = true;
            }else if(obj.name == 'lixo_azul'){
                obj.setTexture('trash');
                obj.setFrame(3);
                obj.setScale(1);
                obj.body.setSize(13,16);
                this.lixeiraObjAz = obj;
                this.groupObjects.add(obj);
                obj.body.immovable = true;
            }
        }
    }
    
    //inserindo layers manualmente
    // createLayerManual(){
    //     const tilesOffice = this.map.getTileset('tiles_office');
    //     console.log(this.map.getTileLayerNames());

    //     this.map.createLayer('abaixo', [tilesOffice], 0,0);
    //     this.map.createLayer('nivel 0', [tilesOffice], 0,0);
    //     this.map.createLayer('nivel 1', [tilesOffice], 0,0);
    //     this.map.createLayer('nivel 2', [tilesOffice], 0,0);
    //     this.map.createLayer('nivel 3', [tilesOffice], 0,0);
    // }

    createCamera(){
        const mapWidth = this.map.width * CONFIG.TILE_SIZE;
        const mapHeight = this.map.height * CONFIG.TILE_SIZE;

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player);
    }

    createColliders(){
        //diferença COLLIDER X OVERLAP
        //COLLIDER: colide e impede a passagem
        //OVERLAP: detecta a sobreposição dos elementos, não impede a passagem

        //criando colisão entre o player e as camadas de colisão do tiled
        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++){
            const name = layerNames[i];

            if(name.endsWith('collision')){
                this.physics.add.collider(this.player, this.layers[name]);
                console.log(this.layers[name])
            }
        }  

        
        this.physics.add.collider(this.player, this.lixeiraObjAz);
        this.physics.add.collider(this.player, this.lixeiraObjLr);

        
        //criar colisão entre o a "mãozinha" Player (Touch) e os objetos da camada de Objetos
        //objetos da camada de Objetos
        //chama a função this.handleTouch toda vez que o this.touch entrar em contato com um objeto do this.groupObjects
        this.physics.add.overlap(this.touch, this.groupObjects, this.handleTouch, undefined, this);
    }

    handleTouch(touch, object){

        //ja realizou o primeiro toque, sai
        if(this.isTouching && this.player.isAction){
            //console.log(1);
            return;
        }

        //esta tocando mas soltou o espaço (para de tocar)
        if(this.isTouching && !this.player.isAction){
            this.isTouching = false;
            //console.log(2);
            return;
        }

        //acabou de apertar o espaço pela primeira vez e ainda não iniciou o toque
        if(this.player.isAction){
            this.isTouching = true;
            //console.log(object);

            if(object.name == "quadro"){
                
                if(this.quadro){
                    this.textQuadro = this.add.text(160,35, "Prog. Jogos 5p",{
                        fontSize: "10px",
                        color: "black,"
                        
                    }).setOrigin(0.5,0.5).setDepth(0);
                    this.quadro = false;
                }else{
                    this.textQuadro.destroy();
                    this.quadro = true;
                } 
            }

            if(object.name == "aviso_celular"){
                
                if(this.aviso){
                    this.text = this.add.text(160,70, "Proibido o uso de celular \ne equipamentos eletrônicos",{
                        fontSize: "12px",
                        color: "black,"
                        
                    }).setOrigin(0.5,0.5);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
                    this.aviso = false;
                }else{
                    this.text.destroy();
                    this.player.cursors = this.input.keyboard.addKeys({
                        up: Phaser.Input.Keyboard.KeyCodes.UP,
                        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                        space: Phaser.Input.Keyboard.KeyCodes.SPACE
                    });
                    this.aviso = true;
                } 
            }


            if(object.name == "aviso_comida"){
                
                if(this.aviso){
                    this.text = this.add.text(160,70, "Proibido alimentos e \nbebidas",{
                        fontSize: "12px",
                        color: "black,"
                        
                    }).setOrigin(0.5,0.5);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
                    this.aviso = false;
                }else{
                    this.text.destroy();
                    this.player.cursors = this.input.keyboard.addKeys({
                        up: Phaser.Input.Keyboard.KeyCodes.UP,
                        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                        space: Phaser.Input.Keyboard.KeyCodes.SPACE
                    });
                    this.aviso = true;
                } 
            }

            if(object.name == "lixo_azul"){
                if (this.lixeiraAz && !this.lixoAz) {
                    object.setFrame(4);
                    this.lixeiraAz = !this.lixeiraAz;
                }
                else if(!this.lixeiraAz && !this.lixoAz){
                    object.setFrame(5);
                    this.lixoAz = !this.lixoAz;
                }
                else if(this.lixeiraAz && this.lixoAz){
                    object.setFrame(5);
                    this.lixeiraAz = !this.lixeiraAz;
                }
                else{
                    object.setFrame(3);
                    this.lixeiraAz = !this.lixeiraAz;
                }
            }
            


            if(object.name == "lixo_laranja"){
                if (this.lixeiraLr && !this.lixoLr) {
                    object.setFrame(1);
                    this.lixeiraLr = !this.lixeiraLr;

                }else if(!this.lixeiraLr && !this.lixoLr){
                    object.setFrame(2);
                    this.lixoLr = !this.lixoLr;
                }
                else if(this.lixeiraLr && this.lixoLr){
                    object.setFrame(2);
                    this.lixeiraLr = !this.lixeiraLr;
                }
                else{
                    object.setFrame(0);
                    this.lixeiraLr = !this.lixeiraLr;
                }
            }



            if(object.name == "cadeira"){
                if (this.player.body.enable == true) {
                    this.player.body.enable = false;
                    this.player.setPosition(object.x-8, object.y-8);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
                    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
                    this.player.direction = 'up';
                    this.player.setDepth(1);
                
                }else{
                    this.player.body.enable = true;
                    this.player.setPosition(object.x+8, object.y-8);
                    this.player.cursors = this.input.keyboard.addKeys({
                        up: Phaser.Input.Keyboard.KeyCodes.UP,
                        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                        space: Phaser.Input.Keyboard.KeyCodes.SPACE
                    });

                    this.player.setDepth(3);

                    //console.log("player: " + this.player.depth);
                    
                }
            }
        }

        
    }
}
