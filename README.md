About
=====

Gamepad and UnX friendly launcher for `FINAL FANTASY X/X-2 HD Remaster (PC)`.

- 🔍 Open source
- 🎮 Gamepad (XInput) and 🖱 mouse/keyboard support
- 🔧 [UnX](https://steamcommunity.com/groups/SpecialK_Mods/discussions/8/2741975115064718432/) mod support: when installed display additional options
- ⚙️ Bunch of options to customize your experience
- 🐧 [Linux] Tested against Proton .x (32bit prefix)

<details><summary>Screenshot:</summary>

<p align="center">
<img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/main.png"><br />
<em>Main menu</em>
</p>

<p align="center">
<img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/settings_unx.png"><br />
<em>Settings (UnX installed)</em>
</p>

<p align="center">
<img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/settings_launcher.png"><br />
<em>Launcher settings</em>
</p>

<p align="center">
<img src="https://github.com/xan105/FFX-X2_LAUNCHER/raw/master/screenshot/main_alternate.png"><br />
<em>Main menu (alternate)</em>
</p>

</details>

Install
=======

Replace `FFX&X-2_LAUNCHER.exe` in the `FINAL FANTASY FFX&FFX-2 HD Remaster` folder.

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
- Internet connection
  
```
git clone https://github.com/xan105/FFX-X2_LAUNCHER.git && cd FFX-X2_LAUNCHER  
npm run-script build
```

Application can be found in the `dist` folder as well as a boxed version (single executable file).

Legal
=====

©2001-2004, 2013-2016 SQUARE ENIX CO., LTD.<br />
This Launcher is not affiliated nor associated with SQUARE ENIX CO., LTD.<br />
Other trademarks are the property of their respective owners.<br />
No copyright or trademark infringement is intended in using FINAL FANTASY™ content.
