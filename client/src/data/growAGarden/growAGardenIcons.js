// Grow a Garden Calculator — per-item icon mapping.
//
// The reference site uses actual game-rendered icon images
// (Images/<id>.webp), which are proprietary "Grow a Garden" (Roblox)
// game art — not reproduced here. Instead, every plant and pet is
// mapped to a real Unicode emoji chosen for thematic fit (by the
// plant/animal it's named after, or its closest visual analog for
// fantasy items), giving each item its own distinct icon without any
// copyright risk. Unicode emoji don't cover every possible fantasy
// name 1:1 — a handful of thematically-close items intentionally
// share an emoji where no closer match exists (e.g. several
// "-dinoshroom"/dinosaur-themed pets share a dinosaur emoji).

export const PLANT_EMOJI = {
  easteregg: "🥚", moonflower: "🌙", starfruit: "⭐", pepper: "🌶️", grape: "🍇",
  nightshade: "🌿", mint: "🌿", glowshroom: "🍄", bloodbanana: "🍌", beanstalk: "🌱",
  coconut: "🥥", candyblossom: "🍬", carrot: "🥕", strawberry: "🍓", blueberry: "🫐",
  orangetulip: "🌷", tomato: "🍅", daffodil: "🌼", watermelon: "🍉", pumpkin: "🎃",
  mushroom: "🍄", bamboo: "🎍", apple: "🍎", corn: "🌽", cactus: "🌵",
  cranberry: "🍒", moonmelon: "🍈", durian: "🍈", peach: "🍑", cacao: "🍫",
  moonglow: "✨", dragonfruit: "🐉", mango: "🥭", moonblossom: "🌺", raspberry: "🍇",
  eggplant: "🍆", papaya: "🥭", celestiberry: "✨", moonmango: "🥭", passionfruit: "🍈",
  soulfruit: "👻", chocolatecarrot: "🍫", redlolipop: "🍭", candysunflower: "🍬", lotus: "🪷",
  pineapple: "🍍", hive: "🐝", lilac: "🌸", rose: "🌹", foxglove: "🌸",
  purpledahlia: "🌸", sunflower: "🌻", pinklily: "🌸", nectarine: "🍑", lavender: "💜",
  honeysuckle: "🌸", venusflytrap: "🌱", nectarshade: "🌺", manuka: "🌸", emberlily: "🔥",
  dandelion: "🌼", lumira: "✨", crocus: "🌸", suncoil: "☀️", beebalm: "🐝",
  nectarthorn: "🌺", violetcorn: "🌽", bendboo: "🎍", succulent: "🌵", sugarapple: "🍎",
  cursedfruit: "💀", cocovine: "🍇", dragonpepper: "🌶️", cauliflower: "🥦", avocado: "🥑",
  greenapple: "🍏", kiwi: "🥝", banana: "🍌", pricklypear: "🌵", feijoa: "🍈",
  loquat: "🍈", wildcarrot: "🥕", pear: "🍐", cantaloupe: "🍈", parasolflower: "☂️",
  rosydelight: "🌸", elephantears: "🌿", bellpepper: "🫑", aloevera: "🌵", peacelily: "🕊️",
  travelersfruit: "🍈", delphinium: "🌸", lilyofthevalley: "🌸", guanabana: "🍈", pitcherplant: "🌿",
  rafflesia: "🌺", libertylily: "🌸", fireworkflower: "🎆", boneblossom: "🦴", horneddinoshroom: "🦕",
  fireflyfern: "✨", stonebite: "🪨", boneboo: "🦴", paradisepetal: "🌴", burningbud: "🔥",
  fossilight: "🦴", horsetail: "🌿", giantpinecone: "🌲", lingonberry: "🍒", grandvolcania: "🌋",
  amberspine: "🟠", monoblooma: "🌸", serenity: "🕊️", softsunshine: "☀️", taroflower: "🌸",
  spikedmango: "🥭", zenrocks: "🪨", hinomai: "🌸", mapleapple: "🍁", zenflare: "🔥",
  dezen: "☯️", enkaku: "🌸", tranquilbloom: "🌸", sakurabush: "🌸", luckybamboo: "🎍",
  elderstrawberry: "🍓", fruitball: "🍈", twistedtangle: "🌿", veinpetal: "🌸", artichoke: "🌿",
  crownmelon: "🍈", sugarglaze: "🍬", jalapeno: "🌶️", onion: "🧅", tallasparagus: "🌿",
  grandtomato: "🍅", tacofern: "🌿", rhubarb: "🌿", badlandpepper: "🌶️", pricklefruit: "🌵",
  springonion: "🧅", butternutsquash: "🎃", kingcabbage: "🥬", bittermelon: "🍈", mandrake: "🌿",
  mangosteen: "🥭", goldenegg: "🥚", poseidonplant: "🌊", canarymelon: "🍈", gleamroot: "✨",
  duskpuff: "🌆", amberheart: "🟠", princessthorn: "👑", flaredaisy: "🌼", romanesco: "🥦",
  flaremelon: "🍈", crownofthorn: "👑", callalily: "🌸", glowpod: "✨", willowberry: "🍇",
  cyclamen: "🌸", potato: "🥔", broccoli: "🥦", cocomango: "🥭", glowthorn: "✨",
  brusselsprouts: "🥬", briarrose: "🌹", sunbulb: "☀️", lightshoot: "✨", spiritflower: "👻",
  wispwing: "🧚", auroravine: "🌌",
};

