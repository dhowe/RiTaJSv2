const antlr4 = require('antlr4');
const Operator = require('./operator');
const { RiScriptVisitor } = require('../grammar/antlr/RiScriptVisitor');
const { RiScriptParser } = require('../grammar/antlr/RiScriptParser');

/*
 * This visitor walks the tree generated by a parser, 
 * evaluating each node as it goes.
 */
class Visitor extends RiScriptVisitor {

  constructor(parent, RiTa) {
    super();
    this.sequences = {};
    this.dynamic = {};
    this.parent = parent; // RiScript instance
    this.RiTa = RiTa;
  }

  init(context, opts) {
    this.pendingSymbols = [];
    this.context = context || {};
    this.trace = opts && opts.trace;
    this.silent = opts && opts.silent;
    return this;
  }

  // Entry point for tree visiting
  start(ctx) {
    this.indexer = 0;
    if (this.trace) console.log("start: '" + ctx.getText()
      .replace(/\r?\n/g, "\\n") + "'");
    let result = this.visitScript(ctx).trim();
    return result;
  }

  ////////////////////// transformable //////////////////////////

  visitChoice(ctx) {

    let options = [], rand = this.RiTa.randomizer;

    ctx.wexpr().map((w, k) => {
      let wctx = w.weight();
      let weight = wctx ? parseInt(wctx.INT()) : 1;
      let expr = w.expr() || Visitor.EC;
      for (let i = 0; i < weight; i++) options.push(expr);
    });

    let txs = ctx.transform();
    this.trace && console.log("visitChoice: '" + ctx.getText() + "' options=["
      + options.map(o => o.getText()) + "] tfs=" + flattenTx(txs));

    // make the selection
    let tok = rand.random(options); // SIMPLE
    if (this.trace) console.log("  select: '" + tok.getText()
      + "' [" + this.ruleName(tok) + "]");

    // now visit the token 
    let visited = this.visit(tok);

    // now apply any transforms
    if (!txs.length) return visited;
    let applied = this.applyTransforms(visited, txs);
    let result = typeof applied !== 'undefined' ? applied
      : '(' + visited + ')' + flattenTx(txs);

    if (this.trace) console.log("resolveChoice: '" + result + "'");

    return result;
  }

  visitChoiceOrig(ctx) {  // NEXT: redo without objects, then back to sequences

    let choice = this.sequences[++this.indexer];
    if (!choice) {
      choice = new ChoiceState(this, ctx);
      if (choice.type) this.sequences[choice.id] = choice;
    }

    let txs = ctx.transform();
    this.trace && console.log("visitChoice: '" + ctx.getText()
      + "' options=[" + choice.optionStr() + "] tfs=" + flattenTx(txs));

    // make the selection
    let tok = choice.select();
    if (this.trace) console.log("  select: '" + tok.getText()
      + "' [" + this.ruleName(tok) + "]");

    // now visit the token 
    let visited = this.visit(tok);

    // now apply any transforms
    if (!txs.length) return visited;
    let applied = this.applyTransforms(visited, txs);
    let result = typeof applied !== 'undefined' ? applied
      : '(' + visited + ')' + flattenTx(txs);

    if (this.trace) console.log("resolveChoice: '" + result + "'");

    return result;
  }

  /*   visitDynamic(ctx) {
      throw Error("[PARSER] the & (dynamic) modifier can only be used in an assignment:\n  "+ctx.getText());
    } */

/*   dynamicSymbol(id, value) {
    this.trace && console.log("dynamicSymbol: &" + id + ": " +value);
    if (!this.parent.isParseable(value)) {
      this.trace && console.log("resolveDynamic[0]: $" + id + " -> " + tmp);
    }
    else {
      let { LP, DYN, EQ, RP } = Visitor;
      value = LP + DYN + id + EQ + value + RP;
      this.trace && console.log("resolveDynamic[1]: $" + id + " -> " + value);
    } 
    return value;
  } */

