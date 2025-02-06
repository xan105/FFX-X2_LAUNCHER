About
=====

  Gamepad and UnX friendly launcher for `FINAL FANTASY X/X-2 HD Remaster (PC)`.

  - 🔍 Open source
  - 🎮 Gamepad (XInput) and 🖱 mouse/keyboard support
  - 🔧 [UnX](https://github.com/Kaldaien/UnX/releases) mod support: when installed display additional options
  - ⚙️ Bunch of options to customize your experience
  - 🐧 [Linux] Tested against Proton 7.0.6 (32bit prefix)

  <p align="center">
    <img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/main.png"><br />
    <em>Main menu</em>
  </p>
  
  <p align="center">
    <img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/settings_unx.png"><br />
    <em>Settings (UnX installed)</em>
  </p>

  <details><summary>More screenshots:</summary>

  <br />

  <p align="center">
    <img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/settings_launcher.png"><br />
    <em>Launcher settings</em>
  </p>

  <p align="center">
    <img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/main_alternate.png"><br />
    <em>Main menu (alternate)</em>
  </p>

  <p align="center">
    <img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/proton.png"><br />
    <em>🐧 Proton 7.0.6</em>
  </p>

  </details>

Install
=======

### Boxed version (single executable file)

  Replace `FFX&X-2_LAUNCHER.exe` in the `FINAL FANTASY FFX&FFX-2 HD Remaster` folder.

  ⚠️ Does not work on Linux (proton) as of this writing.

### Extract and replace file

  Extract `FINAL FANTASY FFX&FFX-2 HD Remaster/` archive content into the `FINAL FANTASY FFX&FFX-2 HD Remaster` game folder.

  💡 If you find it a bit messy consider the symlink method down below.

### Symlink

  Extract `FINAL FANTASY FFX&FFX-2 HD Remaster/` archive content into any folder like for example `FINAL FANTASY FFX&FFX-2 HD Remaster/launcher`

  Inside the `FINAL FANTASY FFX&FFX-2 HD Remaster` game folder symlink `FFX&X-2_LAUNCHER.exe` with `launcher/FFX&X-2_LAUNCHER.exe`

  ⚠️ NB: As of this writing the Steam client (Windows & Linux) does not follow symlink ! Using this method you will have to manually start the game.

Controls
========

#### GAMEPAD

  - `D-pad/Left Analog Stick`: Navigate / Change setting
  - `A Button`: Select
  - `B Button`: Previous menu
  - `Start / Options Button`: Enter settings
  - `LB/RB Shoulder`: Change settings section

#### MOUSE/KEYBOARD

  - `Left click / Enter`: Select
  - `Arrow keys`: Navigate / Change setting
  - `Esc / Mouse3`: Previous menu

Command line
============

  By default the launcher will look for game's files next to itself.

  If for whatever reason(s) you would like to change this, you can either

  - Use the `--gamePath` argument

  ```
  FFX&X-2_LAUNCHER.exe --gamePath="path\to\game\dir"
  ```

  - or set the env variable `GAMEPATH`

  ```
  GAMEPATH=path\to\game\dir
  ```

Build
=====

  - Node.js / NPM
  - C/C++ build tools and Python 3.x (node-gyp)
  - git
    
  ```
  git clone https://github.com/xan105/FFX-X2_LAUNCHER.git && cd FFX-X2_LAUNCHER
  npm ci --arch=ia32 
  npm run build
  //or
  npm run build:asar
  //or
  npm run build:asar:boxed
  ```

  ✔️ Application can be found in the `./dist` folder.<br />
  Boxed application can be found in the `./release` folder.

  NB: The boxed version (single executable file) is made by using [Enigma Virtual Box](https://enigmaprotector.com/en/aboutvb.html):
  its `.evb` project file is located in the `./build` folder (💡 it's just a xml file).

Legal
=====

  ©2001-2004, 2013-2016 SQUARE ENIX CO., LTD.<br />
  This Launcher is not affiliated nor associated with SQUARE ENIX CO., LTD.<br />
  Other trademarks are the property of their respective owners.<br />
  No copyright or trademark infringement is intended in using FINAL FANTASY™ content.
