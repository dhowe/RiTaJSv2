const antlr4 = require('antlr4');
const Operator = require('./operator');
const { RiScriptVisitor } = require('../grammar/.antlr/RiScriptVisitor');
const { RiScriptParser } = require('../grammar/.antlr/RiScriptParser');
const Util = require('./util');
const EmptyExpr = new RiScriptParser.ExprContext();

const RSEQUENCE = 'rseq', SEQUENCE = 'seq', NOREPEAT = 'norep';
const TYPES = [RSEQUENCE, SEQUENCE, NOREPEAT];

class TextContext extends antlr4.ParserRuleContext {
  constructor(text) {
    this.text = text;
    console.log(antlr4.Token.HIDDEN_CHANNEL);
    this.symbol = new antlr4.CommonToken(undefined, antlr4.Token.HIDDEN_CHANNEL);
    //new antlr4.CommonToken(antlr4.Token.HIDDEN_CHANNEL);
  }
  getText() {
    return this.text;
  }
  getSymbol() {
    return this.symbol;
  }
}

class ChoiceState {

  constructor(parent, ctx) {

    this.type = 0
    this.index = 0;
    this.options = []
    this.id = parent.indexer;

    ctx.wexpr().map((w, k) => {
      let wctx = w.weight();
      let weight = wctx ? parseInt(wctx.INT()) : 1;
      let expr = w.expr() || emptyExpr();
      for (let i = 0; i < weight; i++) this.options.push(expr);
    });

    let txs = ctx.transform();
    if (txs.length) {
      let tf = txs[0].getText();
      TYPES.forEach(s => tf.includes('.' + s) && (this.type = s));
    }

    if (this.type === RSEQUENCE) this.options =
      RiTa.randomizer.randomOrdering(this.options);

    if (parent.trace) console.log('new ChoiceState#' + this.id + '('
      + this.options.map(o => o.getText()) + "," + this.type + ")");
  }

  select() {
    if (this.options.length == 0) return null;
    if (this.options.length == 1) return this.options[0];
    if (this.type == SEQUENCE) return this.selectSequence();
    if (this.type == NOREPEAT) return this.selectNoRepeat();
    if (this.type == RSEQUENCE) return this.selectRandSequence();
    return RiTa.randomizer.randomItem(this.options); // SIMPLE
  }

  selectNoRepeat() {
    let cand = this.last;
    do {
      cand = RiTa.randomizer.randomItem(this.options);
    } while (cand == this.last);
    this.last = cand;
    //console.log('selectNoRepeat',cand.getText());
    return this.last;
  }

  selectSequence() {
    //console.log('selectSequence');
    let idx = this.index++ % this.options.length;
    //console.log('IDX', idx);
    return (this.last = this.options[idx]); d
  }


  selectRandSequence() {
    //console.log('selectRandSequence', this.index);

    while (this.index == this.options.length) {
      this.options = RiTa.randomizer.randomOrdering(this.options);
      //console.log('rand: ', this.options);
      // make sure we are not repeating
      if (this.options[0] != this.last) this.index = 0;
    }
    return this.selectSequence();
  }
}
/*
 * This visitor walks the tree generated by a parser, 
 * evaluating each node as it goes.
 */
class Visitor extends RiScriptVisitor {

  constructor(parent) {
    super();
    this.sequences = {};
    this.parent = parent;
  }

  init(context, opts) {
    this.pendingSymbols = [];
    this.context = context || {};
    this.trace = opts && opts.trace;
    return this;
  }

  // Entry point for tree visiting
  start(ctx) {
    this.indexer = 0;
    return this.visitScript(ctx).trim();
  }

  // choice / inline / symbol
  visitChoice(ctx) {
    let choice = this.sequences[++this.indexer];
    if (!choice) {
      choice = new ChoiceState(this, ctx);
      if (choice.type) this.sequences[choice.id] = choice;
      //console.log('numSeqs:',Object.keys(this.sequences).length);
    }
    let token = choice.select();
    this.passTransforms(token, ctx.transform());

    /* merge transforms on entire choice and selected option
    token.transforms = this.inheritTransforms(token, ctx);*/
    this.trace && console.log('visitChoice: ' + this.flatten(token),
      "tfs=" + (this.transforms(token) || "[]"));// this.flatten(options));

    // and then visit
    return this.visit(token);
  }

