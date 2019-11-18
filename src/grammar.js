const RiTa = require('./rita_api');

const OR_PATT = /\s*\|\s*/;
const PROB_PATT = /(.*[^\s])\s*\[([0-9.]+)\](.*)/;

class Grammar {

  constructor(rules) {
    this.rules = {};
    rules && this.load(rules);
  }

  expand(context) {
    return this.expandFrom(Grammar.START_RULE, context);
  }

  expandFrom(rule, context) {

    let expandRule = (g, prod) => {

      let entry, idx, pre, expanded, post, dbug = 0;
      if (dbug) console.log("expandRule(" + prod + ")");

      for (let name in g.rules) {

        entry = g.rules[name];
        if (dbug) {
          console.log("  name=" + name + "  entry=" +
            JSON.stringify(entry) + "  prod=" + prod + (idx ? "  idx=" + idx : ''));
        }
        idx = prod.indexOf(name);

        if (idx >= 0) { // got a match, split into 3 parts

          if (dbug) console.log('matched: ' + name);
          pre = prod.substring(0, idx) || '';
          expanded = g.doRule(name) || '';
          post = prod.substring(idx + name.length) || '';

          if (dbug) console.log("  pre=" + pre + "  expanded=" + expanded +
            "  post=" + post + "  result=" + pre + expanded + post);
          return pre + expanded + post;
        }
      }
      // no rules matched
    };

    if (!Object.keys(this.rules).length) {
      err("(RiGrammar) No grammar rules found!");
    }

    if (!this.hasRule(rule)) {
      err("Rule not found: " + rule + BN + "Rules:" + BN + JSON.stringify(this.rules));
    }

    let parts, theCall, callResult, tries = 0, maxIterations = 1000;

    while (++tries < maxIterations) {

      let next = expandRule(this, rule);
      if (next && next.length) { // matched a rule
        rule = next;
        continue;
      }
      //
      // // finished rules, check for back-ticked exec calls
      // parts = RiGrammar.EXEC_PATT.exec(rule);
      //
      // if (!parts || !parts.length) break; // return, no evals
      //
      // if (parts.length > 2) {
      //
      //   theCall = parts[2];
      //
      //   if (countTicks(theCall) != 2) {
      //     warn("Unable to parse recursive exec: " + theCall + "...");
      //     return null;
      //   }
      //
      //   callResult = handleExec(theCall, context);
      //   if (!callResult) {
      //
      //     if (0) log("[WARN] (RiGrammar.expandFrom) Unexpected" +
      //       " state: eval(" + theCall + ") :: returning '" + rule + "'");
      //     break; // return
      //   }
      //
      //   rule = parts[1] + callResult;
      //   if (parts.length > 3) rule += parts[3];
      // }

      if (tries >= maxIterations) {
        console.log("[WARN] max number of iterations reached: " + maxIterations);
      }
      return unescapeHTML(rule);
    }
  }

  doRule(pre) {

    let stochasticRule = temp => { // map

      var name, dbug = false, p = Math.random(), result, total = 0;
      if (dbug) log("getStochasticRule(" + temp + ")");
      for (name in temp) {
        total += parseFloat(temp[name]);
      }

      if (dbug) log("total=" + total + "p=" + p);
      for (name in temp) {
        if (dbug) log("  name=" + name);
        var amt = temp[name] / total;
        if (dbug) log("amt=" + amt);
        if (p < amt) {
          result = name;
          if (dbug) log("hit!=" + name);
          break;
        } else {
          p -= amt;
        }
      }
      return result;
    };

    var cnt = 0;
    let name = '';
    let rules = this.rules[pre];

    if (!rules) return null;

    for (name in rules) cnt++;

    if (!cnt) return null;

    return (cnt == 1) ? name : stochasticRule(rules);
  }

  reset() { // remove

    this.rules = {};
    return this;
  }

  load(rules) {

    if (typeof rules === 'string') {

      try {
        // first try with rita-script?

        //console.log('trying JSON');
        rules = JSON.parse(rules);

      } catch (e) {

        err('Grammar appears to be invalid JSON, please check it at ' +
          'http://jsonlint.com/. If you are using YAML, be sure to ' +
          verb + ' yamljs (https://github.com/jeremyfa/yaml.js), e.g. ' +
          syntax, grammar);

        return;
      }
    }

    for (let rule in rules) {
      this.addRule(rule, rules[rule]);
    }

    return this;
  }

  addRule(name, theRule, weight) {

    weight = weight || 1.0; // default

    let ruleset = Array.isArray(theRule) ? theRule
      : theRule.split(OR_PATT);

    for (let i = 0; i < ruleset.length; i++) {

      let rule = ruleset[i];
      let prob = weight;
      let m = PROB_PATT.exec(rule);

      if (m) // found weighting
      {
        rule = m[1] + m[3];
        prob = m[2];
      }

      let temp; // simplify
      if (this.hasRule(name)) {

        temp = this.rules[name];
        temp[rule] = prob;

      } else {

        temp = {};
        temp[rule] = prob;
        this.rules[name] = temp;
      }
    }

    return this;
  }

  hasRule(name) {

    return typeof this.rules[name] !== 'undefined';
  }

  removeRule(name) {

    delete this.rules[name];
    return this;
  }
}

class Scope {

  constructor(context) { // class

    this.names = [];
    if (context) {
      let scope = this;
      if (typeof context === 'function') {
        scope.put(context.name, context);
      }
      else if (typeof context === 'object') {
        Object.keys(context).forEach(f => {
          if (typeof context[f] === 'function')
            scope.put(f, context[f]);
        });
      }
    }
  }

  eval(s) { return eval(s); }

  put(name, val) {
    "use strict";
    let code = "(function() {\n";
    code += 'let ' + name + ' = ' + val + ';\n';
    code += 'return function(str) {return eval(str)};\n})()';
    this.eval = this.eval(code);
    this.names.push(name);
  }
}


function unescapeHTML(input) {

  if (!input || !input.length) return input;

  var answer = input.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, "\"");

  String.fromCharCodePoint = function() { // uggh
    var codeunits = [];
    for (var i = 0; i < arguments.length; i++) {
      var c = arguments[i];
      if (arguments[i] < 0x10000) {
        codeunits.push(arguments[i]);
      } else if (arguments[i] < 0x110000) {
        c -= 0x10000;
        codeunits.push((c >> 10 & 0x3FF) + 0xD800);
        codeunits.push((c & 0x3FF) + 0xDC00);
      }
    }
    return String.fromCharCode.apply(String, codeunits);
  };

  answer = answer.replace(/&#(\d+);/g, function(_, n) {
    return String.fromCharCodePoint(parseInt(n, 10));
  }).replace(/&#x([0-9a-f]+);/gi, function(_, n) {
    return String.fromCharCodePoint(parseInt(n, 16));
  });

  return answer;
}

function err() {
  var msg = "[RiTa] " + arguments[0];
  for (var i = 1; i < arguments.length; i++)
    msg += '\n' + arguments[i];
  throw Error(msg);
}

Grammar.START_RULE = "<start>";

module && (module.exports = Grammar);