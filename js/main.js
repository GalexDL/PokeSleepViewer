let app;
let char;
let audioList = []
let audios;
let isCharacterLoaded = false;
let debug = 0; //set via console

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
  if (app.stage.children.length > 0) {
    app.stage.removeChildren();
    app.loader.reset();
  }
  // remove previous audio
  if (audioList.length !== 0) {
    for (var i in audioList) {
      audioList[i].stop();
    }
    audioList = [];
  }

  // load new spine
  app.loader.add("char", `./${model}`).load(() => {
    onAssetsLoaded(model);
  });
}

function onAssetsLoaded(model) {
  if (audioList.length !== 0) {
    for (var i in audioList) {
      audioList[i].stop();
    }
    audioList = [];
  }

  char = new PIXI.spine.Spine(app.loader.resources.char.spineData);

  // Scaler
  char.scale.x = 0.5;
  char.scale.y = 0.5;

  // Centerize
  char.x = window.innerWidth / 2;
  char.y = window.innerHeight / 1;

  // Set option value
  option.scale.value = 0.5;
  option.x.value = char.x;
  option.y.value = char.y;

  // Insert animations to index.html
  const animations = char.spineData.animations;
  let check = false;
  option.animations.innerHTML = "";
  for (var i in animations) {
    let a = document.createElement("option");
    a.value = a.innerHTML = animations[i].name;
    option.animations.append(a);
    if (animations[i].name === "Start_Idle_01") {
      check = true;
    }
  }

  // Play Animation
  if (check) {
    char.state.setAnimation(0, "Start_Idle_01", option.loop.checked);
    optionAnimations.value = "Start_Idle_01";
  } else {
    char.state.setAnimation(0, animations[0].name, option.loop.checked);
  }

  // Voiceline Listener / Handler
  char.state.addListener({
    event: function (entry, event) {
      if (debug) console.log(event);
      if (event.stringValue === "") return;
      if (!option.talkSound.checked) return;
      let charName = option.models.options[
        option.models.selectedIndex
      ].text.replace("_home", "");
      // Camalize
      if (charName.indexOf("_") !== -1) {
        charName = charName
          .toLowerCase()
          .replace(/([-_][a-z])/g, (group) =>
            group.toUpperCase().replace("-", "").replace("_", "")
          );
      }
      charName = charName.charAt(0).toUpperCase() + charName.slice(1);
      if (debug) console.log(charName);
      // Play
      if (charName === "MashiroSwimsuit") charName = "CH0061";
      if (charName === "ShirokoRidingsuit") charName = "ShirokoRidingSuit";
      let voice = new Howl({
        src: [audios[event.stringValue]],
      });
      // If already loaded, play it
      if (voice.state() === "loaded") voice.play();
      else if (voice.state() === "loading") {
        voice.on("load", function () {
          voice.play();
        });
      }
      audioList.push(voice);
    },
  });

  // Add to main canvas
  app.stage.addChild(char);
  isCharacterLoaded = true;

  // Call setSkinByName function with the selected model as the initial skin name
  const initialSkinName = model.substring(
    model.lastIndexOf("/") + 1,
    model.lastIndexOf(".")
  );
  setSkinByName(initialSkinName);
}

function setSkinByName(skinName) {
  char.skeleton.setSkin(null);
  char.skeleton.setSkinByName(skinName);
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
// Initialize option object