  visitSymbol(ctx) {

    let txs = ctx.transform(), result = ctx.getText(), tn = ctx.SYM();

    // handle transform on empty string    
    if (!tn) {
      this.trace && console.log("emptyTransform: " + ctx.getText());
      let applied = this.applyTransforms('', txs);
      return applied !== null ? applied : result;
    }

    let ident = symbolName(tn.getText());
/*     let dynamic = this.context[Visitor.DYN + ident];
    if (dynamic) return this.visit(dynamic);
 */    //if (dynamic) return this.dynamicSymbol(ident, dynamic);

    this.trace && console.log("visitSymbol: $" + ident
      + (this.context[Visitor.DYN + ident] ? " [dynamic]" : "") + " tfs=" + flattenTx(txs));

    // if the symbol is pending just return it
    if (this.pendingSymbols.includes(ident)) {
      this.trace && console.log("resolveSymbol[0]: (pending) $" + ident);
      return result + flattenTx(txs);
    }

    // now try to resolve from context
    let resolved = this.context[ident];
    //let isDynamic = false;

    // if it fails
    if (!resolved) {

      // try with a dynamic version
      resolved = this.context[Visitor.DYN + ident];
      if (resolved) {
        // check if we have a dynamic
        result = Visitor.LP + resolved + Visitor.RP + flattenTx(txs);
        this.trace && console.log("resolveDynamic[1]: &" + ident + " -> '" + result + "'");
        return result;
        //isDynamic = true; // mark it
       /*  if (this.parent.isParseable(resolved)) {
          retirn resolved;
        } */
      } else {
        // otherwise give up, wait for next pass
        this.trace && console.log("resolveSymbol[1]: $" + ident + " -> '" + result + "'");
        return result;
      }
    }

    // if the symbol is not fully resolved, save it for next time (as an inline*)
    if (this.parent.isParseable(resolved)) {

      /*if (!isDynamic)*/ this.pendingSymbols.push(ident);
      let { LP, SYM, DYN, EQ, RP } = Visitor;
      let tmp = LP + SYM + ident + EQ + resolved + RP + flattenTx(txs); 
      //if (isDynamic) tmp = resolved;
      this.trace && console.log("resolveSymbol[P]: $" + ident + " -> " + tmp);
      return tmp;
    }

    // now check for transforms
    if (!txs.length) {
      this.trace && console.log("resolveSymbol[2]: $" + ident + " -> '" + resolved + "'");
      return resolved;
    }

    let applied = this.applyTransforms(resolved, txs);
    result = applied || (resolved + flattenTx(txs)); // TODO: PROBLEM?

    this.trace && console.log("resolveSymbol[3]: $" + ident + " -> '" + result + "'");

    return result;
  }

  ////////////////////// ///////////// //////////////////////////

  visitAssign(ctx) {

    // visit value and create a mapping in the symbol table */
    let token = ctx.expr();
    let id = symbolName(ctx.symbol().getText());
    this.trace && console.log('visitAssign: $' + id + '=\'' + flatten(token));
    // + "' "+ctx.start.column+"-"+ctx.stop.column);
    let result = this.visit(token);
    this.context[id] = result;
    this.trace && console.log("resolveAssign: $"
      + id + " -> '" + result + "' " + JSON.stringify(this.context));

    return ctx.start.column === 0 ? '' : result; // no output if first on line
  }

  visitDassign(ctx) {

    // visit value and create a mapping in the symbol table */
    let token = ctx.expr(), id = ctx.dynamic().getText();//txs = ctx.transform();
    let result = token.getText();
    this.trace && console.log('visitDAssign: ' + id + '=\'' + result);// + "' tfs=" + flattenTx(txs));

    this.context[id] = result;
    this.trace && console.log("resolveDAssign: "
      + id + " -> '" + result + "' ");// JSON.stringify(this.context));

    return ctx.start.column === 0 ? '' : result; // no output if first on line
  }

  visitExpr(ctx) {
    if (this.trace) {
      console.log("visitExpr: '" + ctx.getText() + "'");
      //this.printChildren(ctx);
    }
    return this.visitChildren(ctx);
  }

  visitChars(ctx) {
    if (this.trace) console.log("visitChars: '" + ctx.getText() + "'");
    return ctx.getText();
  }