  /* output expr value and create a mapping in the symbol table */
  visitInline(ctx) {
    let token = ctx.expr();
    let orig = ctx.getText();
    let tokText = token.getText();
    let id = symbolName(ctx.symbol().getText());

    this.passTransforms(token, ctx.transform());
    //token.transforms = this.inheritTransforms(token, ctx);

    this.trace && console.log('visitInline[pre]: ' + id + '=' +
      this.flatten(token) + ' tfs=[' + (this.transforms(token) || '') + ']');

    this.context[id] = this.visit(token);
    this.trace && console.log('visitInline[pos]: $' + id + '=' + this.context[id]);

    // if the inline is not fully resolved, save it for next time
    if (this.parent.isParseable(this.context[id])) {
      this.pendingSymbols.push(id);
      return orig.replace(tokText, this.context[id]);
    }

    return this.context[id];
  }

  /* visit the resolved symbol */
  visitSymbol(ctx) {

    let ident = ctx.SYM();

    // hack: for blank .func() cases
    if (!ident) return this.handleTransforms('', ctx.transform());

    ident = symbolName(ident.getText());
    // the symbol is pending so just return it
    if (this.pendingSymbols.includes(ident)) return '$' + ident;

    let text = this.context[ident] || '$' + ident;
    let textContext = new TextContext(text);
    this.passTransforms(textContext, ctx.transform());
    // hack to pass transforms along to visitTerminal
    /*     let textContext = { text, getText: () => text };
        textContext.transforms = ctx.transforms || [];
        ctx.transform().map(t => textContext.transforms.push(t.getText()) );*/

    if (0 && typeof text !== 'string') {
      // Here we have a nested object (or RiTa call)
      console.log("***** NOPE", typeof text, text === RiTa, textContext.transforms);
    }

    this.trace && console.log('visitSymbol($' + ident + ')'
      + ' tfs=[' + (this.transforms(textContext) || '') + '] ctx[\''
      + ident + '\']=' + (ident === 'RiTa' ? '{RiTa}' : textContext.text));

    return this.visitTerminal(textContext);
  }

  transforms(ctx) {
    //console.log(ctx.constructor.name, ctx.parent.constructor.name);
    return this.ruleByType(ctx, RiScriptParser.TransformContext)
    //return ctx.getRuleContexts(TransformContext.class);
  }

  ruleByType(ctx, type) {
    if (!ctx.children) return [];
    return ctx.children.filter(c => c instanceof type);
    /* 
      var contexts = [];
      for (var j = 0; j < this.children.length; j++) {
        var child = this.children[j];
        if (child instanceof ctxType) {
          contexts.push(child);
        }
      }
      return contexts;
    } */
  };

  visitAssign(ctx) {
    // visit value and create a mapping in the symbol table */
    let token = ctx.expr();
    let id = symbolName(ctx.symbol().getText());
    this.trace && console.log('visitAssign: '
      + id + '=' + this.flatten(token) + ']');
    this.context[id] = this.visit(token);
    return ''; // no output on vanilla assign
  }

  /*   visitChars(ctx) {
      this.trace && console.log('visitChars("' + ctx.getText()
        + '"): tfs=' + (ctx.transforms || "[]"));
      let text = ctx.getText().toString();
      return this.handleTransforms(text, ctx.transforms);
    }
   */
  visitCexpr(ctx) {
    let conds = ctx.cond();
    this.trace && console.log('visitCexpr(' + ctx.expr().getText() + ')',
      'cond={' + conds.map(c => c.getText().replace(',', '')) + '}');
    for (let i = 0; i < conds.length; i++) {
      let id = symbolName(conds[i].SYM().getText());
      let op = Operator.fromString(conds[i].op().getText());
      let val = conds[i].chars().getText();
      let sym = this.context[id];
      let accept = sym ? op.invoke(sym, val) : false;
      /* this.trace && console.log('  cond(' + ctx.getText() + ')',
        id, op.toString(), val, '->', accept); */
      if (!accept) return this.visitExpr(emptyExpr());
    }
    return this.visitExpr(ctx.expr());
  }

