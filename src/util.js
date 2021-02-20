class Util {

  // Takes a syllabification and turns it into a string of phonemes,
  // delimited with dashes, with spaces between syllables
  static syllablesToPhones(syllables) {

    let i, j, ret = [];
    for (i = 0; i < syllables.length; i++) {

      let syl = syllables[i],
        stress = syl[0][0],
        onset = syl[1],
        nucleus = syl[2],
        coda = syl[3];

      if (stress && nucleus.length) nucleus[0] += stress;

      let data = [];
      for (j = 0; j < onset.length; j++) data.push(onset[j]);
      for (j = 0; j < nucleus.length; j++) data.push(nucleus[j]);
      for (j = 0; j < coda.length; j++) data.push(coda[j]);
      ret.push(data.join('-'));
    }

    return ret.join(' ');
  }

  static syllablesFromPhones(input) { // adapted from FreeTTS

    if (!input || !input.length) return '';

    let dbug, internuclei = [];
    let syllables = []; // returned data structure
    let sylls = typeof input == 'string' ? input.split('-') : input;

    for (let i = 0; i < sylls.length; i++) {

      let phoneme = sylls[i].trim(), stress;
      if (!phoneme.length) continue;

      let last = phoneme.charAt(phoneme.length - 1);
      if (this.isNum(last)) {
        stress = last;
        phoneme = phoneme.substring(0, phoneme.length - 1);
      }

      if (dbug) log(i + ")" + phoneme + ' stress=' + stress + ' inter=' + internuclei.join(':'));

      if (Util.Phones.vowels.includes(phoneme)) {

        // Split the consonants seen since the last nucleus into coda and onset.
        let coda, onset;

        // Make the largest onset we can. The 'split' variable marks the break point.
        for (let split = 0; split < internuclei.length + 1; split++) {

          coda = internuclei.slice(0, split);
          onset = internuclei.slice(split, internuclei.length);

          if (dbug) log('  ' + split + ') onset=' + onset.join(':') +
            '  coda=' + coda.join(':') + '  inter=' + internuclei.join(':'));

          // If we are looking at a valid onset, or if we're at the start of the word
          // (in which case an invalid onset is better than a coda that doesn't follow
          // a nucleus), or if we've gone through all of the onsets and we didn't find
          // any that are valid, then split the nonvowels we've seen at this location.
          let bool = Util.Phones.onsets.includes(onset.join(" "));
          if (bool || syllables.length === 0 || onset.length === 0) {
            if (dbug) log('  break ' + phoneme);
            break;
          }
        }

        // Tack the coda onto the coda of the last syllable.
        // Can't do it if this is the first syllable.
        if (syllables.length > 0) {
          extend(syllables[syllables.length - 1][3], coda);
          if (dbug) log('  tack: ' + coda + ' -> len=' +
            syllables[syllables.length - 1][3].length + " [" +
            syllables[syllables.length - 1][3] + "]");
        }

        // Make a new syllable out of the onset and nucleus.
        let toPush = [[stress], onset, [phoneme], []];
        syllables.push(toPush);

        // At this point we've processed the internuclei list.
        internuclei = [];
      } else if (!(Util.Phones.consonants.includes(phoneme)) && phoneme != ' ') {
        throw Error('Invalid phoneme: ' + phoneme);
      } else { // a consonant
        internuclei.push(phoneme);
      }
    }

    // Done looping through phonemes. We may have consonants left at the end.
    // We may have even not found a nucleus.
    if (internuclei.length > 0) {
      if (syllables.length === 0) {
        syllables.push([[undefined], internuclei, [], []]);
      } else {
        extend(syllables[syllables.length - 1][3], internuclei);
      }
    }
    return Util.syllablesToPhones(syllables);
  }

  static isNode() {
    return (typeof module != 'undefined' && module.exports);
  }

  static isNum(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}


function extend(l1, l2) {
  for (let i = 0; i < l2.length; i++) l1.push(l2[i]);
}

// CLASSES ////////////////////////////////////////////////////////////////////

class RE {

  constructor(regex, offset, suffix) {
    this.raw = regex;
    this.regex = new RegExp(regex);
    this.offset = offset;
    this.suffix = suffix || '';
  }

  applies(word) {
    return this.regex.test(word);
  }

  fire(word) {
    return this.truncate(word) + this.suffix;
  }

  truncate(word) {
    return (this.offset === 0) ? word :
      word.substr(0, word.length - this.offset);
  }

  toString() {
    return '/' + this.raw + '/';
  }
}


Util.Phones = {
  consonants: ['b', 'ch', 'd', 'dh', 'f', 'g', 'hh', 'jh', 'k', 'l', 'm',
    'n', 'ng', 'p', 'r', 's', 'sh', 't', 'th', 'v', 'w', 'y', 'z', 'zh'
  ],
  vowels: ['aa', 'ae', 'ah', 'ao', 'aw', 'ax', 'ay', 'eh', 'er', 'ey', 'ih',
    'iy', 'ow', 'oy', 'uh', 'uw'
  ],
  onsets: ['p', 't', 'k', 'b', 'd', 'g', 'f', 'v', 'th', 'dh', 's', 'z',
    'sh', 'ch', 'jh', 'm', 'n', 'r', 'l', 'hh', 'w', 'y', 'p r', 't r',
    'k r', 'b r', 'd r', 'g r', 'f r', 'th r', 'sh r', 'p l', 'k l', 'b l',
    'g l', 'f l', 's l', 't w', 'k w', 'd w', 's w', 's p', 's t', 's k',
    's f', 's m', 's n', 'g w', 'sh w', 's p r', 's p l', 's t r', 's k r',
    's k w', 's k l', 'th w', 'zh', 'p y', 'k y', 'b y', 'f y', 'hh y',
    'v y', 'th y', 'm y', 's p y', 's k y', 'g y', 'hh w', ''
  ],
  digits: ['z-ih-r-ow', 'w-ah-n', 't-uw', 'th-r-iy', 'f-ao-r', 'f-ay-v',
    's-ih-k-s', 's-eh1-v-ax-n', 'ey-t', 'n-ih-n'
  ]
};

Util.RE = function (a, b, c) { return new RE(a, b, c) };

Util.MASS_NOUNS = ['abalone', 'asbestos', 'barracks', 'bathos', 'breeches', 'beef', 'britches', 'chaos', 'cognoscenti', 'clippers', 'corps', 'cosmos', 'crossroads', 'diabetes', 'ethos', 'gallows', 'graffiti', 'herpes', 'innings', 'lens', 'means', 'measles', 'mews', 'mumps', 'news', 'pathos', 'pincers', 'pliers', 'proceedings', 'rabies', 'rhinoceros', 'sassafras', 'scissors', 'series', 'shears', 'species', 'tuna', 'acoustics', 'aesthetics', 'aquatics', 'basics', 'ceramics', 'classics', 'cosmetics', 'dialectics', 'deer', 'dynamics', 'ethics', 'harmonics', 'heroics', 'mechanics', 'metrics', 'ooze', 'optics', 'physics', 'polemics', 'pyrotechnics', 'statistics', 'tactics', 'tropics', 'bengalese', 'bengali', 'bonsai', 'booze', 'cellulose', 'mess', 'moose', 'burmese', 'chinese', 'colossus', 'congolese', 'discus', 'electrolysis', 'emphasis', 'expertise', 'flu', 'fructose', 'gauze', 'glucose', 'grease', 'guyanese', 'haze', 'incense', 'japanese', 'lebanese',  'malaise', 'mayonnaise', 'maltese', 'music', 'money', 'menopause', 'merchandise', 'olympics', 'overuse', 'paradise', 'poise', 'potash', 'portuguese', 'prose', 'recompense', 'remorse', 'repose', 'senegalese', 'siamese', 'singhalese', 'innings', 'sleaze', 'sioux', 'sudanese', 'suspense', 'swiss', 'taiwanese', 'vietnamese', 'unease', 'aircraft', 'anise', 'antifreeze', 'applause', 'archdiocese', 'apparatus', 'asparagus', 'barracks', 'bellows', 'bison', 'bluefish', 'bourgeois', 'bream', 'brill', 'butterfingers', 'cargo', 'carp', 'catfish', 'chassis', 'clone', 'clones', 'clothes', 'chub', 'cod', 'codfish', 'coley', 'contretemps', 'corps', 'crawfish', 'crayfish', 'crossroads', 'cuttlefish', 'deer', 'dice', 'dogfish', 'doings', 'dory', 'downstairs', 'eldest', 'earnings', 'economics', 'electronics', 'firstborn', 'fish', 'flatfish', 'flounder', 'fowl', 'fry', 'fries', 'works', 'goldfish', 'golf', 'grand', 'grief', 'haddock', 'hake', 'halibut', 'headquarters', 'herring', 'hertz', 'horsepower', 'goods', 'hovercraft', 'ironworks', 'kilohertz', 'ling', 'shrimp', 'swine', 'lungfish', 'mackerel', 'macaroni', 'means', 'megahertz', 'moorfowl', 'moorgame', 'mullet', 'nepalese', 'offspring', 'pants', 'patois', 'pekinese', 'perch', 'pickerel', 'pike', 'potpourri', 'precis', 'quid', 'rand', 'rendezvous', 'roach', 'salmon', 'samurai', 'series', 'seychelles', 'shad', 'sheep', 'shellfish', 'smelt', 'spaghetti', 'spacecraft', 'species', 'starfish', 'stockfish', 'sunfish', 'superficies', 'sweepstakes', 'smallpox', 'swordfish', 'tennis', 'tobacco', 'triceps', 'trout', 'tuna', 'tunafish', 'turbot', 'trousers', 'turf', 'dibs', 'undersigned', 'waterfowl', 'waterworks', 'waxworks', 'wildfowl', 'woodworm', 'yen', 'aries', 'pisces', 'forceps', 'jeans', 'mathematics', 'news', 'odds', 'politics', 'remains', 'goods', 'aids', 'wildlife', 'shall', 'would', 'may', 'might', 'ought', 'should', 'wildlife', 'acne', 'admiration', 'advice', 'air', 'anger', 'anticipation', 'assistance', 'awareness', 'bacon', 'baggage', 'blood', 'bravery', 'chess', 'clay', 'clothing', 'coal', 'compliance', 'comprehension', 'confusion', 'consciousness', 'cream', 'darkness', 'diligence', 'dust', 'education', 'electrolysis', 'empathy', 'enthusiasm', 'envy', 'equality', 'equipment', 'evidence', 'feedback', 'fitness', 'flattery', 'foliage', 'fun', 'furniture', 'garbage', 'gold', 'gossip', 'grammar', 'gratitude', 'gravel', 'guilt', 'happiness', 'hardware', 'hate', 'hay', 'health', 'heat', 'help', 'hesitation', 'homework', 'honesty', 'honor', 'honour', 'hospitality', 'hostility', 'humanity', 'humility', 'ice', 'immortality', 'independence', 'information', 'integrity', 'intimidation', 'jargon', 'jealousy', 'jewelry', 'justice', 'knowledge', 'literacy', 'logic', 'luck', 'lumber', 'luggage', 'mail', 'management', 'merchandise', 'milk', 'morale', 'mud', 'music', 'nonsense', 'oppression', 'optimism', 'oxygen', 'participation', 'pay', 'peace', 'perseverance', 'pessimism', 'pneumonia', 'poetry', 'police', 'pride', 'privacy', 'propaganda', 'public', 'punctuation', 'recovery', 'rice', 'rust', 'satisfaction', 'shame', 'sheep', 'slang', 'software', 'spaghetti', 'stamina', 'starvation', 'steam', 'steel', 'stuff', 'support', 'sweat', 'thunder', 'timber', 'toil', 'traffic', 'training', 'trash', 'valor', 'vehemence', 'violence', 'warmth', 'waste', 'weather', 'wheat', 'wisdom', 'work'];

export default Util;