  visitCexpr(ctx) {
    let conds = ctx.cond();
    this.trace && console.log('visitCexpr:' + ctx.expr().getText() + "'",
      'cond={' + conds.map(c => c.getText().replace(',', '')) + '}');
    for (let i = 0; i < conds.length; i++) {
      let id = symbolName(conds[i].symbol().getText());
      let op = Operator.fromString(conds[i].op().getText());
      let val = conds[i].chars().getText();
      let sym = this.context[id];
      let accept = sym ? op.invoke(sym, val) : false;
      /* this.trace && console.log('  cond(' + ctx.getText() + ')',
        id, op.toString(), val, '->', accept); */
      if (!accept) return this.visitExpr(Visitor.EC);
    }
    return this.visitExpr(ctx.expr());
  }

  visitCond(ctx) {
    if (this.trace) console.log("visitCond: '"
      + ctx.getText() + "'\t" + stack(ctx));
    return this.visitChildren(ctx);
  }

  visitWeight(ctx) {
    if (this.trace) console.log("visitWeight: '"
      + ctx.getText() + "'\t" + stack(ctx));
    return this.visitChildren(ctx);
  }

  visitWexpr(ctx) {
    if (this.trace) console.log("visitWexpr: '"
      + ctx.getText() + "'\t" + stack(ctx));
    return this.visitChildren(ctx);
  }

  visitOp(ctx) {
    if (this.trace) console.log("visitOp: '"
      + ctx.getText() + "'\t" + stack(ctx));
    return this.visitChildren(ctx);
  }

  visitTerminal(tn) {
    let text = tn.getText();
    if (text === '\n') return ' '; // need
    if (this.trace && text !== Visitor.EOF) {
      console.log("visitTerminal: '" + text + "'");
    }
    return null;
  }

  visitTransform(ctx) { // should never happen
    throw Error("[ERROR] visitTransform: '" + ctx.getText() + "'");
  }

  //////////////////////////////////////////////////////
  applyTransforms(term, tfs) {
    if (typeof term === 'undefined' || !tfs || !tfs.length) {
      return;
    }
    if (tfs.length > 1) throw Error("Invalid # Transforms: " + tfs.length);

    let result = term;

    // make sure the terminal is resolved
    if (typeof term === 'string') {
      result = this.parent.normalize(term);
      if (this.parent.isParseable(result)) { // save for later
        //throw Error("applyTransforms.isParseable=true: '" + result + "'");
        return;
      }
    }

    // split the transform string and apply each transform
    let transforms = tfs[0].getText().replace(/^\./g, "").split("\.");
    for (let i = 0; i < transforms.length; i++) {
      result = this.applyTransform(result, transforms[i]);
    }

    return result;
  }

  // Attempts to apply transform, returns null on failure
  applyTransform(target, tx) {

    let result, raw = target + Visitor.DOT + tx;
    if (this.trace) console.log
      ("applyTransform: '" + target + "' tf=" + tx);

    // check for function
    if (tx.endsWith(Visitor.FUNC)) {

      // strip parens
      tx = tx.substring(0, tx.length - 2);

      // function in context
      if (typeof this.context[tx] === 'function') {
        result = this.context[tx](target);
      }
      // function in transforms
      else if (typeof this.parent.transforms[tx] === 'function') {
        result = this.parent.transforms[tx](target);
      }
      // member functions (usually on String)
      else if (typeof target[tx] === 'function') {
        result = target[tx]();
        if (target === '' && result === '') {
          if (!this.silent && !this.RiTa.SILENT) console.warn
            ("[WARN] Unresolved transform[0]: " + raw);
        }
      }
      else { // function doesn't exist
        result = raw;
        if (!this.silent && !this.RiTa.SILENT) console.warn
          ("[WARN] Unresolved transform[1]: " + result);
      }
    }
    // check for property
    else {

      if (target.hasOwnProperty(tx)) {
        result = target[tx];
      }
      else {
        result = raw;
        if (!this.silent && !this.RiTa.SILENT) console.warn
          ("[WARN] Unresolved transform[2]: " + result);
      }
    }

    if (this.trace) console.log("resolveTransform: '"
      + target + "' -> '" + (result || undefined) + "'");

    return result;
  }

