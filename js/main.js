let app;
let char;
let audioList = []
let audios;
let isCharacterLoaded = false;
let debug = 0; //set via console
let res;

function reCanvas() {
    audios = JSON.parse(httpGet("./data/audio.json"));
    app = new PIXI.Application(
        {
            width: window.innerWidth,
            height: window.innerHeight,
            view: document.getElementById("screen")
        }
    );
}

function loadChar(model) {
    isCharacterLoaded = false;
    // remove previous spine
    if(app.stage.children.length > 0) {
        app.stage.children.pop();
        app.loader.resources = {};
    }
    // remove previous audio
    if(audioList.length != 0) {
        for(var i in audioList) {
            audioList[i].stop();
        }
        audioList = [];
    }

    // load new spine
    app.loader
        .add('char', `./${model}`)
        .load(onAssetsLoaded);
}


function onAssetsLoaded(loader, resources) {
    res = resources;
    
    if(audioList.length != 0) {
        for(var i in audioList) {
            audioList[i].stop();
        }
        audioList = [];
    }

    char = new PIXI.spine.Spine(res.char.spineData);

    // console.log(char)
    // console.log(char.spineData.height)
    // console.log(char.spineData.width)

    // Scaler
    char.scale.x = 0.5;
    char.scale.y = 0.5;

    // Centerize
    char.x = window.innerWidth/2;
    char.y = window.innerHeight/1;

    //Set option value
    option.scale.value = 0.5;
    option.x.value = char.x;
    option.y.value = char.y;

    
    // Insert animations to index.html
    const animations = res.char.spineData.animations;
    let check = 0;
    option.animations.innerHTML = "";
    for(var i in animations) {
        let a = document.createElement("option");
        a.value = a.innerHTML = animations[i].name;
        option.animations.append(a)
        if(animations[i].name == "Start_Idle_01")
            check = 1;
    }

    //Play Animation
    if(check) {
        char.state.setAnimation(0, "Start_Idle_01", option.loop.checked);
        optionAnimations.value = "Start_Idle_01";
    } else {
        char.state.setAnimation(0, animations[0].name, option.loop.checked);
    }
    // Voiceline Listener / Handler
    char.state.addListener({
        event: function(entry, event) {
            if(debug)
                console.log(event)
            if(event.stringValue == '')
                return;
            if(!option.talkSound.checked)
                return;
            let charName = option.models.options[option.models.selectedIndex].text.replace("_home", "")
            //Camalize
            if(charName.indexOf("_") != -1) {
                charName = charName.toLowerCase().replace(/([-_][a-z])/g, group =>
                group
                .toUpperCase()
                .replace('-', '')
                .replace('_', '')
                );
            }
            charName = charName.charAt(0).toUpperCase() + charName.slice(1);
            if(debug)
                console.log(charName)
            //Play
            if(charName == 'MashiroSwimsuit')
                charName = 'CH0061';
            if(charName == 'ShirokoRidingsuit')
                charName = 'ShirokoRidingSuit'
            let voice = new Howl({
                src: [audios[event.stringValue]]
            });
            // If already loaded, play it
            if(voice.state() == 'loaded')
                voice.play();
            else if(voice.state() == 'loading') {
                voice.on('load', function() {
                    voice.play();
                })
            }
            audioList.push(voice);
        }
    })
    // Insert skins to index.html
    const skins = res.char.spineData.skins;
    let checker = 0;
    option.skins.innerHTML = "";
    for(var i in skins) {
        let a = document.createElement("option");
        a.value = a.innerHTML = skins[i].name;
        option.skins.append(a)
        if(skins[i].name == "Normal")
            checker = 1;
    }
    //Add to main canvas
    app.stage.addChild(char);
    isCharacterLoaded = true;
}

function playAnimation(name) {
    if(audioList.length != 0) {
        for(var i in audioList) {
            audioList[i].stop();
        }
        audioList = [];
    }

    char.state.setAnimation(0, name, option.loop.checked);
}

function setSkinByName(skinName) {
  //skeleton = new PIXI.spine.Spine(res.char.spineData.skeleton);

  skeleton.setSkin(null);
  skeleton = new PIXI.spine.Spine(res.char.spineData.skeleton);
  skeleton.setSkinByName(skinName);
}
