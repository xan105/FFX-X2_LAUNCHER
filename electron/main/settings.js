/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { readFile, writeFile, exists } from "@xan105/fs";
import { parse, stringify } from "@xan105/ini";
import { isObjNotEmpty } from "@xan105/is";
import {
  shouldStringNotEmpty,
  shouldArrayOfStringNotEmpty,
  shouldObjNotEmpty
} from "@xan105/is/assert";
import { attempt } from "@xan105/error";
import folders from "@xan105/usershellfolder";
import { gamePath } from "./gamedir.js";

const files = [
  join(folders.user.documents, "SQUARE ENIX/FINAL FANTASY X&X-2 HD Remaster/GameSetting.ini"),  
  join(gamePath, "UnX.ini"),
  join(gamePath, "UnX_Booster.ini"),
  join(gamePath, "UnX_Gamepad.ini"),
  join(gamePath, "UnX_Language.ini")
]

async function readSettingFile(filePath, encodings){

  shouldStringNotEmpty(filePath);
  shouldArrayOfStringNotEmpty(encodings);

  for (const encoding of encodings)
  {
    const file = await readFile(filePath, encoding);
    const result = parse(file, { translate: false });
    if (isObjNotEmpty(result)) return result;
  }
}

async function hasUnx(){
  if (await exists(join(gamePath, "dxgi.dll")) === false) return false; 
    
  const [ dxgi ] = await attempt(readSettingFile, [
    join(gamePath, "dxgi.ini"),
    ["utf16le", "utf8"]
  ]);
  const unxPath = join(gamePath, dxgi?.["Import.UnX"]?.Filename ?? "unx.dll");
  const result = await exists(unxPath);
  return result;
}

async function read(){ 
  
  let promises = [
    readSettingFile(files[0], ["utf8"])
  ];
  
  const unx = await hasUnx();
  
  if (unx) {
    promises = promises.concat([
      readSettingFile(files[1], ["utf16le", "utf8"]),
      readSettingFile(files[2], ["utf16le", "utf8"]),
      readSettingFile(files[3], ["utf16le", "utf8"]),
      readSettingFile(files[4], ["utf16le", "utf8"])
    ]);
  }

  const data = await Promise.allSettled(promises);
  
  const result = data[0].value ?? Object.create(null);
  if (unx) {
    result.unx = Object.assign(
      Object.create(null),
      data[1].value,
      data[2].value,
      data[3].value,
      data[4].value
    );
  } else {
    result.unx = null;
  }

  return result;
}

async function write(settings){
  
  shouldObjNotEmpty(settings);
  
  const { unx } = settings;
  delete settings.unx;
  
  const promises = [
    writeFile(files[0], stringify(settings, {eol: "\r\n"}), "utf8")
  ];

  if (unx){
  
    //Forcing some value as per author's instruction (better safe than sorry)
    unx["UnX.Render"] ??= Object.create(null);
    unx["UnX.Render"].BypassIntel = "false"; //STABILITY_NOTE
    unx["UnX.Stutter"] ??= Object.create(null);
    unx["UnX.Stutter"].Reduce = "false"; //REMOVAL0
    unx["UnX.Input"] ??= Object.create(null);
    unx["UnX.Input"].TrapAltTab = "false"; //DEPRECATION0
    unx["UnX.Input"].FixBackgroundInput = "false"; //DEPRECATION0
    
    //Sync audio lang options to "Master Voice" for simplicity sake
    unx["Language.Master"] ??= Object.create(null);
    unx["Language.Master"].Voice ??= "en";
    unx["Language.Master"].SoundEffects = unx["Language.Master"].Voice;
    unx["Language.Master"].Video = unx["Language.Master"].Voice;
    unx["FFX.exe"] ??= Object.create(null);
    unx["FFX.exe"].SoundEffects = unx["Language.Master"].Voice;
    unx["FFX.exe"].Video = unx["Language.Master"].Voice;
    unx["FFX.exe"].Voice = unx["Language.Master"].Voice;
    unx["FFX&X-2_Will.exe"] ??= Object.create(null);
    unx["FFX&X-2_Will.exe"].SoundEffects = unx["Language.Master"].Voice;
    unx["FFX&X-2_Will.exe"].Video = unx["Language.Master"].Voice;
    unx["FFX&X-2_Will.exe"].Voice = unx["Language.Master"].Voice;

    //Remapping each UnX section to its corresponding file
    promises.push( writeFile(files[1], stringify({ 
      "UnX.Display": unx["UnX.Display"], 
      "UnX.Render": unx["UnX.Render"], 
      "UnX.Stutter": unx["UnX.Stutter"],
      "UnX.Textures": unx["UnX.Textures"],
      "UnX.Input": unx["UnX.Input"],
      "UnX.Compatibility": unx["UnX.Compatibility"],
      "UnX.System": unx["UnX.System"]
    }, {eol: "\r\n"}), { bom: true, encoding: "utf16le" }) );

    promises.push( writeFile(files[2], stringify({ 
      "Boost.FFX": unx["Boost.FFX"], 
      "Fun.FFX": unx["Fun.FFX"],  
      "SpeedHack.FFX": unx["SpeedHack.FFX"]
    }, {eol: "\r\n"}), { bom: true, encoding: "utf16le" }) );
    
    promises.push( writeFile(files[3], stringify({ 
      "UNX.Keybinds": unx["UNX.Keybinds"], 
      "Gamepad.Type": unx["Gamepad.Type"],
      "Gamepad.Remap": unx["Gamepad.Remap"],
      "Gamepad.PC": unx["Gamepad.PC"],
      "Gamepad.Steam": unx["Gamepad.Steam"]
    }, {eol: "\r\n"}), { bom: true, encoding: "utf16le" }) );
    
    promises.push( writeFile(files[4], stringify({ 
      "Language.Master": unx["Language.Master"],
      "FFX.exe": unx["FFX.exe"],
      "FFX&X-2_Will.exe": unx["FFX&X-2_Will.exe"]
    }, {eol: "\r\n"}), { bom: true, encoding: "utf16le" }) );
  }
  
  await Promise.all(promises);
}

export { read, write };