  stack(rule) {
    let ruleNames = this.parent.parser.getRuleNames();
    let sb = "    [";
    while (rule) {
      // compute what follows who invoked this rule
      let ruleIndex = rule.getRuleIndex();
      if (ruleIndex < 0) {
        sb += "n/a";
      }
      else {
        sb += ruleNames[ruleIndex] + " <- ";
      }
      rule = rule.parent;
    }
    return sb.replace(/ <- $/, "]");
  }

  visitChildren(node) {
    let result = "";
    for (let i = 0; i < node.getChildCount(); i++) {
      let child = node.getChild(i);
      let visit = this.visit(child);
      result += visit || "";
    }
    return result;
  }

  ruleName(ctx) {
    return ctx.hasOwnProperty('symbol') ?
      this.parent.lexer.symbolicNames[ctx.symbol.type] :
      this.parent.parser.ruleNames[ctx.ruleIndex];
  }

  printChildren(ctx) {
    for (let i = 0; i < ctx.getChildCount(); i++) {
      let child = ctx.getChild(i);
      console.log("  child[" + i + "]: '" + child.getText() +
        "' [" + this.ruleName(child) + "]");
    }
  }
}

class ChoiceState {

  constructor(parent, ctx) {

    this.type = 0
    this.index = 0;
    this.options = []
    this.id = parent.indexer;
    this.rand = parent.RiTa.randomizer;

    ctx.wexpr().map((w, k) => {
      let wctx = w.weight();
      let weight = wctx ? parseInt(wctx.INT()) : 1;
      let expr = w.expr() || Visitor.EC;
      for (let i = 0; i < weight; i++) this.options.push(expr);
    });

    let txs = ctx.transform();
    if (txs.length) {
      let tf = txs[0].getText();
      TYPES.forEach(s => tf.includes('.' + s) && (this.type = s));
    }

    if (this.type === RSEQUENCE) this.options =
      this.rand.randomOrdering(this.options);
    //if (parent.trace) console.log('  new ChoiceState#' + this.id + '('
    //+ this.options.map(o => o.getText()) + ", type=" + this.type + ")");
  }

  optionStr() {
    return this.options.map(o => o.getText());
  }

  select() {
    if (this.options.length == 0) return null;
    if (this.options.length == 1) return this.options[0];
    if (this.type == SEQUENCE) return this.selectSequence();
    if (this.type == RSEQUENCE) return this.selectRandSequence();
    if (this.type == NOREPEAT) return this.selectNoRepeat();
    if (this.type == "norep") return this.selectNoRepeat(); // TODO: remove
    return this.rand.random(this.options); // SIMPLE
  }

  selectNoRepeat() {
    let cand;
    do {
      cand = this.rand.random(this.options);
    } while (cand == this.last);

    return (this.last = cand);
  }

  selectSequence() {
    let idx = this.index++ % this.options.length;
    return (this.last = this.options[idx]); d
  }


  selectRandSequence() {
    while (this.index == this.options.length) {
      this.options = this.rand.randomOrdering(this.options);
      // make sure we are not repeating
      if (this.options[0] != this.last) this.index = 0;
    }
    return this.selectSequence();
  }
}

function symbolName(text) {
  return (text.length && text[0] === Visitor.SYM)// || text[0] === Visitor.DYN)
    ? text.substring(1) : text;
}

function flatten(tok) {
  if (!tok) return "";
  return tok.getText();
}

function flattenTx(txs) {
  if (!txs || !txs.length) return "";
  return txs[0].getText();
}

Visitor.LP = '(';
Visitor.RP = ')';
Visitor.EQ = '=';
Visitor.OR = 'OR';
Visitor.SYM = '$';
Visitor.DYN = '&';
Visitor.DOT = '.';
Visitor.EOF = '<EOF>';
Visitor.ASSIGN = '[]';
Visitor.FUNC = '()';
Visitor.EC = new RiScriptParser.ExprContext();

const RSEQUENCE = 'rseq', SEQUENCE = 'seq', NOREPEAT = 'nore';
const TYPES = [RSEQUENCE, SEQUENCE, NOREPEAT];

module.exports = Visitor;
