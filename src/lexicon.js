const Util = require("./util");

let RiTa;

class Lexicon {

  constructor(parent, dict) {
    RiTa = parent;
    this.data = dict;
    this.lexWarned = false;
  }

  alliterations(word, opts = {}) {

    this.parseArgs(opts);

    // only allow consonant inputs ?
    if (RiTa.VOWELS.includes(word.charAt(0))) {
      if (!RiTa.SILENT) console.warn
      if (!opts.silent && !RiTa.SILENT) console.warn
        ('Expects a word starting with a consonant, got: ' + word);
      return [];
    }

    const dict = this._dict(true);
    const words = Object.keys(dict);
    const fss = this._firstStressedSyl(word);
    if (!fss) return [];

    let result = [], phone = this._firstPhone(fss);

    // make sure we parsed first phoneme
    if (!phone) {
      if (!opts.silent && !RiTa.SILENT) console.warn
        ('Failed parsing first phone in "' + word + '"');
      return result;
    }

    for (let i = 0; i < words.length; i++) {
      if (!this.checkCriteria(words[i], dict[words[i]], opts)) continue;
      let c2 = this._firstPhone(this._firstStressedSyl(words[i]));
      if (phone === c2) result.push(words[i]);
      if (result.length === opts.limit) break;
    }
    return result;
  }

  rhymes(word, opts = {}) {

    this.parseArgs(opts);

    if (!word || !word.length) return [];
    word = word.toLowerCase();

    const dict = this._dict(true);
    const words = Object.keys(dict);
    const phone = this._lastStressedPhoneToEnd(word);
    if (!phone) return [];

    let result = [];
    for (let i = 0; i < words.length; i++) {

      // check word length and syllables 
      if (!this.checkCriteria(words[i], dict[words[i]], opts)) continue;

      // check for rhyme
      if (dict[words[i]][0].endsWith(phone)) result.push(words[i]);

      if (result.length === opts.limit) break;
    }

    return result;
  }

  randomWord(opts = {}) {

    opts.minLength = opts.minLength || 4; // not 3
    this.parseArgs(opts);

    const dict = this._dict(true);
    let words = Object.keys(dict);
    const ran = Math.floor(RiTa.randInt(words.length));
    const isMassNoun = (w, pos) => {
      return w.endsWith("ness")
        || w.endsWith("ism")
        || pos.indexOf("vbg") > 0
        || Util.MASS_NOUNS.includes(w);
    }

    // testing
    //words = { "strive":["s-t-r-ay1-v","vb vbp"] };

    for (let k = 0; k < words.length; k++) {
      let j = (ran + k) % words.length;
      let word = words[j], rdata = dict[word];

      if (!this.checkCriteria(word, rdata, opts)) continue;
      if (!opts.targetPos) return words[j]; // done if no pos to match

      // match the pos if supplied
      let firstPos = rdata[1].split(' ')[0];
      if (opts.targetPos !== firstPos) continue;

      // we've matched our pos, pluralize or inflect if needed
      let result = word;
      if (opts.pluralize) {
        if (isMassNoun(word, rdata[1])) continue;
        result = RiTa.pluralize(word);
      }
      if (opts.conjugate) { // inflect
        result = this.reconjugate(word, opts.pos);
      }

      // berify we haven't changed syllable count
      if (result !== word && opts.numSyllables) { 
        let tmp = RiTa.SILENCE_LTS;
        RiTa.SILENCE_LTS = true;
        let num = RiTa.syllables(result).split(RiTa.SYLLABLE_BOUNDARY).length;
        RiTa.SILENCE_LTS = tmp;
        // reject if syllable count has changed
        if (num !== opts.numSyllables) continue;
      }

      return result;
    }

    throw Error('No random word with specified options: ' + JSON.stringify(opts));
  }