  /*   handleSequence(options, shuffle) {
      if (!this.sequence) {
        this.sequence = new Sequence(options, shuffle);
      }
      return this.sequence.next();
    } */
  /*   visitExpr(ctx) {
      this.trace && console.log('visitExpr(\'' + ctx.getText()
        + '\'): tfs=' + (ctx.transforms || "[]"));
      let result = this.visitChildren(ctx);
      return result;
    } */

  visitTerminal(ctx) {
    let term = ctx.getText();
    let tfs = this.transforms(ctx);
    return this.handleTransforms(term, tfs);
  }

  visitTerminalX(ctx) {

    let term = ctx, tfs = ctx.transforms;
    if (typeof ctx.getText === 'function') {
      term = ctx.getText();
    }

    if (typeof term === 'string') {

      if (term === Visitor.EOF) return '';
      term = this.parent.normalize(term);
      this.trace && /\S/.test(term) && console.log
        ('visitTerminal("' + term + '") tfs=[' + (tfs || '') + ']');

      // Re-append transforms on unresolved symbols/groups for next pass
      if (this.parent.isParseable(term)) {
        return term + (tfs ? tfs.reduce((acc, val) => acc +
          (typeof val === 'string' ? val : val.getText()), '') : '');
      }
    }
    else if (typeof term === 'object') {

      // Here we've resolved a symbol to an object in visitSymbol
      this.trace && console.log('visitTerminal2(' + (typeof term) + '): "'
        + JSON.stringify(term) + '" tfs=[' + (tfs || '') + ']');
    }
    else if (typeof term === 'function') {

      // Only happens when calling a RiTa function?
      this.trace && console.log('visitFunction(""): tfs=[' + (tfs || '') + ']');
    }
    else {
      throw Error('Unexpected terminal type=' + (typeof term)); // never
    }

    return this.handleTransforms(term, tfs);
  }

  visitChildren(ctx) {

    if (!ctx.children) return '';

    this.trace && console.log('visitChildren(' + ctx.constructor.name + '): "'
      + ctx.getText() + '"', ctx.transforms || '[]', '[' + ctx.children.reduce(
        (acc, c) => acc += c.constructor.name + ',', '').replace(/,$/, ']'));

    // if we have only one child, transforms apply to it
    if (ctx.children.length === 1) {
      let tok = ctx.children[0];
      tok.transforms = this.inheritTransforms(tok, ctx);
      //console.log('ONECHILDPOLICY', tok.transforms);
      return this.visit(tok);
    }

    // visit each child, pass transforms, and merge their output
    let result = ctx.children.reduce((acc, child) => acc + this.visit(child), '');
    return this.handleTransforms(result, ctx.transforms);
  }

  // ---------------------- Helpers ---------------------------

  /* run the transforms and return the results */
  handleTransforms(obj, transforms) {
    let term = obj;
    if (transforms && transforms.length) {
      let tfs = this.trace ? '' : null; // debug
      for (let i = 0; i < transforms.length; i++) {
        let txf = transforms[i];
        txf = (typeof txf === 'string') ? txf : txf.getText();
        this.trace && (tfs += txf); // debug
        let comps = txf.split('.');
        for (let j = 1; j < comps.length; j++) {
          let comp = comps[j];
          if (comp.length) {
            if (comp.endsWith(Visitor.FUNCTION)) {
              // strip parens
              comp = comp.substring(0, comp.length - 2);
              // handle transforms in context
              if (typeof this.context[comp] === 'function') {
                term = this.context[comp](term);
              }
              // handle built-in string functions
              else if (typeof term[comp] === 'function') {
                term = term[comp]();
              }
              else {
                let msg = 'Expecting ' + term + '.' + comp + '() to be a function';
                if (!this.silent && !RiTa.SILENT) console.warn('[WARN] ' + msg);
                //throw Error(msg);
                term = term + '.' + comp;  // no-op
              }
              // handle object properties
            } else if (term.hasOwnProperty(comp)) {
              if (typeof term[comp] === 'function') {
                throw Error('Functions with args not yet supported: $object.' + comp + '(...)');
              }
              term = term[comp];
              // no-op
            } else {
              term = term + '.' + comp; // no-op
            }
          }
        }
      }
      this.trace && console.log('handleTransforms: ' +
        (obj.length ? obj : "''") + tfs + ' -> ' + term);
    }
    return term;
  }

