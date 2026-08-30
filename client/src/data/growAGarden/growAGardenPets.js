// Grow a Garden Calculator — pet ability reference data.
//
// Faithfully ported from the "Grow a Garden" community value-calculator's
// pet-ability formula set (the same formulas used across fan calculators
// for this Roblox game). Each pet's ability values are a function of its
// current weight, its rarity tier (normal/golden/rainbow via `state`),
// and any equipped toy boost — mirroring the reference site's own
// calculation exactly, just de-globalized (the reference reads
// `window.isGold`/`window.isRainbow`/`window.toyMinus`/`window.toyPlus`;
// here those are passed explicitly via `state` and closures instead of
// living on `window`, so multiple calculations never interfere and this
// stays a pure, testable module).
//
// `text` is a description template with DisplayBoxN placeholders that
// the UI layer replaces with each formula's computed value.

/**
 * @param {{ isGold: boolean, isRainbow: boolean, toyPct: number }} state
 * @returns {object} pet-id -> { name, variables, text, formulas: [{id, formula(weight)}] }
 */
export function createGrowAGardenPetsData(state) {
  const toyMinus = (base) => base * (1 - (state.toyPct || 0));
  const toyPlus = (base) => base * (1 + (state.toyPct || 0));

  return {
  lobster: {
    name: 'lobster',
    variables: 4,
    text: `Every DisplayBox1, DisplayBox2 chance a nearby plant becomes molten.
           Every DisplayBox3, DisplayBox4 chance a nearby plant becomes Meteoric.`,
    formulas: [
 { id: 'DisplayBox1', formula: (w) => {
  const base = state.isRainbow ? 720 : (state.isGold ? 810 : 900);
  return toyMinus(base) - (w * 4.5);
}},
{ id: 'DisplayBox2', formula: (w) => {
  const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
  return toyPlus(base) + (w * 0.10);
}},
{ id: 'DisplayBox3', formula: (w) => {
  const base = state.isRainbow ? 1440 : (state.isGold ? 1620 : 1800);
  return toyMinus(base) - (w * 9);
}},
{ id: 'DisplayBox4', formula: (w) => {
  const base = state.isRainbow ? 12 : (state.isGold ? 11 : 10);
  return toyPlus(base) + (w * 0.10);
}}
    ]
  },
  kiwi: {
    name: 'kiwi',
    variables: 2,
    text: `Every DisplayBox1, goes to the egg with the highest hatch time,
	and reduces its hatch time by DisplayBox2`,
    formulas: [
{ id: 'DisplayBox1', formula: (w) => {
  const base = state.isRainbow ? 48 : (state.isGold ? 54 : 60);
  return Math.max(5, toyMinus(base) - w);
}},
{ id: 'DisplayBox2', formula: (w) => {
	  const base=state.isRainbow ? 30 : (state.isGold ? 27.5 : 25);
      return toyPlus(base) + (w * 0.25); 
	  } }
    ]
  },
  bloodkiwi: {
    name: 'bloodkiwi',
    variables: 3,
    text: `Every DisplayBox1, goes to the egg with the highest hatch time,
	and reduces its hatch time by DisplayBox2.Increase egg hatchspeed by DisplayBox3 `,
    formulas: [
     { id: 'DisplayBox1', formula: (w) => {
    const base = state.isRainbow ? 48 : (state.isGold ? 54 : 60);
    return Math.max(10, toyMinus(base) - w);
  }},
  { id: 'DisplayBox2', formula: (w) => {
    const base = state.isRainbow ? 54 : (state.isGold ? 49.5 : 45);
    return toyPlus(base) + (w * 0.45);
  }},
  { id: 'DisplayBox3', formula: (w) => {
    const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
    return toyPlus(base) + (w * 0.22);
  }}
    ]
  },
   mimic: {
    name: 'mimic',
    variables: 1,
    text: `Every DisplayBox1, Mimics and copies an ability
from another pet and performs its ability.`,
    formulas: [
     { id: 'DisplayBox1', formula: (w) => {
    const base = state.isRainbow ? 969.6 : (state.isGold ? 1090.8 : 1212);
    return Math.max(15, toyMinus(base) - (w * 12));
  }}
    ]
  },
  capybara: {
    name: 'capybara',
    variables: 2,
    text: `All pets within DisplayBox1 studs , won't lose hunger and
will gain DisplayBox2 XP every second!.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
    const base = state.isRainbow ? 17.4 : (state.isGold ? 15.95 : 14.5);
    return Math.min(30, toyPlus(base) + (w * 0.25));
  }},
  { id: 'DisplayBox2', formula: (w) => {
    const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3.0);
    return toyPlus(base) + (w * 0.3);
  }}
    ]
  },
   sloth: {
    name: 'sloth',
    variables: 1,
    text: `Every DisplayBox1, goes to a nearby fruit and does-a-cooking!
	Applying Pasta,Sauce or Meatball mutation!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 672 : (state.isGold ? 756 : 840);
       return Math.max(15, toyMinus(base) - (w * 3.33)); }
	  }
    ]
  },
   dilo: {
    name: 'dilo',
    variables: 4,
    text: `Every DisplayBox1, Opens its frills and spits out venom!The venom spreads to DisplayBox2,
	other random pets, advancing cooldowns by DisplayBox3 OR granting DisplayBox4 XP!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 672 : (state.isGold ? 760.5 : 845);
       return Math.max(60, toyMinus(base) - (w * 8.38)); }  
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	   const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3);
       return Math.min(5, toyPlus(base) + (w * 0.20)); } 
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	 const base = state.isRainbow ? 48 : (state.isGold ? 44 : 40);
       return toyPlus(base) + (w * 0.25); }
	  },
	  { id: 'DisplayBox4', formula: (w) => {
	  const base = state.isRainbow ? 600 : (state.isGold ? 550: 500);
       return Math.min(2500, toyPlus(base) + (w * 40)); }
	  }
    ]
  },
  rainbowdilo: {
    name: 'rainbowdilo',
    variables: 4,
    text: `Every DisplayBox1, Opens its frills and spits out venom!The venom spreads to DisplayBox2,
	other random pets, advancing cooldowns by DisplayBox3 OR granting DisplayBox4 XP!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 513.6 : (state.isGold ? 577.8 : 642);
       return Math.max(60,toyMinus(base) - (w * 6.36)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3.0);
       return Math.min(12, toyPlus(base) + (w * 0.20)); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	  const base = state.isRainbow ? 96 : (state.isGold ? 88 : 80);
       return Math.min(180,toyPlus(base) + w); }
	  },
	  { id: 'DisplayBox4', formula: (w) => {
	   const base = state.isRainbow ? 1200 : (state.isGold ? 1100 : 1000);
       return Math.min(6000,toyPlus(base) + (w * 80)); }
	  }
    ]
  },
  peacock: {
    name: 'peacock',
    variables: 3,
    text: `Every DisplayBox1, Fans its feathers and all active pets within DisplayBox2 studs will advance 
	cooldowns for their abilities by DisplayBox3`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	    const base = state.isRainbow ? 484.8 : (state.isGold ? 545.4 : 606);
       return Math.max(15, toyMinus(base) - (w * 6)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return toyPlus(base) + (w * 0.2); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	 const base = state.isRainbow ? 78 : (state.isGold ? 71.5 : 65);
       return toyPlus(base) + (w * 0.6); }
	  },
    ]
  },
  mooncat: {
    name: 'mooncat',
    variables: 4,
    text: `Every DisplayBox1,naps for DisplayBox2 ,new fruit within DisplayBox2 will be
	DisplayBox3 Larger!.DisplayBox4 Chance Night Type fruit stays after harvest`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 55.28 : (state.isGold ? 62.19 : 69.1);
       return Math.max(5, toyMinus(base) - (w * 0.8)); }
	  },
	   { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 24.24 : (state.isGold ? 22.22 : 20.20);
       return  toyPlus(base) + (w * 0.15); }
	  },
	   { id: 'DisplayBox3', formula: (w) => {
	 const base = state.isRainbow ? 1.81 : (state.isGold ? 1.66 : 1.51);
       return toyPlus(base) + (w * 0.02); }
	  },
	   { id: 'DisplayBox4', formula: (w) => {
	  const base = state.isRainbow ? 7.56 : (state.isGold ? 6.93 : 6.3);
       return Math.min(25, toyPlus(base) + (w * 0.53)); }
	  },
    ]
  },
   seaturtle: {
    name: 'seaturtle',
    variables: 4,
    text: `Every DisplayBox1,Shares its wisdom with a random pet,granting DisplayBox2
	bonus experience!
	Every DisplayBox3,splashes water at a nearby fruit and it has a DisplayBox4 chance to become wet!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 576 : (state.isGold ? 648 : 720);
       return Math.max(20, toyMinus(base) - (w * 6.5)); }
	  },
	   { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 1188 : (state.isGold ? 1089 : 990);
       return  toyPlus(base) + (w * 14); }
	  },
	   { id: 'DisplayBox3', formula: (w) => {
	 const base = state.isRainbow ? 131.2 : (state.isGold ? 147.6 : 164);
       return Math.max(15,toyMinus(base) - (w * 3.00)); }
	  },
	   { id: 'DisplayBox4', formula: (w) => {
	  const base = state.isRainbow ? 14.4 : (state.isGold ? 13.2 : 12);
       return toyPlus(base) + (w * 0.2); }
	  },
    ]
  },
    frog: {
    name: 'frog',
    variables: 1,
    text: `Every DisplayBox1, Croaks and a random nearby plant will advance
	growth by 24h`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 483.2 : (state.isGold ? 543.6 : 604);
       return Math.max(15, toyMinus(base) - (w * 6)); }
	  }
    ]
  },
    brontosaurus: {
    name: 'brontosaurus',
    variables: 1,
    text: `Pets hatched from eggs have a DisplayBox1 incresae in base size
	and weight! This size bonus is capped at 30% per egg and does not
	apply to Brontosaurueses`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 6.3 : (state.isGold ? 5.775 : 5.25);
       return Math.min(30, toyPlus(base) +(w * 0.1)); }
	  }
    ]
  },
    queenbee: {
    name: 'queenbee',
    variables: 2,
    text: `Every DisplayBox1, a nearby fruit gets magically pollinated, applying Pollinated
	mutation! Every DisplayBox2, the pet with the highest cooldown refreshes its ability!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 976 : (state.isGold ? 1098 : 1220);
       return Math.max(60,  toyMinus(base) - (w * 15.95)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 1061.6 : (state.isGold ? 1194.3 : 1327);
       return Math.max(60, toyMinus(base)  -(w * 15.95)); }
	  }
    ]
  },
    starfish: {
    name: 'starfish',
    variables: 1,
    text: `Gain an additional DisplayBox1 XP Per second`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
       return Math.min(25, toyPlus(base) + (w * 0.5)); }  
	   }
    ]
  },
  spinosaurus: {
  name: 'spinosaurus',
  variables: 2,
  text: `Every DisplayBox1, devours a random mutation from DisplayBox2 fruits in your
  garden each,then roars,spreading those mutations to 1 random fruit in your garden!Prioritizes
  applying mutations to a favorited fruit.`,
  formulas: [
    {
      id: 'DisplayBox1', formula: (w) => {
       const base = state.isRainbow ? 978.43 : (state.isGold ? 1100.74 : 1223.04);
        return Math.max(60, toyMinus(base) - (w * 12));
      }
    },
    {
      id: 'DisplayBox2', formula: (w) => {
        const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3);
        return toyPlus(base) + (w * 0.2);
      }
    }
  ]
},
 echofrog: {
    name: 'echofrog',
    variables: 1,
    text: `Every DisplayBox1, Croaks and a random nearby plant will advance
	growth by 24h`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 241.6 : (state.isGold ? 271.8 : 302);
       return Math.max(15, toyMinus(base) - (w * 6)); }
	  }
    ]
  },
  ckitsune: {
  name: 'ckitsune',
  variables: 2,
  text: `Every DisplayBox1, Launches cursed energy at 9 different fruit,each fruit has a DisplayBox2
  chance to mutate with CorruptChakra with a very rare chance for Corrupt Foxfire Chakra instead`,
  formulas: [
    {
      id: 'DisplayBox1',
      formula: (w) => {
       const base = state.isRainbow ? 1008 : (state.isGold ? 1134 : 1260);
        return Math.max(180, toyMinus(base) - (w * 4.00));
      }
    },
    {
      id: 'DisplayBox2',
      formula: (w) => {
         const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
        return toyPlus(base) + (w * 0.2);
      }
    }
  ]
},
ferret: {
    name: 'ferret',
    variables: 1,
    text: `Every DisplayBox1, Increase a random pets level by 1! Ability cannot
	be mimicked or refreshed.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 2912 : (state.isGold ? 3276 : 3640);
       return Math.max(1200, toyMinus(base) - (w * 37.05)); }
	  }
    ]
  },
  goldengoose: {
    name: 'goldengoose',
    variables: 1,
    text: `Every DisplayBox1, Lays a Golden Egg plant that starts with the Fortune
	mutation. It can be harvested and mutates like other plants.Selling it may
	apply fortune mutation to a fruit in your garden.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 628 : (state.isGold ? 706.5 : 785);
       return Math.max(60, toyMinus(base) - (w * 1.415)); }
	  }
    ]
  },
   kitsune: {
    name: 'kitsune',
    variables: 1,
    text: `Every DisplayBox1, goes to another player's crop,mutates it with Chakra then 
	steals (duplicate) and gives it to you! Very rare chance to mutate with Foxfire Chakra mutation instead!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 1075.60 : (state.isGold ? 1210.059 : 1344.51);
       return Math.max(60, toyMinus(base) - (w * 6.1455)); }
	  }
    ]
  },
    seal: {
    name: 'seal',
    variables: 1,
    text: `When selling pets, has a DisplayBox1 chance to get the pet back as its egg equivalent`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	 const base = state.isRainbow ? 3 : (state.isGold ? 2.75 : 2.5);
       return Math.min(8, toyPlus(base) + (w * 0.22)); }
	  }
    ]
  },
    koi: {
    name: 'koi',
    variables: 1,
    text: `When hatching eggs, there is a DisplayBox1 chance to get the egg back. 
	Cannot recover Premium/Exotic Eggs`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3.0);
       return Math.min(8, toyPlus(base) + (w * 0.22)); }
	  }
    ]
  },
    wasp: {
    name: 'wasp',
    variables: 3,
    text: `Every DisplayBox1,flies to a nearby fruit and polinates it,applying
	Pollinated mutation,every DisplayBox2,stings a random pet and
	advances its ability cooldown by DisplayBox3`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 1440 : (state.isGold ? 1620 : 1800);
       return Math.max(60,toyMinus(base) - (w * 18)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	   const base = state.isRainbow ? 480 : (state.isGold ? 540 : 600);
       return Math.max(60, toyMinus(base) - (w * 6)); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
       const base = state.isRainbow ? 72 : (state.isGold ? 66 : 60);
       return toyPlus(base) + (w * 0.6); }
	  },
    ]
  },
   nightowl: {
    name: 'nightowl',
    variables: 1,
    text: `All active pets gain an additional DisplayBox1 XP per second`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 0.24 : (state.isGold ? 0.22 : 0.20);
       return toyPlus(base) + (w * 0.04); }
	  }
    ]
  },
   bloodowl: {
    name: 'bloodowl',
    variables: 1,
    text: `All active pets gain an additional DisplayBox1 XP per second`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 0.60 : (state.isGold ? 0.55 : 0.5);
       return toyPlus(base) + (w * 0.08); }
	  }
    ]
  },
  owl: {
    name: 'owl',
    variables: 1,
    text: `All active pets gain an additional DisplayBox1 XP per second`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 0.24 : (state.isGold ? 0.22 : 0.20);
       return toyPlus(base) + (w * 0.04); }
	  }
    ]
  },
  cookedowl: {
  name: 'cookedowl',
  variables: 2,
  text: `Every DisplayBox1, DisplayBox2 chance to cook a neraby fruit,Usually Burnt
  ,but ocassionally Cooked! All active pets gain an additional DisplayBox3 XP/s!Also very
  tasty!`,
  formulas: [
    {
      id: 'DisplayBox1', formula: (w) => {
        const base = state.isRainbow ? 644 : (state.isGold ? 724.5 : 805);
        return Math.max(15, toyMinus(base) - (w * 12.1));
      }
    },
    {
      id: 'DisplayBox2', formula: (w) => {
         const base = state.isRainbow ? 18 : (state.isGold ? 16.5 : 15);
        return toyPlus(base) + (w * 0.25);
      }
    },
	{
	id: 'DisplayBox3',   formula: (w) => {
          const base = state.isRainbow ? 0.168 : (state.isGold ? 0.154 : 1.14);
        return toyPlus(base) + (w * 0.0315); 
		
      }
    }
  ]
},
  orangetabby: {
    name: 'orangetabby',
    variables: 3,
    text: `Every DisplayBox1,naps for DisplayBox2 ,New fruit within
	DisplayBox2 studs will be DisplayBox3 larger!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 72 : (state.isGold ? 81 : 90);
       return Math.max(5, toyMinus(base) - w); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 18 : (state.isGold ? 16.5 : 15);
       return  toyPlus(base) + (w * 0.15); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	  const base = state.isRainbow ? 1.8 : (state.isGold ? 1.65 : 1.5);
       return toyPlus(base) + (w * 0.01); }
	  },
    ]
  },
  butterfly: {
    name: 'butterfly',
    variables: 1,
    text: `Every DisplayBox1 , flies to a nearby fruit with 5+ mutations,removes all mutations
	from it and truns it Rainbow! Ignores favorited fruit.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	 	  const base = state.isRainbow ? 1445.6 : (state.isGold ? 1626.3 : 1807);
       return Math.max(15 , toyMinus(base) - (w * 18)); }
	  }
    ]
  },
    trex: {
  name: 'trex',
  variables: 2,
  text: `Every DisplayBox1, devours a random mutation from your garden, then roars,
  spreading that mutation to DisplayBox2 other random fruits in your garden!`,
  formulas: [
    {
      id: 'DisplayBox1',
      formula: (w) => {
       const base = state.isRainbow ? 978.4 : (state.isGold ? 1100.7 : 1223);
        return Math.max(15, toyMinus(base) - (w * 12));
      }
    },
    {
      id: 'DisplayBox2',
      formula: (w) => {
         const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3.0);
        return toyPlus(base) + (w * 0.2);
      }
    }
  ]
},
  mole: {
    name: 'mole',
    variables: 1,
    text: `Every DisplayBox1s ,Digs down underground to find treasure. Can dig up gear or sheckles`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 64 : (state.isGold ? 72 : 80);
       return Math.max(10 , toyMinus(base) - w); }
	  }
    ]
  },
    pancakemole: {
    name: 'pancakemole',
    variables: 1,
    text: `Every DisplayBox1s ,Digs down underground to find treasure. Can dig up gear or sheckles`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 64 : (state.isGold ? 72 : 80);
       return Math.max(10 , toyMinus(base) - w); }
	  }
    ]
  },
    golem: {
    name: 'golem',
    variables: 2,
    text: `Every DisplayBox1 goes to the mutation machine and tinkers with it to advance its time by DisplayBox2 !`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 320 : (state.isGold ? 360 : 400);
       return Math.max(60, toyMinus(base) - w); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
     const base = state.isRainbow ? 48 : (state.isGold ? 44 : 40);
       return toyPlus(base) + (w*0.5); }
	  }
    ]
  },
      dragonfly: {
    name: 'dragonfly',
    variables: 1,
    text: `Every DisplayBox1 ,turns one random fruit gold!`,
    formulas: [
	  { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 240 : (state.isGold ? 270 : 300);
       return Math.max(15, toyMinus(base) - (w*3.03)); }
	  }
    ]
  },
  triceratops: {
    name: 'triceratops',
    variables: 1,
    text: `Every 3:33m ,rams into 3 random plants and advances their growth by 33:33m.
	Has a DisplayBox1 chance to do it again each time`,
    formulas: [
	  { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 18 : (state.isGold ? 16.5 : 15);
       return toyPlus(base) + (w*0.115); }
	  }
    ]
  },
      chickenzombie: {
    name: 'chickenzombie',
    variables: 3,
    text: `Every DisplayBox1 , DisplayBox2 chance a nearby fruit becomes Zombified!
	Increase egg hatch speed by DisplayBox3`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 1280 : (state.isGold ? 1440 : 1600);
       return Math.max(60,toyMinus(base) - (w * 18)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return  toyPlus(base) + (w * 0.2); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	 const base = state.isRainbow ? 12 : (state.isGold ? 11 : 10);
       return toyPlus(base) + (w * 0.1); }
	  },
    ]
  },
    raptor: {
    name: 'raptor',
    variables: 2,
    text: `DisplayBox1 chance fruit gets Amber mutation after collecting! Rarer plants
	have lesser chance to mutate.Grants additional DisplayBox2 increase to player movement speed!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	 const base = state.isRainbow ? 2.4 : (state.isGold ? 2.2 : 2);
       return toyPlus(base) + (w * 0.2); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 16.8 : (state.isGold ? 15.4 : 14);
       return toyPlus(base) + (w*0.25); }
	  }
    ]
  },
  redfox: {
    name: 'redfox',
    variables: 1,
    text: `Every DisplayBox1, Goes to another players random crop tries to get a seed from it and 
	gives it to you. If it succeeds it will try to steal again.Rarer seeds have less chance to succeed stealing!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 357.6 : (state.isGold ? 402.3 : 447);
       return Math.max(15, 445- (w * 5.2)); }
	  }
    ]
  },
  meerkat: {
    name: 'meerkat',
    variables: 3,
    text: `Every DisplayBox1 ,goes to another pet and does a lookout.That pet advances
	cooldown by DisplayBox2 ! Has a DisplayBox3% chance to do it again after each lookout.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
      const base = state.isRainbow ? 356 : (state.isGold ? 400.5 : 445);
       return Math.max(15, toyMinus(base) - (w * 4.45)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return  toyPlus(base) + (w * 0.5); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	  const base = state.isRainbow ? 18 : (state.isGold ? 16.5 : 15);
	   return toyPlus(base) + (w * 0.25); }
	  },
    ]
  },
   fennecfox: {
    name: 'fennecfox',
    variables: 1,
    text: `Every DisplayBox1, goes to another player's random fruit,has a chance to copy 1 random
	mutations and apply it to random fruit you own! The higher mutation multiplier the rarer
	the chance to copy.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 1080 : (state.isGold ? 1215 : 1350);
       return Math.max(15, toyMinus(base) - (w * 13)); }
	  }
    ]
  },
  kappa: {
    name: 'kappa',
    variables: 3,
    text: `Every DisplayBox1 ,sprays water on all fruits within DisplayBox2 studs applying Wet mutation.
	Has a DisplayBox3 chance to replace wet mutations already on fruit with bloodlit!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	    const base = state.isRainbow ? 411.2 : (state.isGold ? 462.6 : 514);
       return Math.max(15, toyMinus(base) - (w * 4)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return  toyPlus(base) + (w * 0.25); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	  const base = state.isRainbow ? 12 : (state.isGold ? 11 : 10);
	   return toyPlus(base) + (w * 0.1); }
	  },
    ]
  },
    tarantulahawk: {
    name: 'tarantulahawk',
    variables: 3,
    text: `Every DisplayBox1 , flies to a nearby fruit and pollinates it,applying Pollinated mutation!
	Every DisplayBox2 ,stings a random pet and advances its abiltiy cooldown by DisplayBox3`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 1208 : (state.isGold ? 1359 : 1510);
       return Math.max(60, toyMinus(base) - (w * 16)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	   const base = state.isRainbow ? 241.264 : (state.isGold ? 271.42 : 301.58);
       return  Math.max(60, toyMinus(base) - (w * 3.02)); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	  const base = state.isRainbow ? 96 : (state.isGold ? 88 : 80);
	   return toyPlus(base) + (w * 0.80); }
	  },
    ]
  },
    spriggan: {
    name: 'spriggan',
    variables: 3,
    text: `Every DisplayBox1,spreads its roots and all fruit within DisplayBox2 have a 
	DisplayBox3% to get the Bloom Mutation`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 1061.6 : (state.isGold ? 1194.3 : 1327);
       return Math.max(60, toyMinus(base) - (w * 5.25)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 36 : (state.isGold ? 33 : 30);
       return  toyPlus(base) + (w * 0.3); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	const base = state.isRainbow ? 18 : (state.isGold ? 16.5 : 15);
	   return toyPlus(base) + (w * 0.15); }
	  },
    ]
  },
     rooster: {
    name: 'rooster',
    variables: 1,
    text: `Increase egg hatch speed by DisplayBox1%`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	 const base = state.isRainbow ? 22 : (state.isGold ? 21 : 20);
       return toyPlus(base) + (w * 0.2); }
	  }
    ]
  },
       baldeagle: {
    name: 'baldeagle',
    variables: 1,
    text: `Every 7:04m, takes flight and spreads its wings. All eggs advanced their
	 hatch time by 70.4s! There's a 70.4% chance for the time advance to be multiplied by DisplayBox1`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	 const base = state.isRainbow ? 2.16 : (state.isGold ? 1.98 : 1.8);
       return toyPlus(base) + (w * 0.18); }
	  }
    ]
  },
         gorillachef: {
    name: 'gorillachef',
    variables: 1,
    text: `As long as you have a Cooking Pot or Cooking Cauldron in your garden: The Gorilla cooks in it 
	and grants DisplayBox1% to duplicate food on cook!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
       return toyPlus(base) + (w * 0.1); }
	  }
    ]
  },
      raccoon: {
    name: 'raccoon',
    variables: 1,
    text: `Every DisplayBox1,goes to another player's plot and steals(duplicate) a random crop 
	and gives it to you`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 732.2 : (state.isGold ? 813.6 : 904);
       return toyMinus(base) - (w * 4); }
	  }
    ]
  },
      ostrich: {
    name: 'ostrich',
    variables: 1,
    text: `Pets hatched from eggs ahve a bonus 1 - DisplayBox1 age to their age value!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 5.94 : (state.isGold ? 5.445 : 4.95);
       return Math.min(10 , toyPlus(base) + (w * 0.458)); }
	  }
    ]
  },
     discobee: {
    name: 'discobee',
    variables: 2,
    text: `Every DisplayBox1, DisplayBox2 chance a nearby fruit becomes Disco!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 724 : (state.isGold ? 815.4 : 906);
       return Math.max(15 , toyMinus(base) - (w * 12)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	    const base = state.isRainbow ? 16.8 : (state.isGold ? 15.4 : 14);
       return Math.min(100 ,toyPlus(base) +w ) ; }
	  }
    ]
  },
       hotdog: {
    name: 'hotdog',
    variables: 5,
    text: `Every DisplayBox1, drops a DisplayBox2 stud mustard or ketchup puddle that lasts 
	DisplayBox3 seconds. Pets on mustard have their cooldowns tick by DisplayBox4 faster and 
	pets on ketchup gain DisplayBox5 more experience!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 192 : (state.isGold ? 216 : 240);
       return Math.max(10 , toyMinus(base) - (w * 1.5)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 9.6 : (state.isGold ? 8.8 : 8);
       return toyPlus(base) + (w * 0.08) ; }
	  },
	   { id: 'DisplayBox3', formula: (w) => {
  const base = state.isRainbow ? 36 : (state.isGold ? 33 : 30);
       return toyPlus(base) + ( w * 0.15); }
	  },
	   { id: 'DisplayBox4', formula: (w) => {
	  const base = state.isRainbow ? 0.072 : (state.isGold ? 0.066 : 0.06);
       return Math.min(0.5 , toyPlus(base) + (w * 0.05)) ; }
	  },
	   { id: 'DisplayBox5', formula: (w) => {
	 const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return toyPlus(base) +w; }
	  },	 
    ]
  },
   rainbowhotdog: {
    name: 'rainbowhotdog',
    variables: 5,
    text: `Every DisplayBox1, drops a DisplayBox2 stud mustard or ketchup puddle that lasts 
	DisplayBox3 seconds. Pets on mustard have their cooldowns tick by DisplayBox4 faster and 
	pets on ketchup gain DisplayBox5 more experience!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 160 : (state.isGold ? 180 : 200);
       return Math.max(10 , toyMinus(base) - (w * 1.5)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 18.4 : (state.isGold ? 17.6 : 16);
       return toyPlus(base) + (w * 0.08) ; }
	  },
	   { id: 'DisplayBox3', formula: (w) => {
  const base = state.isRainbow ? 54 : (state.isGold ? 49.5 : 45);
       return toyPlus(base) + ( w * 0.15); }
	  },
	   { id: 'DisplayBox4', formula: (w) => {
	  const base = state.isRainbow ? 0.108 : (state.isGold ? 0.099 : 0.09);
       return Math.min(0.75 , toyPlus(base) + (w * 0.075)) ; }
	  },
	   { id: 'DisplayBox5', formula: (w) => {
	 const base = state.isRainbow ? 36 : (state.isGold ? 33 : 30);
       return toyPlus(base) +w; }
	  },	 
    ]
  },
      greenbean: {
    name: 'greenbean',
    variables: 2,
    text: `Every DisplayBox1m,sacrifices a random Beanstalk fruit in your garden to
	instantly grow a random plant withDisplayBox2x Fruit size bonus!Ability cannot be mimicked or refreshed.`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	 const base = state.isRainbow ? 1439.2 : (state.isGold ? 1619.1 : 1799);
       return Math.max(600, toyMinus(base) - (w * 9)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	const base = state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
       return toyPlus(base) + (w*0.1); }
	  }
    ]
  },
   lemonlion: {
    name: 'lemonlion',
    variables: 2,
    text: `Every 5:00m,Roars whilst applying the Brainrot mutation to a random fruit!
Every DisplayBox1,roars and infuse a random pet with citrus,granting DisplayBox2 bonus experience!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	 const base = state.isRainbow ? 480 : (state.isGold ? 540 : 600);
       return Math.max(60, toyMinus(base) - (w * 2.5)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 1800 : (state.isGold ? 1650 : 1500);
       return toyPlus(base) + (w*15); }
	  }
    ]
  },
      iguanodon: {
    name: 'iguanodon',
    variables: 1,
    text: `All active dinosaur type pets gain an additional DisplayBox1 XP per second!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 0.66 : (state.isGold ? 0.63 : 0.06);
       return toyPlus(base) + (w * 0.06); }
	  }
    ]
  },
      rainbowiguanodon: {
    name: 'rainbowiguanodon',
    variables: 1,
    text: `All active dinosaur type pets gain an additional DisplayBox1 XP per second!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 1.44 : (state.isGold ? 1.32 : 1.2);
       return toyPlus(base) + (w * 0.12); }
	  }
    ]
  },
     applegazelle: {
    name: 'applegazelle',
    variables: 2,
    text: `Fruits that have Apple in the name have a DisplayBox1% chance to duplicate when collected.Harvesting sugar apple crops have a
DisplayBox2% chance to apply warped mutation to a random fruit in your garden!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 4.8 : (state.isGold ? 4.4 : 4);
      if (state.isGold) return  4.4 + ( w * 0.025);
       return toyPlus(base) + (w * 0.025); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 2.4 : (state.isGold ? 2.2 : 2);
       return toyPlus(base) + (w * 0.05); }
	  }
    ]
  },
  peachwasp: {
    name: 'peachwasp',
    variables: 3,
    text: `Every DisplayBox1m, flies to a nearby fruit and Plasmafies it,applying Plasma mutation!
Every DisplayBox2m, stings a random pet and advances its ability cooldown by DisplayBox3s!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 1200 : (state.isGold ? 1350 : 1500);
       return Math.max(60, toyMinus(base) - (w * 6.5)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	const base = state.isRainbow ? 480 : (state.isGold ? 540 : 600);
       return  Math.max(15 ,toyMinus(base) - (w * 3.5)); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	const base = state.isRainbow ? 72 : (state.isGold ? 66 : 60);
	   return toyPlus(base) + (w * 0.6); }
	  },
    ]
  },
   squirrel: {
    name: 'squirrel',
    variables: 2,
    text: `DisplayBox1% chance to not consume a use when using the reclaimer!Gains an additional
	DisplayBox2 xp per second!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 12 : (state.isGold ? 11 : 10);
       return toyPlus(base) + (w * 0.3); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3);
       return toyPlus(base) + (w * 0.3); }
	  }
    ]
  },
    shibainu: {
    name: 'shibainu',
    variables: 2,
    text: `Every DisplayBox1s , DisplayBox2 % chance to dig up a random seed!`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	 	const base = state.isRainbow ? 48 : (state.isGold ? 54 : 60);
       return Math.max(5, (toyMinus(base) - w)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 18 : (state.isGold ? 16.5 : 15);
       return Math.min(100, toyPlus(base) + (w * 0.05)); }
	  }
    ]
  },
      snail: {
    name: 'snail',
    variables: 1,
    text: `DisplayBox1 extra chance harvested plants drop seeds.Rarer plants have lower chance to duplicate.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
    const base = state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
       return toyPlus(base) + (w * 0.05); }
	  }
    ]
  },
        tanuki: {
    name: 'tanuki',
    variables: 1,
    text: `Every DisplayBox1m,causes mischief,doing random different actions in your garden!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
      const base = state.isRainbow ? 512 : (state.isGold ? 576 : 640);
       return Math.max(15, toyMinus(base) - (w * 3.63)); }
	  }
    ]
  },
      orangutan: {
    name: 'orangutan',
    variables: 1,
    text: `When crafting,each material used in the recipe has a DisplayBox1% chance to not get consumed!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 3.6 : (state.isGold ? 3.3 : 3);
       return Math.min(7, toyPlus(base) + (w * 0.33)); }
	  }
    ]
   },
	 pachycephalo: {
    name: 'pachycephalo',
    variables: 1,
    text: `Grants a DisplayBox1% chance to duplicate a crafted item!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 7.2 : (state.isGold ? 6.6 : 6);
       return Math.min(25, toyPlus(base) + (w * 0.3)); }
	  }
    ]
  },
     goldenlab: {
    name: 'goldenlab',
    variables: 2,
    text: `Every DisplayBox1, DisplayBox2% chance to dig up a random Seed shop seed`,
    formulas: [
        { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 48 : (state.isGold ? 54 : 60);   
       return Math.max(5, toyMinus(base) - w); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	  const base = state.isRainbow ? 12 : (state.isGold ? 11 : 10);
       return toyPlus(base) + (w*0.1); }
	  }
    ]
  },
   dog: {
    name: 'dog',
    variables: 2,
    text: `Every DisplayBox1s, DisplayBox2% chance to dig up a random seed!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 48 : (state.isGold ? 54 : 60);
       return Math.max(5,  toyMinus(base) - w); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
       const base = state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
       return toyPlus(base) + (w * 0.05); }
	  }
    ]
  },
  flamingo: {
  name: 'flamingo',
  variables: 4,
  text: `Every DisplayBox1m,stands on one leg for DisplayBox2s.All plants and fruits within DisplayBox3 studs 
  will grow DisplayBox4x faster!`,
  formulas: [
    { id: 'DisplayBox1', formula: (w) => {
        const base = state.isRainbow ? 192 : (state.isGold ? 216 : 240);  
        return Math.max(10, toyMinus(base) - (w * 2)); 
      }
    },
    { id: 'DisplayBox2', formula: (w) => {
        const base = state.isRainbow ? 18 : (state.isGold ? 16.5 :15);  
        return toyPlus(base) + (w * 0.5); 
      }
    },
    { id: 'DisplayBox3', formula: (w) => {
        const base = state.isRainbow ? 15.6 : (state.isGold ? 14.3 :13); 
        return base + (w * 0.3);
      }
    },
    { id: 'DisplayBox4', formula: (w) => {
        const base = state.isRainbow ? 18 : (state.isGold ? 16.5 :15); 
        return base + (w * 0.25); 
      }
    }
   ]
  },
   bee: {
    name: 'bee',
    variables: 1,
    text: `Every DisplayBox1m,flies to a nearby fruit and pollinates it,applying Pollinated mutation!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	   const base = state.isRainbow ? 1208 : (state.isGold ? 1359 : 1510);
       return Math.max(60, toyMinus(base) - (w * 16.66)); }
	  }
    ]
  },
  ant: {
  name: 'ant',
  variables: 2,
  text: `DisplayBox1% chance harvested fruit duplicate! Rarer crops have lower chance to duplicate.
  DisplayBox2% extra chance for Candy type fruit to duplicate!`,
  formulas: [
    { id: 'DisplayBox1', formula: (w) => {
        const base = state.isRainbow ? 12 : (state.isGold ? 11 : 10);
        return toyMinus(base) + (w * 0.10);
      }
    },
    { id: 'DisplayBox2', formula: (w) => {
        const base =state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
        return toyPlus(base) + (w * 0.15);
      }
    }
  ]
},
toucan: {
  name: 'toucan',
  variables: 4,
  text: `Grants all tropical plants within DisplayBox1 studs,a DisplayBox2x size bonus!
  Grants all tropical plants within Displaybox3 studs,a DisplayBox4x variant chance bonus!`,
  formulas: [
    { id: 'DisplayBox1', formula: (w) => {
	 const base =state.isRainbow ? 30 : (state.isGold ? 27.5 : 25);
	return toyPlus(base) + (w * 0.25); 
	}},
    { id: 'DisplayBox2', formula: (w) => {
	 const base =state.isRainbow ? 1.452 : (state.isGold ? 1.331 : 1.21);
	return toyPlus(base) + (w * 0.04);
	}},
    { id: 'DisplayBox3', formula: (w) => {
	const base =state.isRainbow ? 30 : (state.isGold ? 27.5 : 25);
	return toyPlus(base) + (w * 0.25); 
	}},
    { id: 'DisplayBox4', formula: (w) => {
	const base =state.isRainbow ? 1.392 : (state.isGold ? 1.276 : 1.16);
	return toyPlus(base) + (w * 0.1); 
	}}
  ]
},
   moth: {
    name: 'moth',
    variables: 1,
    text: `Every DisplayBox1m ,Sings to a random pet and restores its hunger by 100%!`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 609.6 : (state.isGold ? 685.8 : 762);
       return Math.max(15 , toyMinus(base) - (w * 7)); }
	  }
    ]
 },
  crab: {
    name: 'crab',
    variables: 3,
    text: `Every DisplayBox1m goes to anotehr random player and pinches them for their moner and grants you
	DisplayBox2 - DisplayBox3 sheckles. Pinched player does not lose sheckles.`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	const base = state.isRainbow ? 301.6 : (state.isGold ? 339.3 : 377);
       return Math.max(15, toyMinus(base) - (w * 4)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	const base = state.isRainbow ? 270 : (state.isGold ? 247.5 : 225);
       return  toyPlus(base) + (w * 25); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	const base = state.isRainbow ? 510 : (state.isGold ? 467.5 : 425);
	   return toyPlus(base) + (w * 25); }
	  },
    ]
  },
  
  cockatrice: {
    name: 'cockatrice',
    variables: 8,
    text: `Every DisplayBox1m,screeches and all fruits within DisplayBox2 studs have a DisplayBox3%
	chance to turn Silver; DisplayBox4% chance to turn gold!
	Every DisplayBox5m spits at DisplayBox6 different fruits/eggs/plants/pets.
	Fruits get Toxic mutation,eggs advance by DisplayBox7 seconds,pets gain DisplayBox8 XP`,
    formulas: [
      { id: 'DisplayBox1', formula: (w) => {
	  const base = state.isRainbow ? 800 : (state.isGold ? 900 : 1000);
       return Math.max(60,toyMinus(base) - (w * 5)); }
	  },
	  { id: 'DisplayBox2', formula: (w) => {
	 const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return toyPlus(base) + (w * 0.25); }
	  },
	  { id: 'DisplayBox3', formula: (w) => {
	  const base = state.isRainbow ? 24 : (state.isGold ? 22 : 20);
       return toyPlus(base) + (w * 0.05); }
	  },
	  { id: 'DisplayBox4', formula: (w) => {
	   const base = state.isRainbow ? 1.2 : (state.isGold ? 1.1 : 1);
       return toyPlus(base) + (w * 0.01); }
	  },
	   { id: 'DisplayBox5', formula: (w) => {
	  const base = state.isRainbow ? 750 : (state.isGold ? 687.5 : 625);
       return Math.max(60,toyMinus(base) - (w * 3.5)); }
	  },
	  { id: 'DisplayBox6', formula: (w) => {
	 const base = state.isRainbow ? 6 : (state.isGold ? 5.5 : 5);
       return toyPlus(base) + (w * 0.1); }
	  },
	  { id: 'DisplayBox7', formula: (w) => {
	  const base = state.isRainbow ? 96 : (state.isGold ? 88 : 80);
       return toyPlus(base) + (w * 0.5); }
	  },
	  { id: 'DisplayBox8', formula: (w) => {
	   const base = state.isRainbow ? 960 : (state.isGold ? 880 : 800);
       return toyPlus(base) + (w * 2.5); }
	  }
    ]
  },
 };
}

export const GROW_A_GARDEN_PET_IDS = Object.keys(createGrowAGardenPetsData({ isGold: false, isRainbow: false, toyPct: 0 }));
