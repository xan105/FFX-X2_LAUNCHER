const locale = navigator.language.slice(0,2).toLowerCase();

async function readLocalization(locale = "en"){
  const { default: l10n } = await import(`./l10n/${locale}.json`, { 
    assert: { type: "json" } 
  });
  return l10n;
}

async function getLocalization(){
  let l10n;
  try{
    l10n = await readLocalization(locale);
  }catch{
    l10n = await readLocalization();
  }
  return l10n;
}

const l10n = await getLocalization();

export { locale, l10n };