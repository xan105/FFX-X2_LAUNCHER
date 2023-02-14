import { join } from "node:path";
import { readFile, exists } from "@xan105/fs";
import { parse } from "@xan105/ini";
import { isObjNotEmpty } from "@xan105/is";
import { attempt } from "@xan105/error";
//import { app } from "electron";
import folders from "@xan105/usershellfolder";

const cwd = /*app.getAppPath();*/ "G:\\Library\\SteamLibrary\\steamapps\\common\\FINAL FANTASY FFX&FFX-2 HD Remaster";

const files = [
  join(folders.user.documents, "SQUARE ENIX/FINAL FANTASY X&X-2 HD Remaster/GameSetting.ini"),  
  join(cwd, "UnX.ini"),
  join(cwd, "UnX_Booster.ini"),
  join(cwd, "UnX_Gamepad.ini"),
  join(cwd, "UnX_Language.ini")
]

async function readSettingFile(filePath, encodings){
  for (const encoding of encodings)
  {
    const file = await readFile(filePath, encoding);
    const result = parse(file, { 
      translate: { 
        number: true 
      } 
    });
    if (isObjNotEmpty(result)) return result;
  }
}

async function hasUnx(){
  if (await exists(join(cwd, "dxgi.dll"))) { 
    const [ dxgi ] = await attempt(readSettingFile, [
      join(cwd, "dxgi.ini"),
      ["utf16le", "utf8"]
    ]);
    const unxPath = join(cwd, dxgi?.["Import.UnX"]?.Filename ?? "unx.dll");
    const has = await exists(unxPath);
    return has;
  } else {
    return false;
  }
}

async function read(){ 
  
  let promises = [
    readSettingFile(files[0], ["utf8"])
  ];
  
  const includeUnx = await hasUnx();
  
  if (includeUnx) {
    promises = promises.concat([
      readSettingFile(files[1], ["utf16le", "utf8"]),
      readSettingFile(files[2], ["utf16le", "utf8"]),
      readSettingFile(files[3], ["utf16le", "utf8"]),
      readSettingFile(files[4], ["utf16le", "utf8"])
    ]);
  }

  const data = await Promise.allSettled(promises);

  const result = data[0].value ?? Object.create(null);
  if (includeUnx) {
    result.unx = data[1].value ?? Object.create(null);
    result.unx.booster = data[2].value;
    result.unx.gamepad = data[3].value;
    result.unx.language = data[4].value;
  } else {
    result.unx = null;
  }

  return result;
}

export { read };

//writeFile
// force line ending as windows
// force bom utf16e for unx