export const PET_EMOJI = {
  lobster: "🦞", kiwi: "🐦", bloodkiwi: "🐦", mimic: "🎭", capybara: "🐹",
  sloth: "🦥", dilo: "🦖", rainbowdilo: "🦖", peacock: "🦚", mooncat: "🐱",
  seaturtle: "🐢", frog: "🐸", brontosaurus: "🦕", queenbee: "🐝", starfish: "⭐",
  spinosaurus: "🦖", echofrog: "🐸", ckitsune: "🦊", ferret: "🦫", goldengoose: "🪿",
  kitsune: "🦊", seal: "🦭", koi: "🐟", wasp: "🐝", nightowl: "🦉",
  bloodowl: "🦉", owl: "🦉", cookedowl: "🦉", orangetabby: "🐱", butterfly: "🦋",
  trex: "🦖", mole: "🦫", pancakemole: "🥞", golem: "🗿", dragonfly: "🐉",
  triceratops: "🦕", chickenzombie: "🧟", raptor: "🦖", redfox: "🦊", meerkat: "🐿️",
  fennecfox: "🦊", kappa: "🐢", tarantulahawk: "🕷️", spriggan: "🍃", rooster: "🐓",
  baldeagle: "🦅", gorillachef: "🦍", raccoon: "🦝", ostrich: "🐦", discobee: "🐝",
  hotdog: "🌭", rainbowhotdog: "🌭", greenbean: "🫛", lemonlion: "🦁", iguanodon: "🦕",
  rainbowiguanodon: "🦕", applegazelle: "🦌", peachwasp: "🐝", squirrel: "🐿️", shibainu: "🐕",
  snail: "🐌", tanuki: "🦝", orangutan: "🦧", pachycephalo: "🦕", goldenlab: "🐕",
  dog: "🐕", flamingo: "🦩", bee: "🐝", ant: "🐜", toucan: "🦜",
  moth: "🦋", crab: "🦀", cockatrice: "🐓",
};

const DEFAULT_PLANT_EMOJI = "🌱";
const DEFAULT_PET_EMOJI = "🐾";

export function plantEmoji(id) {
  return PLANT_EMOJI[id] || DEFAULT_PLANT_EMOJI;
}

export function petEmoji(id) {
  return PET_EMOJI[id] || DEFAULT_PET_EMOJI;
}
