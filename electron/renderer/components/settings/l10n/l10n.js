/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

async function load(locale){
  const { default: l10n } = await import(`./${locale}.json`, { 
    assert: { type: "json" } 
  });
  return l10n;
}

async function localize(locale){
  let l10n;
  try{
    l10n = await load(locale);
  }catch{ //Fallback
    console.warn("Falling back to English");
    l10n = await load("en");
  }
  return l10n;
}

export { localize };