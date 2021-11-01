const patrons = [
  'Tataru Taru',
  'Baked Popoto',
  'Erys Night',
  'Killagouge',
  'chiya',
  'DaiSuki2U (Leviathan)',
  'Maie Arania',
  'Peppermint Cordial Inc',
  'Okashii Kazegane',
  'Akurosia',
  'C\'elosia Arcanine',
  'Bubble Chocolate',
  'Pumpkin Spice Lattes',
  'Pint Sized Mafia',
  'Nunosi Ior',
  'Arik Dazkar',
  'latenightwreck',
  'uSmol',
  'S\'irle Alythia',
  'Alban Ashcroft',
  'Nachtiyrn Thosinsyn',
  'Midori Dragon',
  'Erwan Fairclough @ Moogle',
  'Izeyash Konturaen',
  'Morphean Knights @ Ultros',
  'Qih "Kweh" Mewrilah',
  'Jihn Molkoh',
  'Toi Toi Toi',
  'Walnut Bread Trading Co',
  'Sahjah Majime',
  'Uzari Azari',
  'Forgiven Ignorance | Cerberus',
  'Saga, de L\'Ordre des ombres',
  'Victoria Valyntara',
  'Scrapper Spart',
  'Icknickl Lodien',
  'Glanyx',
  'Oric Yaeger | Cerberus',
  'Post Mortem',
  'Raltz Klamar',
  'Alextros Blackthorne',
  'Nia Neyna',
  'Strati',
  'Kittie Purry',
  'Spiral Out @ Mateus',
  'Incendion Valoriot',
  'mlatin',
  'Salaciousrumour',
  'Cross Collaborative.',
  'Jajali Jali * Gilgamesh',
  'Mae Sorbet and Iranon Aira of Mateus',
  'Sombra\'s Scavengers on Jenova',
  'Raeanya Ashurke',
  'G\'lek Tarssza',
  'Syl Varil',
  'Late Night Friendos',
  'The Hoe Depot',
  '[Ultros] Nyumi Aitken'
];

const gifs = [
  'loader_BSM.gif',
  'loader_MIN.gif'
];

const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
document.getElementById('loader').setAttribute('src', window.baseGifPath + randomGif);

const randomPatron = patrons[Math.floor(Math.random() * patrons.length)];
document.getElementById('random-patron').innerText = randomPatron;

window.randomGif = window.baseGifPath + randomGif;
window.randomPatron = randomPatron;