  /*
  TODO:    minDistance: disregard words with distance less than this num
  */
  spellsLike(word, opts = {}) {
    if (!word || !word.length) return [];
    opts.type = 'letter';
    return this.similarByType(word, opts);
  }

  /*
  TODO:    minDistance: disregard words with distance less than this num
          matchSpelling:
  */
  soundsLike(word, opts = {}) {
    if (!word || !word.length) return [];
    opts.type = "sound";
    return (opts.matchSpelling) ?
      this.similarBySoundAndLetter(word, opts)
      : this.similarByType(word, opts);
  }

  hasWord(word, fatal) {
    if (!word || !word.length) return false;
    return this._dict(fatal).hasOwnProperty(word.toLowerCase());
  }

  search(regex, opts = {}) {
    let dict = this._dict(true);
    let words = Object.keys(dict);
    if (typeof regex === 'undefined') return words;
    if (typeof regex === 'string') {
      // if we have a stress string without slashes, add them
      if (opts.type === 'stresses' && /^[01]+$/.test(regex)) {
        regex = regex.split('').join('/');
      }
      regex = new RegExp(regex);
    }
    this.parseArgs(opts);
    let func, result = [];
    if (opts.type === 'stresses') func = RiTa.stresses;
    else if (opts.type === 'phones') func = RiTa.phones;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!this.checkCriteria(word, dict[word], opts)) continue;
      if (typeof func !== 'undefined') {
        if (regex.test(func(words[i]))) result.push(words[i]);
      }
      else {
        if (regex.test(words[i])) result.push(words[i]);
      }
      if (result.length === opts.limit) break;
    }
    return result;
  }

  isAlliteration(word1, word2) {
    this._dict(true); // throw if no lexicon

    if (!word1 || !word2 || !word1.length || !word2.length) {
      return false;
    }

    let c1 = this._firstPhone(this._firstStressedSyl(word1)),
      c2 = this._firstPhone(this._firstStressedSyl(word2));

    if (!c1 || !c2 || this._isVowel(c1.charAt(0)) || this._isVowel(c2.charAt(0))) {
      return false;
    }

    return c1 === c2;
  }

  isRhyme(word1, word2) {

    if (!word1 || !word2 || word1.toUpperCase() === word2.toUpperCase()) {
      return false;
    }
    this._dict(true); // throw if no lexicon
    if (this._rawPhones(word1) === this._rawPhones(word2)) {
      return false;
    }
    let p1 = this._lastStressedVowelPhonemeToEnd(word1),
      p2 = this._lastStressedVowelPhonemeToEnd(word2);
    return p1 && p2 && p1 === p2;
  }

  size() {
    let dict = this._dict(false);
    return dict ? Object.keys(dict).length : 0;
  }

  //////////////////////////// helpers /////////////////////////////////

  similarByType(word, opts) {

    this.parseArgs(opts);

    const dict = this._dict(true);
    const sound = opts.type === 'sound'; // default: letter 
    const input = word.toLowerCase(), words = Object.keys(dict);
    const variations = [input, input + 's', input + 'es'];
    const phonesA = sound ? this._toPhoneArray(this._rawPhones(input)) : input;

    if (!phonesA) return result;

    let result = [], minVal = Number.MAX_VALUE;
    for (let i = 0; i < words.length; i++) {
      let entry = words[i];
      if (!this.checkCriteria(entry, dict[entry], opts)) continue;
      if (variations.includes(entry)) continue;

      // TODO: optimise?
      let phonesB = sound ? dict[entry][0].replace(/1/g, '').replace(/ /g, '-').split('-') : entry;
      let med = this.minEditDist(phonesA, phonesB);

      // found something even closer
      if (med >= opts.minDistance && med < minVal) {
        minVal = med;
        result = [entry];
      }
      // another best to add
      else if (med === minVal) {
        result.push(entry);
      }
      if (result.length === opts.limit) break;
    }
    return result;
  }

  checkCriteria(word, rdata, opts) {

    // check word length
    if (word.length > opts.maxLength) return false;
    if (word.length < opts.minLength) return false;

    // match numSyllables if supplied
    if (opts.numSyllables) {
      let syls = rdata[0].split(' ').length;
      if (opts.numSyllables !== syls) return false;
    }
    return true;
  }

  // Handles: pos, limit, numSyllables, minLength, maxLength
  // potentially appends pluralize, conjugate, targetPos
  parseArgs(opts) {

    opts.minDistance = opts.minDistance || 1;
    opts.numSyllables = opts.numSyllables || 0;
    opts.minLength = opts.minLength || 3;
    opts.maxLength = opts.maxLength || Number.MAX_SAFE_INTEGER;
    opts.limit = opts.limit || Number.MAX_SAFE_INTEGER;

    // handle part-of-speech
    let tpos = opts.pos || false;
    if (tpos && tpos.length) {
      opts.pluralize = (tpos === "nns");
      opts.conjugate = (tpos[0] === "v" && tpos.length > 2);
      if (tpos[0] === "n") tpos = "nn";
      else if (tpos[0] === "v") tpos = "vb";
      else if (tpos === "r") tpos = "rb";
      else if (tpos === "a") tpos = "jj";
    }
    opts.targetPos = tpos;
    return opts;
  }

  reconjugate(word, pos) {
    switch (pos) {
      /*  VBD 	Verb, past tense
          VBG 	Verb, gerund or present participle
          VBN 	Verb, past participle
          VBP 	Verb, non-3rd person singular present
          VBZ 	Verb, 3rd person singular present */
      case 'vbd':
        return RiTa.conjugate(word, {
          number: RiTa.SINGULAR,
          person: RiTa.FIRST_PERSON,
          tense: RiTa.PAST_TENSE
        });
        break;
      case 'vbg':
        return RiTa.presentParticiple(word);
        break;
      case 'vbn':
        return RiTa.pastParticiple(word);
        break;
      case 'vbp':
        return RiTa.conjugate(word); // no args
        break;
      case 'vbz':
        return RiTa.conjugate(word, {
          number: RiTa.SINGULAR,
          person: RiTa.THIRD_PERSON,
          tense: RiTa.PRESENT_TENSE
        });
        break;
      default: throw Error('Unexpected pos: ' + pos);
    }
  }

  similarBySoundAndLetter(word, opts) {

    const actualLimit = opts.limit;

    opts.type = 'letter';
    opts.limit = Number.MAX_SAFE_INTEGER;
    const simLetter = this.similarByType(word, opts);
    if (simLetter.length < 1) return [];

    opts.type = 'sound';
    opts.limit = Number.MAX_SAFE_INTEGER;
    const simSound = this.similarByType(word, opts);
    if (simSound.length < 1) return [];

    return this._intersect(simSound, simLetter).slice(0, actualLimit);
  }

  _toPhoneArray(raw) {
    return raw.replace(/[01]/g, '').replace(/ /g, '-').split('-');
  }

  _isVowel(c) {
    return c && c.length && RiTa.VOWELS.includes(c);
  }

  _isConsonant(p) {
    return (typeof p === S && p.length === 1 && // precompile
      RiTa.VOWELS.indexOf(p) < 0 && /^[a-z\u00C0-\u00ff]+$/.test(p));
  }

  _firstPhone(rawPhones) {
    if (rawPhones && rawPhones.length) {
      let phones = rawPhones.split(RiTa.PHONEME_BOUNDARY);
      if (phones) return phones[0];
    }
  }

  _intersect(a1, a2) {
    return [a1, a2].reduce((a, b) => a.filter(e => b.includes(e)))
  }

  _lastStressedPhoneToEnd(word) {
    if (word && word.length) {
      let raw = this._rawPhones(word);
      if (raw) {
        let idx = raw.lastIndexOf(RiTa.STRESSED);
        if (idx >= 0) {
          let c = raw.charAt(--idx);
          while (c != '-' && c != ' ') {
            if (--idx < 0) return raw; // single-stressed syllable
            c = raw.charAt(idx);
          }
        }
        return raw.substring(idx + 1);
      }
    }
  }


  _lastStressedVowelPhonemeToEnd(word) {
    if (word && word.length) {
      let raw = this._lastStressedPhoneToEnd(word);
      if (raw) {
        let idx = -1, syllables = raw.split(' ');
        let lastSyllable = syllables[syllables.length - 1];
        lastSyllable = lastSyllable.replace('[^a-z-1 ]', '');
        for (let i = 0; i < lastSyllable.length; i++) {
          let c = lastSyllable.charAt(i);
          if (RiTa.VOWELS.includes(c)) {
            idx = i;
            break;
          }
        }
        return lastSyllable.substring(idx);
      }
    }
  }

  _firstStressedSyl(word) {
    let raw = this._rawPhones(word);
    if (raw) {
      let idx = raw.indexOf(RiTa.STRESSED);
      if (idx >= 0) {
        let c = raw.charAt(--idx);
        while (c != ' ') {
          if (--idx < 0) {  // single-stressed syllable
            idx = 0;
            break;
          }
          c = raw.charAt(idx);
        }
        let firstToEnd = idx === 0 ? raw : raw.substring(idx).trim();
        idx = firstToEnd.indexOf(' ');
        return idx < 0 ? firstToEnd : firstToEnd.substring(0, idx);
      }
    }
  }

  _posData(word, fatal) {
    let rdata = this._lookupRaw(word, fatal);
    if (rdata && rdata.length === 2) return rdata[1];
  }

  _posArr(word, fatal) {
    let rdata = this._lookupRaw(word, fatal);
    if (rdata && rdata.length === 2) return rdata[1].split(' ');
  }

  _bestPos(word) {
    let pl = this._posArr(word);
    if (pl) return pl[0];
  }

  _lookupRaw(word, fatal) {
    word = word && word.toLowerCase();
    return this._dict(fatal)[word];
  }

  _rawPhones(word, opts) {

    let noLts = opts && opts.noLts;
    let fatal = opts && opts.fatal;
    let rdata = this._lookupRaw(word, fatal);
    if (rdata && rdata.length) return rdata[0];

    if (!noLts) {
      let phones = RiTa.lts && RiTa.lts.computePhones(word);
      return Util.syllablesFromPhones(phones);
    }
  }

  _dict(fatal) {
    if (!this.data) {
      if (fatal) throw Error('This function requires a lexicon, make sure you are using the full version of rita.js,\navailable at ' + RiTa.DOWNLOAD_URL + '\n');
      if (!this.lexWarned) {
        console.warn('[WARN] no lexicon appears to be loaded; feature-analysis and pos-tagging may be incorrect.');
        this.lexWarned = true;
      }
    }
    return this.data || {};
  }

  // med for 2 strings (or 2 arrays)
  minEditDist(source, target) {

    let i, j, matrix = []; // matrix
    let cost; // cost
    let sI; // ith character of s
    let tJ; // jth character of t

    // Step 1 ----------------------------------------------

    for (i = 0; i <= source.length; i++) {
      matrix[i] = [];
      matrix[i][0] = i;
    }

    for (j = 0; j <= target.length; j++) {
      matrix[0][j] = j;
    }

    // Step 2 ----------------------------------------------

    for (i = 1; i <= source.length; i++) {
      sI = source[i - 1];

      // Step 3 --------------------------------------------

      for (j = 1; j <= target.length; j++) {
        tJ = target[j - 1];

        // Step 4 ------------------------------------------

        cost = (sI == tJ) ? 0 : 1;

        // Step 5 ------------------------------------------
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost);
      }
    }

    // Step 6 ----------------------------------------------

    return matrix[source.length][target.length];
  }
}

module && (module.exports = Lexicon);