  getRuleName(ctx) {
    return ctx.hasOwnProperty('symbol') ?
      this.parent.lexer.symbolicNames[ctx.symbol.type] :
      this.parent.parser.ruleNames[ctx.ruleIndex];
  }

  countChildRules(ctx, ruleName) {
    let count = 0;
    for (let i = 0; i < ctx.getChildCount(); i++) {
      if (this.getRuleName(ctx.getChild(i)) === ruleName) count++;
    }
    return count;
  }

  printChildren(ctx) {
    for (let i = 0; i < ctx.getChildCount(); i++) {
      let child = ctx.getChild(i);
      console.log('  child' + i + ':', child.getText(), 'type=' + this.getRuleName(child));
    }
  }

  flatten(toks) {
    if (!Array.isArray(toks)) toks = [toks];
    return toks.reduce((acc, t) => acc += '[' + this.getRuleName(t) + ':' + t.getText() + ']', '');
  }

  flattenChoice(toks) {
    if (!Array.isArray(toks)) toks = [toks];
    return toks.reduce((acc, t) => acc += '[' + this.getRuleName(t) + ':' + t.getText() + ']', 'choice: ');
  }

  passTransforms(ctx, txs) {
    ctx = ctx || RuleContext.EMPTY;
    let children = ctx.children || [];
    if (txs != null) txs.forEach(tx => children.push(tx));
    ctx.children = children;
    return ctx;
  }

  inheritTransforms(token, ctx) {
    if (!token) throw Error('No token');
    let ctxTransforms = ctx.transform ? ctx.transform().map(t => t.getText()) : [];
    ctxTransforms = mergeArrays(ctxTransforms, ctx.transforms);
    if (typeof token.transforms === 'undefined') return ctxTransforms;
    return mergeArrays(token.transforms, ctxTransforms);
  }

  handleEmptyChoices(ctx, options) {
    let ors = this.countChildRules(ctx, Visitor.OR);
    let exprs = this.countChildRules(ctx, "expr");
    let adds = (ors + 1) - exprs;
    for (let i = 0; i < adds; i++) {
      options.push(emptyExpr());
    }
  }
}

class NoRepeat {
  //TODO:
}

class Sequence {
  constructor(opts, shuffle) {
    this.last = null;
    this.index = 0;
    this.options = opts;
    this.shuffle = shuffle;
    if (shuffle) this.shuffleOpts();
    /*console.log('new Sequence(' + this.options.map
      (o => o.getText()) + ", " + !!shuffle + ")");*/
  }
  next() {
    //console.log('Sequence#' + this.index);
    while (this.shuffle && this.index === this.options.length) {
      this.shuffleOpts();
      // no repeats
      if (this.options.length < 2 || this.options[0] !== this.last) {
        this.index = 0;
      }
    }
    this.last = this.options[this.index++ % this.options.length];
    return this.last;
  }
  shuffleOpts() {
    let newArray = this.options.slice(), len = newArray.length, i = len;
    while (i--) {
      let p = parseInt(Math.random() * len), t = newArray[i];
      newArray[i] = newArray[p];
      newArray[p] = t;
    }
    this.options = newArray;
  }
}

function randomElement(arr) {
  return arr[Math.floor((Math.random() * arr.length))];
}

function symbolName(text) {
  return (text.length && text[0] === Visitor.SYM) ? text.substring(1) : text;
}

function mergeArrays(orig, adds) {
  return (adds && adds.length) ? (orig || []).concat(adds) : orig;
}

function inspect(o) {
  let props = [];
  let obj = o;
  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while (obj = Object.getPrototypeOf(obj));
  return props.sort().filter(function (e, i, arr) {
    return (e != arr[i + 1]);// && typeof o[e] === 'function');
  });
}

function typeOf(o) {
  if (typeof o !== 'object') return typeof o;
  return Array.isArray(o) ? 'array' : 'object';
}

function emptyExpr() {
  delete EmptyExpr.transforms;
  return EmptyExpr;
}

Visitor.LP = '(';
Visitor.RP = ')';
Visitor.OR = 'OR';
Visitor.SYM = '$';
Visitor.EOF = '<EOF>';
Visitor.ASSIGN = '[]';
Visitor.FUNCTION = '()';

module.exports = Visitor;
