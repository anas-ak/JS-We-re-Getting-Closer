var stage = new createjs.StageGL("canvas", {
    antialias: true,
    preserveBuffer: true 
});

var MAX = 1200, 
    RADIUS = 30,
    COLORS = [
        {   
            title: "Pie", 
            
            // The first color will be set as the background & font-color
            colors: [
                     "#FFFCFC", //Snow
                     "#F0DFAB", //Sidecar - Cream
                     "#C98A3B", //Anzac - Sand
                     "#F10879", //Deep Pink
                     "#E0A421"  //Galliano - Caramel
                    ]
        },
        {
            title: "Samurai",
            colors: [
                     "#080808", //Black
                     "#4E280B", //Baker's Chocolate
                     "#CFCF7C", //Deco - Light Olive Green
                     "#5C1E1B", //Red Oxide
                     "#CA0700"  //Free Speech Red
            ]
        },
        {
            title: "Firefox",
            colors: [
                     "#4878A8", //Steel Blue
                     "#A8D8F0", //Light Blue
                     "#F07830", //West Side - Orange
                     "#781800", //Maroon
                     "#487890"  //Jelly Bean - Blue tint
                    ]
        },
        {
            title: "Froggy",
            colors: [
                     "#2C1E1E", //Nero - Dark Brown
                     "#32382C", //Black Forest - Dark Mint
                     "#235D23", //Parsley - Green
                     "#C6D5B0", //Pale Leaf
                     "#DFFF6D"  //Mindaro - Lime
                    ]
        },
        {
            title: "Get Oil",
            colors: [
                     "#E1D4C0", //Blanc - Latte
                     "#FF6600", //Safety Orange
                     "#104386", //Dark Cerulean
                     "#6699FF", //Cornflower Blue
                     "#F5EDE3"  //Bridal Health - Creamy
                    ]
        },
        {
            title: "Cherry\n Blossom",
            colors: [
                     "#BD1311", //Fire Brick
                     "#B8B8B8", //Pink Swan - Grey
                     "#FFFFFF", //White
                     "#DB4342", //Cinnabar - Red
                     "#D33534"  //Persian Red
                    ]
        },
        {
            title: "Smog",
            colors: [
                     "#3E4D5C", //Cello - Blue/Grey
                     "#A5B19B", //Norway - Light Olive
                     "#42423C", //Heavy Metal - Yellow-Green
                     "#F2F0DF", //Rice Cake
                     "#A9C1D9"  //Light Steel Blue 
                    ]
        }
    ];

var search = window.location.search.substring(1),
    fields = {},
    parameters = {};

if(search) {
    fields = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
}

for(var key in fields) {
    parameters[key.toLowerCase()] = fields[key];
}

var colors, title, bgColor;
var textTimeout;
var sb, ss, 
    store = [],
    sprites = [];

// Preload the font since sometimes it's not ready in time
var loader = new createjs.FontLoader({
    src: "https://fonts.googleapis.com/css?family=Magra:700",
    type: "fontcss"
}, true);
loader.on("complete", showText);
loader.load();

var textReady = false;

function init(overIndex) {
    stage.autoClear = true;

    var index = (!isNaN(overIndex)) ? overIndex : (Math.random() * COLORS.length | 0);
    colors = COLORS[index].colors;
    title = COLORS[index].title.toUpperCase();
    bgColor = colors[Math.random() * colors.length | 0];
    stage.setClearColor(bgColor);
    fill.fillCmd.style = bgColor;
    fill.updateCache();

    // Make Sprites, and create a SpriteSheet for GL

    sb = new createjs.SpriteSheetBuilder();
    for (var i = 0, l = colors.length; i < l; i++) {
        var sprite = new createjs.Shape();
        sprite.graphics
            .f(colors[i])
            .dc(0, 0, RADIUS);
        sb.addFrame(sprite, new createjs.Rectangle(-RADIUS, -RADIUS, RADIUS * 2, RADIUS * 2), 2);
    }

    ss = sb.build();

    sprites.length = store.length = 0;
    cont.removeAllChildren();

    // Add text, fade in after 3s
    textReady = false;
    clearTimeout(textTimeout);
    textTimeout = setTimeout(function() {
        textReady = true;
        showText();
    }, 1000);

    // Seed the effect so it looks right at the start
    for(var i = 0; i < 80; i++) {
        tick();
    }
}

function showText() {
    if(!loader.loaded || !textReady) { return; }
    var text = new createjs.Text(title, "20px Magra", bgColor).set({ textAlign: "center", y: -10 });
    var b = text.getBounds();
    text.cache(b.x, b.y, b.width, b.height * 1.5, 2);
    cont.addChildAt(text, 0);
}

// Object Pool
function getSprite() {
    if(store.length == 0) {
        var sprite = null;
        if(sprites.legnth >= MAX) { return; }
        sprite = new createjs.Sprite(ss);
    } else {
        sprite = store.pop();
    }

    sprite.gotoAndStop(Math.random() * colors.length | 0);
    return sprite;
}

function returnSprite(sprite) {
    store.unshift(sprite);
}

// Create a new sprite from the pool and initialize
function createSprite() {
    var sprite = getSprite();
    if(sprite != null) {
        cont.addChildAt(sprite, 0);
        sprite.set({
            a: Math.random() * Math.PI * 2,
            speed: Math.random() * 1,
            g: 0.1,
            scale: 0.5,
            alpha: 0
        });

        var pos = Math.random() * 50;
        sprite.x = Math.sin(sprite.a) * pos;
        sprite.y = Math.cos(sprite.a) * pos;
        sprites.push(sprite);
    }
}

// INIT

var cont = new createjs.Container().set({ x: 400, y: 400, scale: 2});
var fill = new createjs.Shape().set({ alpha: 0.05 });

fill.fillCmd = fill.graphics.f("#000").command;
fill.graphics.dr(0,0,100,100);
fill.cache(0,0,100,100);
stage.addChild(fill, cont);

createjs.Ticker.timingMode = "raf";
createjs.Ticker.on("tick", tick);

// On Tick, make a new sprite, and move the rest.

var h = 1;
function tick(event) {
    createSprite();
    createSprite();
    createSprite();

    for(var i = sprites.length-1; i >= 0; i--) {
        var sprite = sprites[i];
        sprite.x += Math.sin(sprite.a) * sprite.speed;
        sprite.y += Math.cos(sprite.a) * sprite.speed;
        sprite.scale *= 0.97;
        sprite.g *= 1.02;
        sprite.y += sprite.g;
        sprite.speed *= 0.997;
        sprite.alpha = Math.min(1, sprite.alpha + 0.1);

        if(sprite.scale < 0.01) {
            sprites.splice(i, 1);
            cont.removeChild(sprite);
            returnSprite(sprite);
        }
    }

    stage.update(event);
}

// Simple Resize
window.addEventListener("resize", handleResize);

function handleResize() {
    var w = stage.canvas.width = window.innerWidth;
    var h = stage.canvas.height = window.innerHeight;
    cont.x = w >> 1;
    cont.y = h >> 1;
    fill.scaleX = w/100;
    fill.scaleY = w/100;
    stage.updateViewport(w, h);
}

handleResize();

stage.on("stagemousedown", function() {
    stage.autoClear = false;
})

// Click to draw
stage.on("stagemouseup", init);
document.getElementById("overlay").addEventListener("click", init);
init(parameters.variation);