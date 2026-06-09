/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 7159:
/***/ ((__unused_webpack_module, exports) => {

/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



let textToRegExp =
/**
 * Converts raw text into a regular expression string
 * @param {string} text the string to convert
 * @return {string} regular expression representation of the text
 * @package
 */
exports.textToRegExp = text => text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const regexpRegexp = /^\/(.*)\/([imu]*)$/;

/**
 * Make a regular expression from a text argument.
 *
 * If it can be parsed as a regular expression, parse it and the flags.
 *
 * @param {string} text the text argument.
 *
 * @return {?RegExp} a RegExp object or null in case of error.
 */
exports.makeRegExpParameter = function makeRegExpParameter(text) {
  let [, source, flags] = regexpRegexp.exec(text) || [null, textToRegExp(text)];

  try {
    return new RegExp(source, flags);
  }
  catch (e) {
    return null;
  }
};

let splitSelector = exports.splitSelector = function splitSelector(selector) {
  if (!selector.includes(",")) {
    return [selector];
  }

  let selectors = [];
  let start = 0;
  let level = 0;
  let sep = "";

  for (let i = 0; i < selector.length; i++) {
    let chr = selector[i];

    // ignore escaped characters
    if (chr == "\\") {
      i++;
    }
    // don't split within quoted text
    else if (chr == sep) {
      sep = "";             // e.g. [attr=","]
    }
    else if (sep == "") {
      if (chr == '"' || chr == "'") {
        sep = chr;
      }
      // don't split between parentheses
      else if (chr == "(") {
        level++;            // e.g. :matches(div,span)
      }
      else if (chr == ")") {
        level = Math.max(0, level - 1);
      }
      else if (chr == "," && level == 0) {
        selectors.push(selector.substring(start, i));
        start = i + 1;
      }
    }
  }

  selectors.push(selector.substring(start));
  return selectors;
};

function findTargetSelectorIndex(selector) {
  let index = 0;
  let whitespace = 0;
  let scope = [];

  // Start from the end of the string and go character by character, where each
  // character is a Unicode code point.
  for (let character of [...selector].reverse()) {
    let currentScope = scope[scope.length - 1];

    if (character == "'" || character == "\"") {
      // If we're already within the same type of quote, close the scope;
      // otherwise open a new scope.
      if (currentScope == character) {
        scope.pop();
      }
      else {
        scope.push(character);
      }
    }
    else if (character == "]" || character == ")") {
      // For closing brackets and parentheses, open a new scope only if we're
      // not within a quote. Within quotes these characters should have no
      // meaning.
      if (currentScope != "'" && currentScope != "\"") {
        scope.push(character);
      }
    }
    else if (character == "[") {
      // If we're already within a bracket, close the scope.
      if (currentScope == "]") {
        scope.pop();
      }
    }
    else if (character == "(") {
      // If we're already within a parenthesis, close the scope.
      if (currentScope == ")") {
        scope.pop();
      }
    }
    else if (!currentScope) {
      // At the top level (not within any scope), count the whitespace if we've
      // encountered it. Otherwise if we've hit one of the combinators,
      // terminate here; otherwise if we've hit a non-colon character,
      // terminate here.
      if (/\s/.test(character)) {
        whitespace++;
      }
      else if ((character == ">" || character == "+" || character == "~") ||
               (whitespace > 0 && character != ":")) {
        break;
      }
    }

    // Zero out the whitespace count if we've entered a scope.
    if (scope.length > 0) {
      whitespace = 0;
    }

    // Increment the index by the size of the character. Note that for Unicode
    // composite characters (like emoji) this will be more than one.
    index += character.length;
  }

  return selector.length - index + whitespace;
}

/**
 * Qualifies a CSS selector with a qualifier, which may be another CSS selector
 * or an empty string. For example, given the selector "div.bar" and the
 * qualifier "#foo", this function returns "div#foo.bar".
 * @param {string} selector The selector to qualify.
 * @param {string} qualifier The qualifier with which to qualify the selector.
 * @returns {string} The qualified selector.
 * @package
 */
exports.qualifySelector = function qualifySelector(selector, qualifier) {
  let qualifiedSelector = "";

  let qualifierTargetSelectorIndex = findTargetSelectorIndex(qualifier);
  let [, qualifierType = ""] =
    /^([a-z][a-z-]*)?/i.exec(qualifier.substring(qualifierTargetSelectorIndex));

  for (let sub of splitSelector(selector)) {
    sub = sub.trim();

    qualifiedSelector += ", ";

    let index = findTargetSelectorIndex(sub);

    // Note that the first group in the regular expression is optional. If it
    // doesn't match (e.g. "#foo::nth-child(1)"), type will be an empty string.
    let [, type = "", rest] =
      /^([a-z][a-z-]*)?\*?(.*)/i.exec(sub.substring(index));

    if (type == qualifierType) {
      type = "";
    }

    // If the qualifier ends in a combinator (e.g. "body #foo>"), we put the
    // type and the rest of the selector after the qualifier
    // (e.g. "body #foo>div.bar"); otherwise (e.g. "body #foo") we merge the
    // type into the qualifier (e.g. "body div#foo.bar").
    if (/[\s>+~]$/.test(qualifier)) {
      qualifiedSelector += sub.substring(0, index) + qualifier + type + rest;
    }
    else {
      qualifiedSelector += sub.substring(0, index) + type + qualifier + rest;
    }
  }

  // Remove the initial comma and space.
  return qualifiedSelector.substring(2);
};


/***/ }),

/***/ 1267:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



const {makeRegExpParameter, splitSelector,
       qualifySelector} = __webpack_require__(7159);
const {filterToRegExp} = __webpack_require__(453);

const DEFAULT_MIN_INVOCATION_INTERVAL = 3000;
let minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
const DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME = 50;
let maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;

const abpSelectorRegexp = /:(-abp-[\w-]+|has|has-text|xpath|not)\(/;

let testInfo = null;

function toCSSStyleDeclaration(value) {
  return Object.assign(document.createElement("test"), {style: value}).style;
}

/**
 * Enables test mode, which tracks additional metadata about the inner
 * workings for test purposes. This also allows overriding internal
 * configuration.
 *
 * @param {object} options
 * @param {number} options.minInvocationInterval Overrides how long
 *   must be waited between filter processing runs
 * @param {number} options.maxSynchronousProcessingTime Overrides how
 *   long the thread may spend processing filters before it must yield
 *   its thread
 */
__webpack_unused_export__ = function setTestMode(options) {
  if (typeof options.minInvocationInterval !== "undefined") {
    minInvocationInterval = options.minInvocationInterval;
  }
  if (typeof options.maxSynchronousProcessingTime !== "undefined") {
    maxSynchronousProcessingTime = options.maxSynchronousProcessingTime;
  }

  testInfo = {
    lastProcessedElements: new Set(),
    failedAssertions: []
  };
};

__webpack_unused_export__ = function getTestInfo() {
  return testInfo;
};

__webpack_unused_export__ = function() {
  minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
  maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;
  testInfo = null;
};

/**
 * Creates a new IdleDeadline.
 *
 * Note: This function is synchronous and does NOT request an idle
 * callback.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline}.
 * @return {IdleDeadline}
 */
function newIdleDeadline() {
  let startTime = performance.now();
  return {
    didTimeout: false,
    timeRemaining() {
      let elapsed = performance.now() - startTime;
      let remaining = maxSynchronousProcessingTime - elapsed;
      return Math.max(0, remaining);
    }
  };
}

/**
 * Returns a promise that is resolved when the browser is next idle.
 *
 * This is intended to be used for long running tasks on the UI thread
 * to allow other UI events to process.
 *
 * @return {Promise.<IdleDeadline>}
 *    A promise that is fulfilled when you can continue processing
 */
function yieldThread() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(resolve);
    }
    else {
      setTimeout(() => {
        resolve(newIdleDeadline());
      }, 0);
    }
  });
}


function getCachedPropertyValue(object, name, defaultValueFunc = () => {}) {
  let value = object[name];
  if (typeof value == "undefined") {
    Object.defineProperty(object, name, {value: value = defaultValueFunc()});
  }
  return value;
}

/**
 * Return position of node from parent.
 * @param {Node} node the node to find the position of.
 * @return {number} One-based index like for :nth-child(), or 0 on error.
 */
function positionInParent(node) {
  let index = 0;
  for (let child of node.parentNode.children) {
    if (child == node) {
      return index + 1;
    }

    index++;
  }

  return 0;
}

function makeSelector(node, selector = "") {
  if (node == null) {
    return null;
  }
  if (!node.parentElement) {
    let newSelector = ":root";
    if (selector) {
      newSelector += " > " + selector;
    }
    return newSelector;
  }
  let idx = positionInParent(node);
  if (idx > 0) {
    let newSelector = `${node.tagName}:nth-child(${idx})`;
    if (selector) {
      newSelector += " > " + selector;
    }
    return makeSelector(node.parentElement, newSelector);
  }

  return selector;
}

function parseSelectorContent(content, startIndex) {
  let parens = 1;
  let quote = null;
  let i = startIndex;
  for (; i < content.length; i++) {
    let c = content[i];
    if (c == "\\") {
      // Ignore escaped characters
      i++;
    }
    else if (quote) {
      if (c == quote) {
        quote = null;
      }
    }
    else if (c == "'" || c == '"') {
      quote = c;
    }
    else if (c == "(") {
      parens++;
    }
    else if (c == ")") {
      parens--;
      if (parens == 0) {
        break;
      }
    }
  }

  if (parens > 0) {
    return null;
  }
  return {text: content.substring(startIndex, i), end: i};
}

/**
 * Stringified style objects
 * @typedef {Object} StringifiedStyle
 * @property {string} style CSS style represented by a string.
 * @property {string[]} subSelectors selectors the CSS properties apply to.
 */

/**
 * Produce a string representation of the stylesheet entry.
 * @param {CSSStyleRule} rule the CSS style rule.
 * @return {StringifiedStyle} the stringified style.
 */
function stringifyStyle(rule) {
  let styles = [];
  for (let i = 0; i < rule.style.length; i++) {
    let property = rule.style.item(i);
    let value = rule.style.getPropertyValue(property);
    let priority = rule.style.getPropertyPriority(property);
    styles.push(`${property}: ${value}${priority ? " !" + priority : ""};`);
  }
  styles.sort();
  return {
    style: styles.join(" "),
    subSelectors: splitSelector(rule.selectorText)
  };
}

let scopeSupported = null;

function tryQuerySelector(subtree, selector, all) {
  let elements = null;
  try {
    elements = all ? subtree.querySelectorAll(selector) :
      subtree.querySelector(selector);
    scopeSupported = true;
  }
  catch (e) {
    // Edge doesn't support ":scope"
    scopeSupported = false;
  }
  return elements;
}

/**
 * Query selector.
 *
 * If it is relative, will try :scope.
 *
 * @param {Node} subtree the element to query selector
 * @param {string} selector the selector to query
 * @param {bool} [all=false] true to perform querySelectorAll()
 *
 * @returns {?(Node|NodeList)} result of the query. null in case of error.
 */
function scopedQuerySelector(subtree, selector, all) {
  if (selector[0] == ">") {
    selector = ":scope" + selector;
    if (scopeSupported) {
      return all ? subtree.querySelectorAll(selector) :
        subtree.querySelector(selector);
    }
    if (scopeSupported == null) {
      return tryQuerySelector(subtree, selector, all);
    }
    return null;
  }
  return all ? subtree.querySelectorAll(selector) :
    subtree.querySelector(selector);
}

function scopedQuerySelectorAll(subtree, selector) {
  return scopedQuerySelector(subtree, selector, true);
}

class PlainSelector {
  constructor(selector) {
    this._selector = selector;
    this.maybeDependsOnAttributes = /[#.:]|\[.+\]/.test(selector);
    this.maybeContainsSiblingCombinators = /[~+]/.test(selector);
  }

  /**
   * Generator function returning a pair of selector string and subtree.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getSelectors(prefix, subtree, targets) {
    yield [prefix + this._selector, subtree];
  }
}

const incompletePrefixRegexp = /[\s>+~]$/;

class NotSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), element];
    }
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo) {
          testInfo.lastProcessedElements.add(element);
        }

        if (!this._innerPattern.matches(element, subtree)) {
          yield element;
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class HasSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), element];
    }
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo) {
          testInfo.lastProcessedElements.add(element);
        }

        for (let selector of this._innerPattern.evaluate(element, targets)) {
          if (selector == null) {
            yield null;
          }
          else if (scopedQuerySelector(element, selector)) {
            yield element;
          }
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class XPathSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;
    this.maybeDependsOnAttributes = true;

    let evaluator = new XPathEvaluator();
    this._expression = evaluator.createExpression(textContent, null);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), element];
    }
  }

  *getElements(prefix, subtree, targets) {
    let {ORDERED_NODE_SNAPSHOT_TYPE: flag} = XPathResult;
    let elements = prefix ? scopedQuerySelectorAll(subtree, prefix) : [subtree];
    for (let parent of elements) {
      let result = this._expression.evaluate(parent, flag, null);
      for (let i = 0, {snapshotLength} = result; i < snapshotLength; i++) {
        yield result.snapshotItem(i);
      }
    }
  }
}

class ContainsSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;

    this._regexp = makeRegExpParameter(textContent);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), subtree];
    }
  }

  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;

    let elements = scopedQuerySelectorAll(subtree, actualPrefix);

    if (elements) {
      let lastRoot = null;
      for (let element of elements) {
        // For a filter like div:-abp-contains(Hello) and a subtree like
        // <div id="a"><div id="b"><div id="c">Hello</div></div></div>
        // we're only interested in div#a
        if (lastRoot && lastRoot.contains(element)) {
          yield null;
          continue;
        }

        lastRoot = element;

        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo) {
          testInfo.lastProcessedElements.add(element);
        }

        if (this._regexp && this._regexp.test(element.textContent)) {
          yield element;
        }
        else {
          yield null;
        }
      }
    }
  }
}

class PropsSelector {
  constructor(propertyExpression) {
    this.dependsOnStyles = true;
    this.maybeDependsOnAttributes = true;

    let regexpString;
    if (propertyExpression.length >= 2 && propertyExpression[0] == "/" &&
        propertyExpression[propertyExpression.length - 1] == "/") {
      regexpString = propertyExpression.slice(1, -1);
    }
    else {
      regexpString = filterToRegExp(propertyExpression);
    }

    this._regexp = new RegExp(regexpString, "i");

    this._subSelectors = [];
  }

  *getSelectors(prefix, subtree, targets) {
    for (let subSelector of this._subSelectors) {
      if (subSelector.startsWith("*") &&
          !incompletePrefixRegexp.test(prefix)) {
        subSelector = subSelector.substring(1);
      }

      yield [qualifySelector(subSelector, prefix), subtree];
    }
  }

  setStyles(styles) {
    this._subSelectors = [];
    for (let style of styles) {
      if (this._regexp.test(style.style)) {
        for (let subSelector of style.subSelectors) {
          let idx = subSelector.lastIndexOf("::");
          if (idx != -1) {
            subSelector = subSelector.substring(0, idx);
          }

          this._subSelectors.push(subSelector);
        }
      }
    }
  }
}

class Pattern {
  constructor(selectors, text, remove = false, css = null) {
    this.selectors = selectors;
    this.text = text;
    this.remove = remove;
    this.css = css;
  }

  get dependsOnStyles() {
    return getCachedPropertyValue(
      this, "_dependsOnStyles", () => this.selectors.some(
        selector => selector.dependsOnStyles
      )
    );
  }

  get maybeDependsOnAttributes() {
    // Observe changes to attributes if either there's a plain selector that
    // looks like an ID selector, class selector, or attribute selector in one
    // of the patterns (e.g. "a[href='https://example.com/']")
    // or there's a properties selector nested inside a has selector
    // (e.g. "div:-abp-has(:-abp-properties(color: blue))")
    return getCachedPropertyValue(
      this, "_maybeDependsOnAttributes", () => this.selectors.some(
        selector => selector.maybeDependsOnAttributes ||
                    (selector instanceof HasSelector &&
                     selector.dependsOnStyles)
      )
    );
  }

  get dependsOnCharacterData() {
    // Observe changes to character data only if there's a contains selector in
    // one of the patterns.
    return getCachedPropertyValue(
      this, "_dependsOnCharacterData", () => this.selectors.some(
        selector => selector.dependsOnCharacterData
      )
    );
  }

  get maybeContainsSiblingCombinators() {
    return getCachedPropertyValue(
      this, "_maybeContainsSiblingCombinators", () => this.selectors.some(
        selector => selector.maybeContainsSiblingCombinators
      )
    );
  }

  matchesMutationTypes(mutationTypes) {
    let mutationTypeMatchMap = getCachedPropertyValue(
      this, "_mutationTypeMatchMap", () => new Map([
        // All types of DOM-dependent patterns are affected by mutations of
        // type "childList".
        ["childList", true],
        ["attributes", this.maybeDependsOnAttributes],
        ["characterData", this.dependsOnCharacterData]
      ])
    );

    for (let mutationType of mutationTypes) {
      if (mutationTypeMatchMap.get(mutationType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generator function returning CSS selectors for all elements that
   * match the pattern.
   *
   * This allows transforming from selectors that may contain custom
   * :-abp- selectors to pure CSS selectors that can be used to select
   * elements.
   *
   * The selectors returned from this function may be invalidated by DOM
   * mutations.
   *
   * @param {Node} subtree the subtree we work on
   * @param {Node[]} [targets] the nodes we are interested in. May be
   * used to optimize search.
   */
  *evaluate(subtree, targets) {
    let selectors = this.selectors;
    function* evaluateInner(index, prefix, currentSubtree) {
      if (index >= selectors.length) {
        yield prefix;
        return;
      }
      for (let [selector, element] of selectors[index].getSelectors(
        prefix, currentSubtree, targets
      )) {
        if (selector == null) {
          yield null;
        }
        else {
          yield* evaluateInner(index + 1, selector, element);
        }
      }
      // Just in case the getSelectors() generator above had to run some heavy
      // document.querySelectorAll() call which didn't produce any results, make
      // sure there is at least one point where execution can pause.
      yield null;
    }
    yield* evaluateInner(0, "", subtree);
  }

  /**
   * Checks if a pattern matches a specific element
   * @param {Node} [target] the element we're interested in checking for
   * matches on.
   * @param {Node} subtree the subtree we work on
   * @return {bool}
   */
  matches(target, subtree) {
    let targetFilter = [target];
    if (this.maybeContainsSiblingCombinators) {
      targetFilter = null;
    }

    let selectorGenerator = this.evaluate(subtree, targetFilter);
    for (let selector of selectorGenerator) {
      if (selector && target.matches(selector)) {
        return true;
      }
    }
    return false;
  }

  setStyles(styles) {
    for (let selector of this.selectors) {
      if (selector.dependsOnStyles) {
        selector.setStyles(styles);
      }
    }
  }
}

function extractMutationTypes(mutations) {
  let types = new Set();

  for (let mutation of mutations) {
    types.add(mutation.type);

    // There are only 3 types of mutations: "attributes", "characterData", and
    // "childList".
    if (types.size == 3) {
      break;
    }
  }

  return types;
}

function extractMutationTargets(mutations) {
  if (!mutations) {
    return null;
  }

  let targets = new Set();

  for (let mutation of mutations) {
    if (mutation.type == "childList") {
      // When new nodes are added, we're interested in the added nodes rather
      // than the parent.
      for (let node of mutation.addedNodes) {
        targets.add(node);
      }
      if (mutation.removedNodes.length > 0) {
        targets.add(mutation.target);
      }
    }
    else {
      targets.add(mutation.target);
    }
  }

  return [...targets];
}

function filterPatterns(patterns, {stylesheets, mutations}) {
  if (!stylesheets && !mutations) {
    return patterns.slice();
  }

  let mutationTypes = mutations ? extractMutationTypes(mutations) : null;

  return patterns.filter(
    pattern => (stylesheets && pattern.dependsOnStyles) ||
               (mutations && pattern.matchesMutationTypes(mutationTypes))
  );
}

function shouldObserveAttributes(patterns) {
  return patterns.some(pattern => pattern.maybeDependsOnAttributes);
}

function shouldObserveCharacterData(patterns) {
  return patterns.some(pattern => pattern.dependsOnCharacterData);
}

function shouldObserveStyles(patterns) {
  return patterns.some(pattern => pattern.dependsOnStyles);
}

/**
 * @callback hideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be hidden
 */

/**
 * @callback unhideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 */

/**
 * @callback removeElemsFunc
 * @param {Node[]} elements Elements on the page that should be removed
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be removed
 * removed from the DOM
 */

/**
 * @callback cssElemsFunc
 * @param {Node[]} elements Elements on the page that should
 * apply inline CSS rules
 * @param {string[]} cssPatterns The CSS patterns to be applied
 */


/**
 * Manages the front-end processing of element hiding emulation filters.
 */
exports.WX = class ElemHideEmulation {
  /**
   * @param {module:content/elemHideEmulation~hideElemsFunc} hideElemsFunc
   *   A callback that should be provided to do the actual element hiding.
   * @param {module:content/elemHideEmulation~unhideElemsFunc} unhideElemsFunc
   *   A callback that should be provided to unhide previously hidden elements.
   * @param {module:content/elemHideEmulation~removeElemsFunc} removeElemsFunc
   *   A callback that should be provided to remove elements from the DOM.
   * @param {module:content/elemHideEmulation~cssElemsFunc} cssElemsFunc
   *   A callback that should be provided to apply inline CSS rules to elements
  */
  constructor(
    hideElemsFunc = () => {},
    unhideElemsFunc = () => {},
    removeElemsFunc = () => {},
    cssElemsFunc = () => {}
  ) {
    this._filteringInProgress = false;
    this._nextFilteringScheduled = false;
    this._lastInvocation = -minInvocationInterval;
    this._scheduledProcessing = null;

    this.document = document;
    this.hideElemsFunc = hideElemsFunc;
    this.unhideElemsFunc = unhideElemsFunc;
    this.removeElemsFunc = removeElemsFunc;
    this.cssElemsFunc = cssElemsFunc;
    this.observer = new MutationObserver(this.observe.bind(this));
    this.hiddenElements = new Map();
  }

  isSameOrigin(stylesheet) {
    try {
      return new URL(stylesheet.href).origin == this.document.location.origin;
    }
    catch (e) {
      // Invalid URL, assume that it is first-party.
      return true;
    }
  }

  /**
   * Parse the selector
   * @param {string} selector the selector to parse
   * @return {Array} selectors is an array of objects,
   * or null in case of errors.
   */
  parseSelector(selector) {
    if (selector.length == 0) {
      return [];
    }

    let match = abpSelectorRegexp.exec(selector);
    if (!match) {
      return [new PlainSelector(selector)];
    }

    let selectors = [];
    if (match.index > 0) {
      selectors.push(new PlainSelector(selector.substring(0, match.index)));
    }

    let startIndex = match.index + match[0].length;
    let content = parseSelectorContent(selector, startIndex);
    if (!content) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector} ` +
                                   "due to unmatched parentheses."));
      return null;
    }

    if (match[1] == "-abp-properties") {
      selectors.push(new PropsSelector(content.text));
    }
    else if (match[1] == "-abp-has" || match[1] == "has") {
      let hasSelectors = this.parseSelector(content.text);
      if (hasSelectors == null) {
        return null;
      }
      selectors.push(new HasSelector(hasSelectors));
    }
    else if (match[1] == "-abp-contains" || match[1] == "has-text") {
      selectors.push(new ContainsSelector(content.text));
    }
    else if (match[1] === "xpath") {
      try {
        selectors.push(new XPathSelector(content.text));
      }
      catch ({message}) {
        console.warn(
          new SyntaxError(
            "Failed to parse Adblock Plus " +
            `selector ${selector}, invalid ` +
            `xpath: ${content.text} ` +
            `error: ${message}.`
          )
        );

        return null;
      }
    }
    else if (match[1] == "not") {
      let notSelectors = this.parseSelector(content.text);
      if (notSelectors == null) {
        return null;
      }

      // if all of the inner selectors are PlainSelectors, then we
      // don't actually need to use our selector at all. We're better
      // off delegating to the browser :not implementation.
      if (notSelectors.every(s => s instanceof PlainSelector)) {
        selectors.push(new PlainSelector(`:not(${content.text})`));
      }
      else {
        selectors.push(new NotSelector(notSelectors));
      }
    }
    else {
      // this is an error, can't parse selector.
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, invalid ` +
                                   `pseudo-class :${match[1]}().`));
      return null;
    }

    let suffix = this.parseSelector(selector.substring(content.end + 1));
    if (suffix == null) {
      return null;
    }

    selectors.push(...suffix);

    if (selectors.length == 1 && selectors[0] instanceof ContainsSelector) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, can't ` +
                                   "have a lonely :-abp-contains()."));
      return null;
    }
    return selectors;
  }

  /**
   * Reads the rules out of CSS stylesheets
   * @param {CSSStyleSheet[]} [stylesheets] The list of stylesheets to
   * read.
   * @return {CSSStyleRule[]}
   */
  _readCssRules(stylesheets) {
    let cssStyles = [];

    for (let stylesheet of stylesheets || []) {
      // Explicitly ignore third-party stylesheets to ensure consistent behavior
      // between Firefox and Chrome.
      if (!this.isSameOrigin(stylesheet)) {
        continue;
      }

      let rules;
      try {
        rules = stylesheet.cssRules;
      }
      catch (e) {
        // On Firefox, there is a chance that an InvalidAccessError
        // get thrown when accessing cssRules. Just skip the stylesheet
        // in that case.
        // See https://searchfox.org/mozilla-central/rev/f65d7528e34ef1a7665b4a1a7b7cdb1388fcd3aa/layout/style/StyleSheet.cpp#699
        continue;
      }

      if (!rules) {
        continue;
      }

      for (let rule of rules) {
        if (rule.type != rule.STYLE_RULE) {
          continue;
        }

        cssStyles.push(stringifyStyle(rule));
      }
    }
    return cssStyles;
  }

  /**
   * Processes the current document and applies all rules to it.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    The list of new stylesheets that have been added to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, all of document's stylesheets will be considered
   *    then and all rules, including the ones not dependent on styles.
   * @param {MutationRecord[]} [mutations]
   *    The list of DOM mutations that have been applied to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, the entire document will be considered
   *    then and all rules, including the ones not dependent on the DOM.
   * @return {Promise}
   *    A promise that is fulfilled once all filtering is completed
   */
  async _addSelectors(stylesheets, mutations) {
    if (testInfo) {
      testInfo.lastProcessedElements.clear();
    }

    let deadline = newIdleDeadline();

    if (shouldObserveStyles(this.patterns)) {
      this._refreshPatternStyles();
    }

    let patternsToCheck = filterPatterns(
      this.patterns, {stylesheets, mutations}
    );

    let targets = extractMutationTargets(mutations);

    const elementsToHide = [];
    const elementsToHideFilters = [];
    const elementsToRemoveFilters = [];
    const elementsToRemove = [];
    const elementsToApplyCSS = [];
    const cssPatterns = [];
    let elementsToUnhide = new Set(this.hiddenElements.keys());
    for (let pattern of patternsToCheck) {
      let evaluationTargets = targets;

      // If the pattern appears to contain any sibling combinators, we can't
      // easily optimize based on the mutation targets. Since this is a
      // special case, skip the optimization. By setting it to null here we
      // make sure we process the entire DOM.
      if (pattern.maybeContainsSiblingCombinators) {
        evaluationTargets = null;
      }

      let generator = pattern.evaluate(this.document, evaluationTargets);
      for (let selector of generator) {
        if (selector != null) {
          for (let element of this.document.querySelectorAll(selector)) {
            if (pattern.remove) {
              elementsToRemove.push(element);
              elementsToRemoveFilters.push(pattern.text);
              elementsToUnhide.delete(element);
            }
            else if (pattern.css) {
              elementsToApplyCSS.push(element);
              cssPatterns.push(pattern);
            }
            else if (!this.hiddenElements.has(element)) {
              elementsToHide.push(element);
              elementsToHideFilters.push(pattern.text);
            }
            else {
              elementsToUnhide.delete(element);
            }
          }
        }

        if (deadline.timeRemaining() <= 0) {
          deadline = await yieldThread();
        }
      }
    }
    this._removeElems(elementsToRemove, elementsToRemoveFilters);
    this._applyCSSToElems(elementsToApplyCSS, cssPatterns);
    this._hideElems(elementsToHide, elementsToHideFilters);

    // The search for elements to hide it optimized to find new things
    // to hide quickly, by not checking all patterns and not checking
    // the full DOM. That's why we need to do a more thorough check
    // for each remaining element that might need to be unhidden,
    // checking all patterns.
    for (let elem of elementsToUnhide) {
      if (!elem.isConnected) {
        // elements that are no longer in the DOM should be unhidden
        // in case they're ever readded, and then forgotten about so
        // we don't cause a memory leak.
        continue;
      }
      let matchesAny = this.patterns.some(pattern => pattern.matches(
        elem, this.document
      ));
      if (matchesAny) {
        elementsToUnhide.delete(elem);
      }

      if (deadline.timeRemaining() <= 0) {
        deadline = await yieldThread();
      }
    }
    this._unhideElems(Array.from(elementsToUnhide));
  }

  _removeElems(elementsToRemove, elementFilters) {
    if (elementsToRemove.length > 0) {
      this.removeElemsFunc(elementsToRemove, elementFilters);
      for (let elem of elementsToRemove) {
        // they're not hidden anymore (if they ever were), they're
        // removed. There's no unhiding these ones!
        this.hiddenElements.delete(elem);
      }
    }
  }

  _applyCSSToElems(elements, cssPatterns) {
    if (elements.length > 0) {
      this.cssElemsFunc(elements, cssPatterns);
    }
  }

  _hideElems(elementsToHide, elementFilters) {
    if (elementsToHide.length > 0) {
      this.hideElemsFunc(elementsToHide, elementFilters);
      for (let i = 0; i < elementsToHide.length; i++) {
        this.hiddenElements.set(elementsToHide[i], elementFilters[i]);
      }
    }
  }

  _unhideElems(elementsToUnhide) {
    if (elementsToUnhide.length > 0) {
      this.unhideElemsFunc(elementsToUnhide);
      for (let elem of elementsToUnhide) {
        this.hiddenElements.delete(elem);
      }
    }
  }

  /**
   * Performed any scheduled processing.
   *
   * This function is asyncronous, and should not be run multiple
   * times in parallel. The flag `_filteringInProgress` is set and
   * unset so you can check if it's already running.
   * @return {Promise}
   *  A promise that is fulfilled once all filtering is completed
   */
  async _processFiltering() {
    if (this._filteringInProgress) {
      console.warn("ElemHideEmulation scheduling error: " +
                   "Tried to process filtering in parallel.");
      if (testInfo) {
        testInfo.failedAssertions.push(
          "Tried to process filtering in parallel"
        );
      }

      return;
    }

    let params = this._scheduledProcessing || {};
    this._scheduledProcessing = null;
    this._filteringInProgress = true;
    this._nextFilteringScheduled = false;
    await this._addSelectors(
      params.stylesheets,
      params.mutations
    );
    this._lastInvocation = performance.now();
    this._filteringInProgress = false;
    if (this._scheduledProcessing) {
      this._scheduleNextFiltering();
    }
  }

  /**
   * Appends new changes to the list of filters for the next time
   * filtering is run.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  _appendScheduledProcessing(stylesheets, mutations) {
    if (!this._scheduledProcessing) {
      // There isn't anything scheduled yet. Make the schedule.
      this._scheduledProcessing = {stylesheets, mutations};
    }
    else if (!stylesheets && !mutations) {
      // The new request was to reprocess everything, and so any
      // previous filters are irrelevant.
      this._scheduledProcessing = {};
    }
    else if (this._scheduledProcessing.stylesheets ||
             this._scheduledProcessing.mutations) {
      // The previous filters are not to filter everything, so the new
      // parameters matter. Push them onto the appropriate lists.
      if (stylesheets) {
        if (!this._scheduledProcessing.stylesheets) {
          this._scheduledProcessing.stylesheets = [];
        }
        this._scheduledProcessing.stylesheets.push(...stylesheets);
      }
      if (mutations) {
        if (!this._scheduledProcessing.mutations) {
          this._scheduledProcessing.mutations = [];
        }
        this._scheduledProcessing.mutations.push(...mutations);
      }
    }
    else {
      // this._scheduledProcessing is already going to recheck
      // everything, so no need to do anything here.
    }
  }

  /**
   * Schedule filtering to be processed in the future, or start
   * processing immediately.
   *
   * If processing is already scheduled, this does nothing.
   */
  _scheduleNextFiltering() {
    if (this._nextFilteringScheduled || this._filteringInProgress) {
      // The next one has already been scheduled. Our new events are
      // on the queue, so nothing more to do.
      return;
    }

    if (this.document.readyState === "loading") {
      // Document isn't fully loaded yet, so schedule our first
      // filtering as soon as that's done.
      this.document.addEventListener(
        "DOMContentLoaded",
        () => this._processFiltering(),
        {once: true}
      );
      this._nextFilteringScheduled = true;
    }
    else if (performance.now() - this._lastInvocation <
             minInvocationInterval) {
      // It hasn't been long enough since our last filter. Set the
      // timeout for when it's time for that.
      setTimeout(
        () => this._processFiltering(),
        minInvocationInterval - (performance.now() - this._lastInvocation)
      );
      this._nextFilteringScheduled = true;
    }
    else {
      // We can actually just start filtering immediately!
      this._processFiltering();
    }
  }

  /**
   * Re-run filtering either immediately or queued.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  queueFiltering(stylesheets, mutations) {
    this._appendScheduledProcessing(stylesheets, mutations);
    this._scheduleNextFiltering();
  }

  _refreshPatternStyles(stylesheet) {
    let allCssRules = this._readCssRules(this.document.styleSheets);
    for (let pattern of this.patterns) {
      pattern.setStyles(allCssRules);
    }
  }

  onLoad(event) {
    let stylesheet = event.target.sheet;
    if (stylesheet) {
      this.queueFiltering([stylesheet]);
    }
  }

  observe(mutations) {
    if (testInfo) {
      // In test mode, filter out any mutations likely done by us
      // (i.e. style="display: none !important"). This makes it easier to
      // observe how the code responds to DOM mutations.
      mutations = mutations.filter(
        ({type, attributeName, target: {style: newValue}, oldValue}) =>
          !(type == "attributes" && attributeName == "style" &&
            newValue.display == "none" &&
            toCSSStyleDeclaration(oldValue).display != "none")
      );

      if (mutations.length == 0) {
        return;
      }
    }

    this.queueFiltering(null, mutations);
  }

  apply(patterns) {
    if (this.patterns) {
      let removedPatterns = [];
      for (let oldPattern of this.patterns) {
        if (!patterns.find(newPattern => newPattern.text == oldPattern.text)) {
          removedPatterns.push(oldPattern);
        }
      }
      let elementsToUnhide = [];
      for (let pattern of removedPatterns) {
        for (let [element, filter] of this.hiddenElements) {
          if (filter == pattern.text) {
            elementsToUnhide.push(element);
          }
        }
      }
      if (elementsToUnhide.length > 0) {
        this._unhideElems(elementsToUnhide);
      }
    }

    this.patterns = [];
    for (let pattern of patterns) {
      let selectors = this.parseSelector(pattern.selector);
      if (selectors != null && selectors.length > 0) {
        this.patterns.push(
          new Pattern(selectors, pattern.text, pattern.remove, pattern.css)
        );
      }
    }

    if (this.patterns.length > 0) {
      this.queueFiltering();

      let attributes = shouldObserveAttributes(this.patterns);
      this.observer.observe(
        this.document,
        {
          childList: true,
          attributes,
          attributeOldValue: attributes && !!testInfo,
          characterData: shouldObserveCharacterData(this.patterns),
          subtree: true
        }
      );
      if (shouldObserveStyles(this.patterns)) {
        let onLoad = this.onLoad.bind(this);
        if (this.document.readyState === "loading") {
          this.document.addEventListener("DOMContentLoaded", onLoad, true);
        }
        this.document.addEventListener("load", onLoad, true);
      }
    }
  }

  disconnect() {
    this.observer.disconnect();
    this._unhideElems(Array.from(this.hiddenElements.keys()));
  }
};


/***/ }),

/***/ 453:
/***/ ((__unused_webpack_module, exports) => {

/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



/**
 * The maximum number of patterns that
 * `{@link module:patterns.compilePatterns compilePatterns()}` will compile
 * into regular expressions.
 * @type {number}
 */
const COMPILE_PATTERNS_MAX = 100;

/**
 * Regular expression used to match the `^` suffix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let separatorRegExp = /[\x00-\x24\x26-\x2C\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]/;

let filterToRegExp =
/**
 * Converts filter text into regular expression string
 * @param {string} text as in Filter()
 * @return {string} regular expression representation of filter text
 * @package
 */
exports.filterToRegExp = function filterToRegExp(text) {
  // remove multiple wildcards
  text = text.replace(/\*+/g, "*");

  // remove leading wildcard
  if (text[0] == "*") {
    text = text.substring(1);
  }

  // remove trailing wildcard
  if (text[text.length - 1] == "*") {
    text = text.substring(0, text.length - 1);
  }

  return text
    // remove anchors following separator placeholder
    .replace(/\^\|$/, "^")
    // escape special symbols
    .replace(/\W/g, "\\$&")
    // replace wildcards by .*
    .replace(/\\\*/g, ".*")
    // process separator placeholders (all ANSI characters but alphanumeric
    // characters and _%.-)
    .replace(/\\\^/g, `(?:${separatorRegExp.source}|$)`)
    // process extended anchor at expression start
    .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?:[^\\/]+\\.)?")
    // process anchor at expression start
    .replace(/^\\\|/, "^")
    // process anchor at expression end
    .replace(/\\\|$/, "$");
};

/**
 * Regular expression used to match the `||` prefix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let extendedAnchorRegExp = new RegExp(filterToRegExp("||") + "$");

/**
 * Regular expression for matching a keyword in a filter.
 * @type {RegExp}
 */
let keywordRegExp = /[^a-z0-9%*][a-z0-9%]{2,}(?=[^a-z0-9%*])/;

/**
 * Regular expression for matching all keywords in a filter.
 * @type {RegExp}
 */
let allKeywordsRegExp = new RegExp(keywordRegExp, "g");

/**
 * A `CompiledPatterns` object represents the compiled version of multiple URL
 * request patterns. It is returned by
 * `{@link module:patterns.compilePatterns compilePatterns()}`.
 */
class CompiledPatterns {
  /**
   * Creates an object with the given regular expressions for case-sensitive
   * and case-insensitive matching respectively.
   * @param {?RegExp} [caseSensitive]
   * @param {?RegExp} [caseInsensitive]
   * @private
   */
  constructor(caseSensitive, caseInsensitive) {
    this._caseSensitive = caseSensitive;
    this._caseInsensitive = caseInsensitive;
  }

  /**
   * Tests whether the given URL request matches the patterns used to create
   * this object.
   * @param {module:url.URLRequest} request
   * @returns {boolean}
   */
  test(request) {
    return ((this._caseSensitive &&
             this._caseSensitive.test(request.href)) ||
            (this._caseInsensitive &&
             this._caseInsensitive.test(request.lowerCaseHref)));
  }
}

/**
 * Compiles patterns from the given filters into a single
 * `{@link module:patterns~CompiledPatterns CompiledPatterns}` object.
 *
 * @param {module:filterClasses.URLFilter|
 *         Set.<module:filterClasses.URLFilter>} filters
 *   The filters. If the number of filters exceeds
 *   `{@link module:patterns~COMPILE_PATTERNS_MAX COMPILE_PATTERNS_MAX}`, the
 *   function returns `null`.
 *
 * @returns {?module:patterns~CompiledPatterns}
 *
 * @package
 */
exports.compilePatterns = function compilePatterns(filters) {
  let list = Array.isArray(filters) ? filters : [filters];

  // If the number of filters is too large, it may choke especially on low-end
  // platforms. As a precaution, we refuse to compile. Ideally we would check
  // the length of the regular expression source rather than the number of
  // filters, but this is far more straightforward and practical.
  if (list.length > COMPILE_PATTERNS_MAX) {
    return null;
  }

  let caseSensitive = "";
  let caseInsensitive = "";

  for (let filter of filters) {
    let source = filter.urlPattern.regexpSource;

    if (filter.matchCase) {
      caseSensitive += source + "|";
    }
    else {
      caseInsensitive += source + "|";
    }
  }

  let caseSensitiveRegExp = null;
  let caseInsensitiveRegExp = null;

  try {
    if (caseSensitive) {
      caseSensitiveRegExp = new RegExp(caseSensitive.slice(0, -1));
    }

    if (caseInsensitive) {
      caseInsensitiveRegExp = new RegExp(caseInsensitive.slice(0, -1));
    }
  }
  catch (error) {
    // It is possible in theory for the regular expression to be too large
    // despite COMPILE_PATTERNS_MAX
    return null;
  }

  return new CompiledPatterns(caseSensitiveRegExp, caseInsensitiveRegExp);
};

/**
 * Patterns for matching against URLs.
 *
 * Internally, this may be a RegExp or match directly against the
 * pattern for simple literal patterns.
 */
exports.Pattern = class Pattern {
  /**
   * @param {string} pattern pattern that requests URLs should be
   * matched against in filter text notation
   * @param {bool} matchCase `true` if comparisons must be case
   * sensitive
   */
  constructor(pattern, matchCase) {
    this.matchCase = matchCase || false;

    if (!this.matchCase) {
      pattern = pattern.toLowerCase();
    }

    if (pattern.length >= 2 &&
        pattern[0] == "/" &&
        pattern[pattern.length - 1] == "/") {
      // The filter is a regular expression - convert it immediately to
      // catch syntax errors
      pattern = pattern.substring(1, pattern.length - 1);
      this._regexp = new RegExp(pattern);
    }
    else {
      // Patterns like /foo/bar/* exist so that they are not treated as regular
      // expressions. We drop any superfluous wildcards here so our
      // optimizations can kick in.
      pattern = pattern.replace(/^\*+/, "").replace(/\*+$/, "");

      // No need to convert this filter to regular expression yet, do it on
      // demand
      this.pattern = pattern;
    }
  }

  /**
   * Checks whether the pattern is a string of literal characters with
   * no wildcards or any other special characters.
   *
   * If the pattern is prefixed with a `||` or suffixed with a `^` but otherwise
   * contains no special characters, it is still considered to be a literal
   * pattern.
   *
   * @returns {boolean}
   */
  isLiteralPattern() {
    return typeof this.pattern !== "undefined" &&
      !/[*^|]/.test(this.pattern.replace(/^\|{1,2}/, "").replace(/[|^]$/, ""));
  }

  /**
   * Regular expression to be used when testing against this pattern.
   *
   * null if the pattern is matched without using regular expressions.
   * @type {RegExp}
   */
  get regexp() {
    if (typeof this._regexp == "undefined") {
      this._regexp = this.isLiteralPattern() ?
        null : new RegExp(filterToRegExp(this.pattern));
    }
    return this._regexp;
  }

  /**
   * Pattern in regular expression notation. This will have a value
   * even if `regexp` returns null.
   * @type {string}
   */
  get regexpSource() {
    return this._regexp ? this._regexp.source : filterToRegExp(this.pattern);
  }

  /**
   * Checks whether the given URL request matches this filter's pattern.
   * @param {module:url.URLRequest} request The URL request to check.
   * @returns {boolean} `true` if the URL request matches.
   */
  matchesLocation(request) {
    let location = this.matchCase ? request.href : request.lowerCaseHref;
    let regexp = this.regexp;
    if (regexp) {
      return regexp.test(location);
    }

    let pattern = this.pattern;
    let startsWithAnchor = pattern[0] == "|";
    let startsWithExtendedAnchor = startsWithAnchor && pattern[1] == "|";
    let endsWithSeparator = pattern[pattern.length - 1] == "^";
    let endsWithAnchor = !endsWithSeparator &&
        pattern[pattern.length - 1] == "|";

    if (startsWithExtendedAnchor) {
      pattern = pattern.substr(2);
    }
    else if (startsWithAnchor) {
      pattern = pattern.substr(1);
    }

    if (endsWithSeparator || endsWithAnchor) {
      pattern = pattern.slice(0, -1);
    }

    let index = location.indexOf(pattern);

    while (index != -1) {
      // The "||" prefix requires that the text that follows does not start
      // with a forward slash.
      if ((startsWithExtendedAnchor ?
           location[index] != "/" &&
           extendedAnchorRegExp.test(location.substring(0, index)) :
           startsWithAnchor ?
           index == 0 :
           true) &&
          (endsWithSeparator ?
           !location[index + pattern.length] ||
           separatorRegExp.test(location[index + pattern.length]) :
           endsWithAnchor ?
           index == location.length - pattern.length :
           true)) {
        return true;
      }

      if (pattern == "") {
        return true;
      }

      index = location.indexOf(pattern, index + 1);
    }

    return false;
  }

  /**
   * Checks whether the pattern has keywords
   * @returns {boolean}
   */
  hasKeywords() {
    return this.pattern && keywordRegExp.test(this.pattern);
  }

  /**
   * Finds all keywords that could be associated with this pattern
   * @returns {string[]}
   */
  keywordCandidates() {
    if (!this.pattern) {
      return null;
    }
    return this.pattern.toLowerCase().match(allKeywordsRegExp);
  }
};


/***/ }),

/***/ 7795:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* @@package_name - v@@version - @@timestamp */
/* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set sts=2 sw=2 et tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) {
  throw new Error("This script should only be loaded in a browser extension.");
}

if (!(globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)) {
  const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
  const ERROR_TO_IGNORE = `A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received`;

  // Wrapping the bulk of this polyfill in a one-time-use function is a minor
  // optimization for Firefox. Since Spidermonkey does not fully parse the
  // contents of a function until the first time it's called, and since it will
  // never actually need to be called, this allows the polyfill to be included
  // in Firefox nearly for free.
  const wrapAPIs = extensionAPIs => {
    // NOTE: apiMetadata is associated to the content of the api-metadata.json file
    // at build time by replacing the following "include" with the content of the
    // JSON file.
    const apiMetadata = __webpack_require__(9438);

    if (Object.keys(apiMetadata).length === 0) {
      throw new Error("api-metadata.json has not been included in browser-polyfill");
    }

    /**
     * A WeakMap subclass which creates and stores a value for any key which does
     * not exist when accessed, but behaves exactly as an ordinary WeakMap
     * otherwise.
     *
     * @param {function} createItem
     *        A function which will be called in order to create the value for any
     *        key which does not exist, the first time it is accessed. The
     *        function receives, as its only argument, the key being created.
     */
    class DefaultWeakMap extends WeakMap {
      constructor(createItem, items = undefined) {
        super(items);
        this.createItem = createItem;
      }

      get(key) {
        if (!this.has(key)) {
          this.set(key, this.createItem(key));
        }

        return super.get(key);
      }
    }

    /**
     * Returns true if the given object is an object with a `then` method, and can
     * therefore be assumed to behave as a Promise.
     *
     * @param {*} value The value to test.
     * @returns {boolean} True if the value is thenable.
     */
    const isThenable = value => {
      return value && typeof value === "object" && typeof value.then === "function";
    };

    /**
     * Creates and returns a function which, when called, will resolve or reject
     * the given promise based on how it is called:
     *
     * - If, when called, `chrome.runtime.lastError` contains a non-null object,
     *   the promise is rejected with that value.
     * - If the function is called with exactly one argument, the promise is
     *   resolved to that value.
     * - Otherwise, the promise is resolved to an array containing all of the
     *   function's arguments.
     *
     * @param {object} promise
     *        An object containing the resolution and rejection functions of a
     *        promise.
     * @param {function} promise.resolve
     *        The promise's resolution function.
     * @param {function} promise.reject
     *        The promise's rejection function.
     * @param {object} metadata
     *        Metadata about the wrapped method which has created the callback.
     * @param {boolean} metadata.singleCallbackArg
     *        Whether or not the promise is resolved with only the first
     *        argument of the callback, alternatively an array of all the
     *        callback arguments is resolved. By default, if the callback
     *        function is invoked with only a single argument, that will be
     *        resolved to the promise, while all arguments will be resolved as
     *        an array if multiple are given.
     *
     * @returns {function}
     *        The generated callback function.
     */
    const makeCallback = (promise, metadata) => {
      // In case we encounter a browser error in the callback function, we don't
      // want to lose the stack trace leading up to this point. For that reason,
      // we need to instantiate the error outside the callback function.
      let error = new Error();
      return (...callbackArgs) => {
        if (extensionAPIs.runtime.lastError) {
          error.message = extensionAPIs.runtime.lastError.message;
          promise.reject(error);
        } else if (metadata.singleCallbackArg ||
                   (callbackArgs.length <= 1 && metadata.singleCallbackArg !== false)) {
          promise.resolve(callbackArgs[0]);
        } else {
          promise.resolve(callbackArgs);
        }
      };
    };

    const pluralizeArguments = (numArgs) => numArgs == 1 ? "argument" : "arguments";

    /**
     * Creates a wrapper function for a method with the given name and metadata.
     *
     * @param {string} name
     *        The name of the method which is being wrapped.
     * @param {object} metadata
     *        Metadata about the method being wrapped.
     * @param {integer} metadata.minArgs
     *        The minimum number of arguments which must be passed to the
     *        function. If called with fewer than this number of arguments, the
     *        wrapper will raise an exception.
     * @param {integer} metadata.maxArgs
     *        The maximum number of arguments which may be passed to the
     *        function. If called with more than this number of arguments, the
     *        wrapper will raise an exception.
     * @param {boolean} metadata.singleCallbackArg
     *        Whether or not the promise is resolved with only the first
     *        argument of the callback, alternatively an array of all the
     *        callback arguments is resolved. By default, if the callback
     *        function is invoked with only a single argument, that will be
     *        resolved to the promise, while all arguments will be resolved as
     *        an array if multiple are given.
     *
     * @returns {function(object, ...*)}
     *       The generated wrapper function.
     */
    const wrapAsyncFunction = (name, metadata) => {
      return function asyncFunctionWrapper(target, ...args) {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          if (metadata.fallbackToNoCallback) {
            // This API method has currently no callback on Chrome, but it return a promise on Firefox,
            // and so the polyfill will try to call it with a callback first, and it will fallback
            // to not passing the callback if the first call fails.
            try {
              target[name](...args, makeCallback({resolve, reject}, metadata));
            } catch (cbError) {
              console.warn(`${name} API method doesn't seem to support the callback parameter, ` +
                           "falling back to call it without a callback: ", cbError);

              target[name](...args);

              // Update the API method metadata, so that the next API calls will not try to
              // use the unsupported callback anymore.
              metadata.fallbackToNoCallback = false;
              metadata.noCallback = true;

              resolve();
            }
          } else if (metadata.noCallback) {
            target[name](...args);
            resolve();
          } else {
            target[name](...args, makeCallback({resolve, reject}, metadata));
          }
        });
      };
    };

    /**
     * Wraps an existing method of the target object, so that calls to it are
     * intercepted by the given wrapper function. The wrapper function receives,
     * as its first argument, the original `target` object, followed by each of
     * the arguments passed to the original method.
     *
     * @param {object} target
     *        The original target object that the wrapped method belongs to.
     * @param {function} method
     *        The method being wrapped. This is used as the target of the Proxy
     *        object which is created to wrap the method.
     * @param {function} wrapper
     *        The wrapper function which is called in place of a direct invocation
     *        of the wrapped method.
     *
     * @returns {Proxy<function>}
     *        A Proxy object for the given method, which invokes the given wrapper
     *        method in its place.
     */
    const wrapMethod = (target, method, wrapper) => {
      return new Proxy(method, {
        apply(targetMethod, thisObj, args) {
          return wrapper.call(thisObj, target, ...args);
        },
      });
    };

    let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);

    /**
     * Wraps an object in a Proxy which intercepts and wraps certain methods
     * based on the given `wrappers` and `metadata` objects.
     *
     * @param {object} target
     *        The target object to wrap.
     *
     * @param {object} [wrappers = {}]
     *        An object tree containing wrapper functions for special cases. Any
     *        function present in this object tree is called in place of the
     *        method in the same location in the `target` object tree. These
     *        wrapper methods are invoked as described in {@see wrapMethod}.
     *
     * @param {object} [metadata = {}]
     *        An object tree containing metadata used to automatically generate
     *        Promise-based wrapper functions for asynchronous. Any function in
     *        the `target` object tree which has a corresponding metadata object
     *        in the same location in the `metadata` tree is replaced with an
     *        automatically-generated wrapper function, as described in
     *        {@see wrapAsyncFunction}
     *
     * @returns {Proxy<object>}
     */
    const wrapObject = (target, wrappers = {}, metadata = {}) => {
      let cache = Object.create(null);
      let handlers = {
        has(proxyTarget, prop) {
          return prop in target || prop in cache;
        },

        get(proxyTarget, prop, receiver) {
          if (prop in cache) {
            return cache[prop];
          }

          if (!(prop in target)) {
            return undefined;
          }

          let value = target[prop];

          if (typeof value === "function") {
            // This is a method on the underlying object. Check if we need to do
            // any wrapping.

            if (typeof wrappers[prop] === "function") {
              // We have a special-case wrapper for this method.
              value = wrapMethod(target, target[prop], wrappers[prop]);
            } else if (hasOwnProperty(metadata, prop)) {
              // This is an async method that we have metadata for. Create a
              // Promise wrapper for it.
              let wrapper = wrapAsyncFunction(prop, metadata[prop]);
              value = wrapMethod(target, target[prop], wrapper);
            } else {
              // This is a method that we don't know or care about. Return the
              // original method, bound to the underlying object.
              value = value.bind(target);
            }
          } else if (typeof value === "object" && value !== null &&
                     (hasOwnProperty(wrappers, prop) ||
                      hasOwnProperty(metadata, prop))) {
            // This is an object that we need to do some wrapping for the children
            // of. Create a sub-object wrapper for it with the appropriate child
            // metadata.
            value = wrapObject(value, wrappers[prop], metadata[prop]);
          } else if (hasOwnProperty(metadata, "*")) {
            // Wrap all properties in * namespace.
            value = wrapObject(value, wrappers[prop], metadata["*"]);
          } else {
            // We don't need to do any wrapping for this property,
            // so just forward all access to the underlying object.
            Object.defineProperty(cache, prop, {
              configurable: true,
              enumerable: true,
              get() {
                return target[prop];
              },
              set(value) {
                target[prop] = value;
              },
            });

            return value;
          }

          cache[prop] = value;
          return value;
        },

        set(proxyTarget, prop, value, receiver) {
          if (prop in cache) {
            cache[prop] = value;
          } else {
            target[prop] = value;
          }
          return true;
        },

        defineProperty(proxyTarget, prop, desc) {
          return Reflect.defineProperty(cache, prop, desc);
        },

        deleteProperty(proxyTarget, prop) {
          return Reflect.deleteProperty(cache, prop);
        },
      };

      // Per contract of the Proxy API, the "get" proxy handler must return the
      // original value of the target if that value is declared read-only and
      // non-configurable. For this reason, we create an object with the
      // prototype set to `target` instead of using `target` directly.
      // Otherwise we cannot return a custom object for APIs that
      // are declared read-only and non-configurable, such as `chrome.devtools`.
      //
      // The proxy handlers themselves will still use the original `target`
      // instead of the `proxyTarget`, so that the methods and properties are
      // dereferenced via the original targets.
      let proxyTarget = Object.create(target);
      return new Proxy(proxyTarget, handlers);
    };

    /**
     * Creates a set of wrapper functions for an event object, which handles
     * wrapping of listener functions that those messages are passed.
     *
     * A single wrapper is created for each listener function, and stored in a
     * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
     * retrieve the original wrapper, so that  attempts to remove a
     * previously-added listener work as expected.
     *
     * @param {DefaultWeakMap<function, function>} wrapperMap
     *        A DefaultWeakMap object which will create the appropriate wrapper
     *        for a given listener function when one does not exist, and retrieve
     *        an existing one when it does.
     *
     * @returns {object}
     */
    const wrapEvent = wrapperMap => ({
      addListener(target, listener, ...args) {
        target.addListener(wrapperMap.get(listener), ...args);
      },

      hasListener(target, listener) {
        return target.hasListener(wrapperMap.get(listener));
      },

      removeListener(target, listener) {
        target.removeListener(wrapperMap.get(listener));
      },
    });

    const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
      if (typeof listener !== "function") {
        return listener;
      }

      /**
       * Wraps an onRequestFinished listener function so that it will return a
       * `getContent()` property which returns a `Promise` rather than using a
       * callback API.
       *
       * @param {object} req
       *        The HAR entry object representing the network request.
       */
      return function onRequestFinished(req) {
        const wrappedReq = wrapObject(req, {} /* wrappers */, {
          getContent: {
            minArgs: 0,
            maxArgs: 0,
          },
        });
        listener(wrappedReq);
      };
    });

    const onMessageWrappers = new DefaultWeakMap(listener => {
      if (typeof listener !== "function") {
        return listener;
      }

      /**
       * Wraps a message listener function so that it may send responses based on
       * its return value, rather than by returning a sentinel value and calling a
       * callback. If the listener function returns a Promise, the response is
       * sent when the promise either resolves or rejects.
       *
       * @param {*} message
       *        The message sent by the other end of the channel.
       * @param {object} sender
       *        Details about the sender of the message.
       * @param {function(*)} sendResponse
       *        A callback which, when called with an arbitrary argument, sends
       *        that value as a response.
       * @returns {boolean}
       *        True if the wrapped listener returned a Promise, which will later
       *        yield a response. False otherwise.
       */
      return function onMessage(message, sender, sendResponse) {
        let didCallSendResponse = false;

        let wrappedSendResponse;
        let sendResponsePromise = new Promise(resolve => {
          wrappedSendResponse = function(response) {
            didCallSendResponse = true;
            resolve(response);
          };
        });

        let result;
        try {
          result = listener(message, sender, wrappedSendResponse);
        } catch (err) {
          result = Promise.reject(err);
        }

        const isResultThenable = result !== true && isThenable(result);

        // If the listener didn't returned true or a Promise, or called
        // wrappedSendResponse synchronously, we can exit earlier
        // because there will be no response sent from this listener.
        if (result !== true && !isResultThenable && !didCallSendResponse) {
          return false;
        }

        // A small helper to send the message if the promise resolves
        // and an error if the promise rejects (a wrapped sendMessage has
        // to translate the message into a resolved promise or a rejected
        // promise).
        const sendPromisedResult = (promise) => {
          promise.then(msg => {
            // send the message value.
            sendResponse(msg);
          }, error => {
            // Send a JSON representation of the error if the rejected value
            // is an instance of error, or the object itself otherwise.
            let message;
            if (error && (error instanceof Error ||
                typeof error.message === "string")) {
              message = error.message;
            } else {
              message = "An unexpected error occurred";
            }

            sendResponse({
              __mozWebExtensionPolyfillReject__: true,
              message,
            });
          }).catch(err => {
            // Print an error on the console if unable to send the response.
            console.error("Failed to send onMessage rejected reply", err);
          });
        };

        // If the listener returned a Promise, send the resolved value as a
        // result, otherwise wait the promise related to the wrappedSendResponse
        // callback to resolve and send it as a response.
        if (isResultThenable) {
          sendPromisedResult(result);
        } else {
          sendPromisedResult(sendResponsePromise);
        }

        // Let Chrome know that the listener is replying.
        return true;
      };
    });

    const wrappedSendMessageCallback = ({reject, resolve}, reply) => {
      if (extensionAPIs.runtime.lastError) {
        // Detect when none of the listeners replied to the sendMessage call and resolve
        // the promise to undefined as in Firefox.
        // See https://github.com/mozilla/webextension-polyfill/issues/130
        if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE || extensionAPIs.runtime.lastError.message.includes(ERROR_TO_IGNORE)) {
          resolve();
        } else {
          reject(new Error(extensionAPIs.runtime.lastError.message));
        }
      } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
        // Convert back the JSON representation of the error into
        // an Error instance.
        reject(new Error(reply.message));
      } else {
        resolve(reply);
      }
    };

    const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
      if (args.length < metadata.minArgs) {
        throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
      }

      if (args.length > metadata.maxArgs) {
        throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
      }

      return new Promise((resolve, reject) => {
        const wrappedCb = wrappedSendMessageCallback.bind(null, {resolve, reject});
        args.push(wrappedCb);
        apiNamespaceObj.sendMessage(...args);
      });
    };

    const staticWrappers = {
      devtools: {
        network: {
          onRequestFinished: wrapEvent(onRequestFinishedWrappers),
        },
      },
      runtime: {
        onMessage: wrapEvent(onMessageWrappers),
        onMessageExternal: wrapEvent(onMessageWrappers),
        sendMessage: wrappedSendMessage.bind(null, "sendMessage", {minArgs: 1, maxArgs: 3}),
      },
      tabs: {
        sendMessage: wrappedSendMessage.bind(null, "sendMessage", {minArgs: 2, maxArgs: 3}),
      },
    };
    const settingMetadata = {
      clear: {minArgs: 1, maxArgs: 1},
      get: {minArgs: 1, maxArgs: 1},
      set: {minArgs: 1, maxArgs: 1},
    };
    apiMetadata.privacy = {
      network: {"*": settingMetadata},
      services: {"*": settingMetadata},
      websites: {"*": settingMetadata},
    };

    return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
  };

  // The build process adds a UMD wrapper around this file, which makes the
  // `module` variable available.
  module.exports = wrapAPIs(chrome);
} else {
  module.exports = globalThis.browser;
}


/***/ }),

/***/ 9438:
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"alarms":{"clear":{"minArgs":0,"maxArgs":1},"clearAll":{"minArgs":0,"maxArgs":0},"get":{"minArgs":0,"maxArgs":1},"getAll":{"minArgs":0,"maxArgs":0}},"bookmarks":{"create":{"minArgs":1,"maxArgs":1},"get":{"minArgs":1,"maxArgs":1},"getChildren":{"minArgs":1,"maxArgs":1},"getRecent":{"minArgs":1,"maxArgs":1},"getSubTree":{"minArgs":1,"maxArgs":1},"getTree":{"minArgs":0,"maxArgs":0},"move":{"minArgs":2,"maxArgs":2},"remove":{"minArgs":1,"maxArgs":1},"removeTree":{"minArgs":1,"maxArgs":1},"search":{"minArgs":1,"maxArgs":1},"update":{"minArgs":2,"maxArgs":2}},"browserAction":{"disable":{"minArgs":0,"maxArgs":1,"fallbackToNoCallback":true},"enable":{"minArgs":0,"maxArgs":1,"fallbackToNoCallback":true},"getBadgeBackgroundColor":{"minArgs":1,"maxArgs":1},"getBadgeText":{"minArgs":1,"maxArgs":1},"getPopup":{"minArgs":1,"maxArgs":1},"getTitle":{"minArgs":1,"maxArgs":1},"openPopup":{"minArgs":0,"maxArgs":0},"setBadgeBackgroundColor":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setBadgeText":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setIcon":{"minArgs":1,"maxArgs":1},"setPopup":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setTitle":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true}},"browsingData":{"remove":{"minArgs":2,"maxArgs":2},"removeCache":{"minArgs":1,"maxArgs":1},"removeCookies":{"minArgs":1,"maxArgs":1},"removeDownloads":{"minArgs":1,"maxArgs":1},"removeFormData":{"minArgs":1,"maxArgs":1},"removeHistory":{"minArgs":1,"maxArgs":1},"removeLocalStorage":{"minArgs":1,"maxArgs":1},"removePasswords":{"minArgs":1,"maxArgs":1},"removePluginData":{"minArgs":1,"maxArgs":1},"settings":{"minArgs":0,"maxArgs":0}},"commands":{"getAll":{"minArgs":0,"maxArgs":0}},"contextMenus":{"remove":{"minArgs":1,"maxArgs":1},"removeAll":{"minArgs":0,"maxArgs":0},"update":{"minArgs":2,"maxArgs":2}},"cookies":{"get":{"minArgs":1,"maxArgs":1},"getAll":{"minArgs":1,"maxArgs":1},"getAllCookieStores":{"minArgs":0,"maxArgs":0},"remove":{"minArgs":1,"maxArgs":1},"set":{"minArgs":1,"maxArgs":1}},"devtools":{"inspectedWindow":{"eval":{"minArgs":1,"maxArgs":2,"singleCallbackArg":false}},"panels":{"create":{"minArgs":3,"maxArgs":3,"singleCallbackArg":true},"elements":{"createSidebarPane":{"minArgs":1,"maxArgs":1}}}},"downloads":{"cancel":{"minArgs":1,"maxArgs":1},"download":{"minArgs":1,"maxArgs":1},"erase":{"minArgs":1,"maxArgs":1},"getFileIcon":{"minArgs":1,"maxArgs":2},"open":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"pause":{"minArgs":1,"maxArgs":1},"removeFile":{"minArgs":1,"maxArgs":1},"resume":{"minArgs":1,"maxArgs":1},"search":{"minArgs":1,"maxArgs":1},"show":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true}},"extension":{"isAllowedFileSchemeAccess":{"minArgs":0,"maxArgs":0},"isAllowedIncognitoAccess":{"minArgs":0,"maxArgs":0}},"history":{"addUrl":{"minArgs":1,"maxArgs":1},"deleteAll":{"minArgs":0,"maxArgs":0},"deleteRange":{"minArgs":1,"maxArgs":1},"deleteUrl":{"minArgs":1,"maxArgs":1},"getVisits":{"minArgs":1,"maxArgs":1},"search":{"minArgs":1,"maxArgs":1}},"i18n":{"detectLanguage":{"minArgs":1,"maxArgs":1},"getAcceptLanguages":{"minArgs":0,"maxArgs":0}},"identity":{"launchWebAuthFlow":{"minArgs":1,"maxArgs":1}},"idle":{"queryState":{"minArgs":1,"maxArgs":1}},"management":{"get":{"minArgs":1,"maxArgs":1},"getAll":{"minArgs":0,"maxArgs":0},"getSelf":{"minArgs":0,"maxArgs":0},"setEnabled":{"minArgs":2,"maxArgs":2},"uninstallSelf":{"minArgs":0,"maxArgs":1}},"notifications":{"clear":{"minArgs":1,"maxArgs":1},"create":{"minArgs":1,"maxArgs":2},"getAll":{"minArgs":0,"maxArgs":0},"getPermissionLevel":{"minArgs":0,"maxArgs":0},"update":{"minArgs":2,"maxArgs":2}},"pageAction":{"getPopup":{"minArgs":1,"maxArgs":1},"getTitle":{"minArgs":1,"maxArgs":1},"hide":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setIcon":{"minArgs":1,"maxArgs":1},"setPopup":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setTitle":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"show":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true}},"permissions":{"contains":{"minArgs":1,"maxArgs":1},"getAll":{"minArgs":0,"maxArgs":0},"remove":{"minArgs":1,"maxArgs":1},"request":{"minArgs":1,"maxArgs":1}},"runtime":{"getBackgroundPage":{"minArgs":0,"maxArgs":0},"getPlatformInfo":{"minArgs":0,"maxArgs":0},"openOptionsPage":{"minArgs":0,"maxArgs":0},"requestUpdateCheck":{"minArgs":0,"maxArgs":0},"sendMessage":{"minArgs":1,"maxArgs":3},"sendNativeMessage":{"minArgs":2,"maxArgs":2},"setUninstallURL":{"minArgs":1,"maxArgs":1}},"sessions":{"getDevices":{"minArgs":0,"maxArgs":1},"getRecentlyClosed":{"minArgs":0,"maxArgs":1},"restore":{"minArgs":0,"maxArgs":1}},"storage":{"local":{"clear":{"minArgs":0,"maxArgs":0},"get":{"minArgs":0,"maxArgs":1},"getBytesInUse":{"minArgs":0,"maxArgs":1},"remove":{"minArgs":1,"maxArgs":1},"set":{"minArgs":1,"maxArgs":1}},"managed":{"get":{"minArgs":0,"maxArgs":1},"getBytesInUse":{"minArgs":0,"maxArgs":1}},"sync":{"clear":{"minArgs":0,"maxArgs":0},"get":{"minArgs":0,"maxArgs":1},"getBytesInUse":{"minArgs":0,"maxArgs":1},"remove":{"minArgs":1,"maxArgs":1},"set":{"minArgs":1,"maxArgs":1}}},"tabs":{"captureVisibleTab":{"minArgs":0,"maxArgs":2},"create":{"minArgs":1,"maxArgs":1},"detectLanguage":{"minArgs":0,"maxArgs":1},"discard":{"minArgs":0,"maxArgs":1},"duplicate":{"minArgs":1,"maxArgs":1},"executeScript":{"minArgs":1,"maxArgs":2},"get":{"minArgs":1,"maxArgs":1},"getCurrent":{"minArgs":0,"maxArgs":0},"getZoom":{"minArgs":0,"maxArgs":1},"getZoomSettings":{"minArgs":0,"maxArgs":1},"goBack":{"minArgs":0,"maxArgs":1},"goForward":{"minArgs":0,"maxArgs":1},"highlight":{"minArgs":1,"maxArgs":1},"insertCSS":{"minArgs":1,"maxArgs":2},"move":{"minArgs":2,"maxArgs":2},"query":{"minArgs":1,"maxArgs":1},"reload":{"minArgs":0,"maxArgs":2},"remove":{"minArgs":1,"maxArgs":1},"removeCSS":{"minArgs":1,"maxArgs":2},"sendMessage":{"minArgs":2,"maxArgs":3},"setZoom":{"minArgs":1,"maxArgs":2},"setZoomSettings":{"minArgs":1,"maxArgs":2},"update":{"minArgs":1,"maxArgs":2}},"topSites":{"get":{"minArgs":0,"maxArgs":0}},"webNavigation":{"getAllFrames":{"minArgs":1,"maxArgs":1},"getFrame":{"minArgs":1,"maxArgs":1}},"webRequest":{"handlerBehaviorChanged":{"minArgs":0,"maxArgs":0}},"windows":{"create":{"minArgs":0,"maxArgs":1},"get":{"minArgs":1,"maxArgs":2},"getAll":{"minArgs":0,"maxArgs":1},"getCurrent":{"minArgs":0,"maxArgs":1},"getLastFocused":{"minArgs":0,"maxArgs":1},"remove":{"minArgs":1,"maxArgs":1},"update":{"minArgs":2,"maxArgs":2}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ../../vendor/webextension-polyfill/src/browser-polyfill.js
var browser_polyfill = __webpack_require__(7795);
// EXTERNAL MODULE: ./adblockpluscore/lib/content/elemHideEmulation.js
var elemHideEmulation = __webpack_require__(1267);
;// ./src/all/errors.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */

const ERROR_NO_CONNECTION = "Could not establish connection. " +
      "Receiving end does not exist.";
const ERROR_CLOSED_CONNECTION = "A listener indicated an asynchronous " +
      "response by returning true, but the message channel closed before a " +
      "response was received";
// https://bugzilla.mozilla.org/show_bug.cgi?id=1578697
const ERROR_MANAGER_DISCONNECTED = "Message manager disconnected";

/**
 * Reconstructs an error from a serializable error object
 *
 * @param {string} errorData - Error object
 *
 * @returns {Error} error
 */
function fromSerializableError(errorData) {
  const error = new Error(errorData.message);
  error.cause = errorData.cause;
  error.name = errorData.name;
  error.stack = errorData.stack;

  return error;
}

/**
 * Filters out `browser.runtime.sendMessage` errors to do with the receiving end
 * no longer existing.
 *
 * @param {Promise} promise The promise that should have "no connection" errors
 *   ignored. Generally this would be the promise returned by
 *   `browser.runtime.sendMessage`.
 * @return {Promise} The same promise, but will resolve with `undefined` instead
 *   of rejecting if the receiving end no longer exists.
 */
function ignoreNoConnectionError(promise) {
  return promise.catch(error => {
    if (typeof error == "object" &&
        (error.message == ERROR_NO_CONNECTION ||
         error.message == ERROR_CLOSED_CONNECTION ||
         error.message == ERROR_MANAGER_DISCONNECTED)) {
      return;
    }

    throw error;
  });
}

/**
 * Creates serializable error object from given error
 *
 * @param {Error} error - Error
 *
 * @returns {string} serializable error object
 */
function toSerializableError(error) {
  return {
    cause: error.cause instanceof Error ?
      toSerializableError(error.cause) :
      error.cause,
    message: error.message,
    name: error.name,
    stack: error.stack
  };
}

;// ./src/content/element-collapsing.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let collapsedSelectors = new Set();
let observers = new WeakMap();

function getURLFromElement(element) {
  if (element.localName == "object") {
    if (element.data) {
      return element.data;
    }

    for (let child of element.children) {
      if (child.localName == "param" && child.name == "movie" && child.value) {
        return new URL(child.value, document.baseURI).href;
      }
    }

    return null;
  }

  return element.currentSrc || element.src;
}

function getSelectorForBlockedElement(element) {
  // Setting the "display" CSS property to "none" doesn't have any effect on
  // <frame> elements (in framesets). So we have to hide it inline through
  // the "visibility" CSS property.
  if (element.localName == "frame") {
    return null;
  }

  // If the <video> or <audio> element contains any <source> children,
  // we cannot address it in CSS by the source URL; in that case we
  // don't "collapse" it using a CSS selector but rather hide it directly by
  // setting the style="..." attribute.
  if (element.localName == "video" || element.localName == "audio") {
    for (let child of element.children) {
      if (child.localName == "source") {
        return null;
      }
    }
  }

  let selector = "";
  for (let attr of ["src", "srcset"]) {
    let value = element.getAttribute(attr);
    if (value && attr in element) {
      selector += "[" + attr + "=" + CSS.escape(value) + "]";
    }
  }

  return selector ? element.localName + selector : null;
}

function hideElement(element, properties) {
  let {style} = element;

  if (!properties) {
    if (element.localName == "frame") {
      properties = [["visibility", "hidden"]];
    }
    else {
      properties = [["display", "none"]];
    }
  }

  for (let [key, value] of properties) {
    style.setProperty(key, value, "important");
  }

  if (observers.has(element)) {
    observers.get(element).disconnect();
  }

  let observer = new MutationObserver(() => {
    for (let [key, value] of properties) {
      if (style.getPropertyValue(key) != value ||
          style.getPropertyPriority(key) != "important") {
        style.setProperty(key, value, "important");
      }
    }
  });
  observer.observe(
    element, {
      attributes: true,
      attributeFilter: ["style"]
    }
  );
  observers.set(element, observer);
}

function unhideElement(element) {
  let observer = observers.get(element);
  if (observer) {
    observer.disconnect();
    observers.delete(element);
  }

  let property = element.localName == "frame" ? "visibility" : "display";
  element.style.removeProperty(property);
}

function collapseElement(element) {
  let selector = getSelectorForBlockedElement(element);
  if (!selector) {
    hideElement(element);
    return;
  }

  if (!collapsedSelectors.has(selector)) {
    ignoreNoConnectionError(
      browser_polyfill.runtime.sendMessage({
        type: "ewe:inject-css",
        selector
      })
    );
    collapsedSelectors.add(selector);
  }
}

function hideInAboutBlankFrames(selector, urls) {
  // Resources (e.g. images) loaded into about:blank frames
  // are (sometimes) loaded with the frameId of the main_frame.
  for (let frame of document.querySelectorAll("iframe[src='about:blank']")) {
    if (!frame.contentDocument) {
      continue;
    }

    for (let element of frame.contentDocument.querySelectorAll(selector)) {
      // Use hideElement, because we don't have the correct frameId
      // for the "ewe:inject-css" message.
      if (urls.has(getURLFromElement(element))) {
        hideElement(element);
      }
    }
  }
}

function startElementCollapsing() {
  let deferred = null;

  browser_polyfill.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type != "ewe:collapse") {
      return;
    }

    if (document.readyState == "loading") {
      if (!deferred) {
        deferred = new Map();
        document.addEventListener("DOMContentLoaded", () => {
          // Under some conditions a hostile script could try to trigger
          // the event again. Since we set deferred to `null`, then
          // we assume that we should just return instead of throwing
          // a TypeError.
          if (!deferred) {
            return;
          }

          for (let [selector, urls] of deferred) {
            for (let element of document.querySelectorAll(selector)) {
              if (urls.has(getURLFromElement(element))) {
                collapseElement(element);
              }
            }

            hideInAboutBlankFrames(selector, urls);
          }

          deferred = null;
        });
      }

      let urls = deferred.get(message.selector) || new Set();
      deferred.set(message.selector, urls);
      urls.add(message.url);
    }
    else {
      for (let element of document.querySelectorAll(message.selector)) {
        if (getURLFromElement(element) == message.url) {
          collapseElement(element);
        }
      }

      hideInAboutBlankFrames(message.selector, new Set([message.url]));
    }
    return false;
  });
}

;// ./src/content/allowlisting.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const MAX_ERROR_THRESHOLD = 30;
const MAX_QUEUED_EVENTS = 20;
const EVENT_INTERVAL_MS = 100;

let errorCount = 0;
let eventProcessingInterval = null;
let eventProcessingInProgress = false;
let eventQueue = [];

function isEventTrusted(event) {
  return Object.getPrototypeOf(event) === CustomEvent.prototype &&
    !Object.hasOwnProperty.call(event, "detail");
}

async function allowlistDomain(event) {
  if (!isEventTrusted(event)) {
    return false;
  }

  return ignoreNoConnectionError(
    browser_polyfill.runtime.sendMessage({
      type: "ewe:allowlist-page",
      timestamp: event.detail.timestamp,
      signature: event.detail.signature,
      options: event.detail.options
    })
  );
}

async function processNextEvent() {
  if (eventProcessingInProgress) {
    return;
  }

  try {
    eventProcessingInProgress = true;
    let event = eventQueue.shift();
    if (event) {
      try {
        let allowlistingResult = await allowlistDomain(event);
        if (allowlistingResult === true) {
          document.dispatchEvent(new Event("domain_allowlisting_success"));
          stopOneClickAllowlisting();
        }
        else {
          throw new Error("Domain allowlisting rejected");
        }
      }
      catch (e) {
        errorCount++;
        if (errorCount >= MAX_ERROR_THRESHOLD) {
          stopOneClickAllowlisting();
        }
      }
    }

    if (!eventQueue.length) {
      stopProcessingInterval();
    }
  }
  finally {
    eventProcessingInProgress = false;
  }
}

function onDomainAllowlistingRequest(event) {
  if (eventQueue.length >= MAX_QUEUED_EVENTS) {
    return;
  }

  eventQueue.push(event);
  startProcessingInterval();
}

function startProcessingInterval() {
  if (!eventProcessingInterval) {
    processNextEvent();
    eventProcessingInterval = setInterval(processNextEvent, EVENT_INTERVAL_MS);
  }
}

function stopProcessingInterval() {
  clearInterval(eventProcessingInterval);
  eventProcessingInterval = null;
}

function stopOneClickAllowlisting() {
  document.removeEventListener("domain_allowlisting_request",
                               onDomainAllowlistingRequest, true);
  eventQueue = [];
  stopProcessingInterval();
}

function startOneClickAllowlisting() {
  document.addEventListener("domain_allowlisting_request",
                            onDomainAllowlistingRequest, true);
}

;// ./src/content/element-hiding-tracer.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




class ElementHidingTracer {
  constructor(selectors) {
    this.selectors = new Map(selectors);

    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      setTimeout(() => this.trace(), 1000);
    });

    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", () => this.trace());
    }
    else {
      this.trace();
    }
  }

  log(filters, selectors = []) {
    ignoreNoConnectionError(browser_polyfill.runtime.sendMessage(
      {type: "ewe:trace-elem-hide", filters, selectors}
    ));
  }

  trace() {
    let filters = [];
    let selectors = [];

    for (let [selector, filter] of this.selectors) {
      try {
        if (document.querySelector(selector)) {
          this.selectors.delete(selector);
          if (filter) {
            filters.push(filter);
          }
          else {
            selectors.push(selector);
          }
        }
      }
      catch (e) {
        console.error(e.toString());
      }
    }

    if (filters.length > 0 || selectors.length > 0) {
      this.log(filters, selectors);
    }

    this.observer.observe(document, {childList: true,
                                     attributes: true,
                                     subtree: true});
  }

  disconnect() {
    this.observer.disconnect();
  }
}

;// ./src/content/subscribe-links.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const ALLOWED_DOMAINS = new Set([
  "abpchina.org",
  "abpindo.blogspot.com",
  "abpvn.com",
  "adblock.ee",
  "adblock.gardar.net",
  "adblockplus.me",
  "adblockplus.org",
  "abptestpages.org",
  "commentcamarche.net",
  "droit-finances.commentcamarche.com",
  "easylist.to",
  "eyeo.com",
  "fanboy.co.nz",
  "filterlists.com",
  "forums.lanik.us",
  "gitee.com",
  "gitee.io",
  "github.com",
  "github.io",
  "gitlab.com",
  "gitlab.io",
  "gurud.ee",
  "hugolescargot.com",
  "i-dont-care-about-cookies.eu",
  "journaldesfemmes.fr",
  "journaldunet.com",
  "linternaute.com",
  "spam404.com",
  "stanev.org",
  "void.gr",
  "xfiles.noads.it",
  "zoso.ro"
]);

function isDomainAllowed(domain) {
  if (domain.endsWith(".")) {
    domain = domain.substring(0, domain.length - 1);
  }

  while (true) {
    if (ALLOWED_DOMAINS.has(domain)) {
      return true;
    }
    let index = domain.indexOf(".");
    if (index == -1) {
      return false;
    }
    domain = domain.substr(index + 1);
  }
}

function subscribeLinksEnabled(url) {
  let {protocol, hostname} = new URL(url);
  return hostname == "localhost" ||
    protocol == "https:" && isDomainAllowed(hostname);
}

function handleSubscribeLinks() {
  document.addEventListener("click", event => {
    if (event.button == 2 || !event.isTrusted) {
      return;
    }

    let link = event.target;
    while (!(link instanceof HTMLAnchorElement)) {
      link = link.parentNode;

      if (!link) {
        return;
      }
    }

    let queryString = null;
    if (link.protocol == "http:" || link.protocol == "https:") {
      if (link.host == "subscribe.adblockplus.org" && link.pathname == "/") {
        queryString = link.search.substr(1);
      }
    }
    else {
      // Firefox doesn't seem to populate the "search" property for
      // links with non-standard URL schemes so we need to extract the query
      // string manually.
      let match = /^abp:\/*subscribe\/*\?(.*)/i.exec(link.href);
      if (match) {
        queryString = match[1];
      }
    }

    if (!queryString) {
      return;
    }

    let title = null;
    let url = null;
    for (let param of queryString.split("&")) {
      let parts = param.split("=", 2);
      if (parts.length != 2 || !/\S/.test(parts[1])) {
        continue;
      }
      switch (parts[0]) {
        case "title":
          title = decodeURIComponent(parts[1]);
          break;
        case "location":
          url = decodeURIComponent(parts[1]);
          break;
      }
    }
    if (!url) {
      return;
    }

    if (!title) {
      title = url;
    }

    title = title.trim();
    url = url.trim();
    if (!/^(https?|ftp):/.test(url)) {
      return;
    }

    ignoreNoConnectionError(
      browser_polyfill.runtime.sendMessage({type: "ewe:subscribe-link-clicked",
                                   title, url})
    );

    event.preventDefault();
    event.stopPropagation();
  }, true);
}

;// ./src/content/cdp-session.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let isActive = false;

function notifyActive() {
  if (isActive) {
    ignoreNoConnectionError(
      browser_polyfill.runtime.sendMessage({
        type: "ewe:cdp-session-active"
      })
    );
    isActive = false;
  }
  scheduleCheckActive();
}

function scheduleCheckActive() {
  setTimeout(notifyActive, 1000);
}

function markActive() {
  isActive = true;
}

function startNotifyActive() {
  scheduleCheckActive();

  document.addEventListener("scroll", markActive, true);
  document.addEventListener("click", markActive);
  document.addEventListener("keypress", markActive, true);
}

;// ../../node_modules/uuid/dist/esm-browser/native.js
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const esm_browser_native = ({
  randomUUID
});
;// ../../node_modules/uuid/dist/esm-browser/rng.js
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}
;// ../../node_modules/uuid/dist/esm-browser/stringify.js

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const esm_browser_stringify = ((/* unused pure expression or super */ null && (stringify)));
;// ../../node_modules/uuid/dist/esm-browser/v4.js




function v4(options, buf, offset) {
  if (esm_browser_native.randomUUID && !buf && !options) {
    return esm_browser_native.randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return unsafeStringify(rnds);
}

/* harmony default export */ const esm_browser_v4 = (v4);
;// ./src/content/blockthrough-tag.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */






let sessionId = null;

function onBTAADetectionEvent(event) {
  if (!sessionId) {
    sessionId = esm_browser_v4();
  }

  ignoreNoConnectionError(
    browser_polyfill.runtime.sendMessage({
      type: "ewe:blockthrough-acceptable-ads-detection-event",
      details: {
        ab: event.detail.ab,
        acceptable: event.detail.acceptable,
        sessionId
      }
    })
  );
}

function startWatchingBlockthroughTag() {
  window.addEventListener("BTAADetection", onBTAADetectionEvent);
}

;// ./src/content/safari-history.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




function startSafariHistory() {
// It receives a message from injected in Safari `history.pushState()`
// and forwards it to web extension background script.
  window.addEventListener(
    "message",
    event => {
      if (!event.isTrusted) {
        return;
      }

      if (event && event.data &&
        event.data.type === "ewe:safari-onhistorystateupdated-content") {
        return ignoreNoConnectionError(
          browser_polyfill.runtime.sendMessage({
            type: "ewe:safari-onhistorystateupdated",
            event: event.data.event
          })
        );
      }
    },
    false
  );
}

;// ./src/content/index.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */














let tracer;
let content_elemHideEmulation;

async function initContentFeatures() {
  if (subscribeLinksEnabled(window.location.href)) {
    handleSubscribeLinks();
  }

  let response = await ignoreNoConnectionError(
    browser_polyfill.runtime.sendMessage({type: "ewe:content-hello"})
  );

  if (response) {
    await applyContentFeatures(response);
  }
}

async function removeContentFeatures() {
  if (tracer) {
    tracer.disconnect();
  }
}

async function applyContentFeatures(response) {
  if (response.tracedSelectors) {
    tracer = new ElementHidingTracer(response.tracedSelectors);
  }

  const hideElements = (elements, filters) => {
    for (let element of elements) {
      hideElement(element, response.cssProperties);
    }

    if (tracer) {
      tracer.log(filters);
    }
  };

  const unhideElements = elements => {
    for (let element of elements) {
      unhideElement(element);
    }
  };

  const removeElements = (elements, filters) => {
    for (const element of elements) {
      element.remove();
    }

    if (tracer) {
      tracer.log(filters);
    }
  };

  const applyInlineCSS = (elements, cssPatterns) => {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const pattern = cssPatterns[i];

      for (const [key, value] of Object.entries(pattern.css)) {
        element.style.setProperty(key, value, "important");
      }
    }

    if (tracer) {
      const filterTexts = cssPatterns.map(pattern => pattern.text);
      tracer.log(filterTexts);
    }
  };

  if (response.emulatedPatterns.length > 0) {
    if (!content_elemHideEmulation) {
      content_elemHideEmulation = new elemHideEmulation/* ElemHideEmulation */.WX(hideElements, unhideElements,
                                                removeElements, applyInlineCSS);
    }
    content_elemHideEmulation.apply(response.emulatedPatterns);
  }
  else if (content_elemHideEmulation) {
    content_elemHideEmulation.apply(response.emulatedPatterns);
  }

  if (response.notifyActive) {
    startNotifyActive();
  }
}

function onMessage(message) {
  if (typeof message == "object" && message != null &&
    message.type && message.type == "ewe:apply-content-features") {
    removeContentFeatures();
    applyContentFeatures(message);
  }
}
browser_polyfill.runtime.onMessage.addListener(onMessage);

startSafariHistory();
startElementCollapsing();
startOneClickAllowlisting();
initContentFeatures();
startWatchingBlockthroughTag();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyxrQ0FBa0M7QUFDM0M7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGdCQUFnQixVQUFVLG9CQUFvQjtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFF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QjtBQUM5QjtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxrQkFBa0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQjtBQUN0Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLDJCQUEyQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFNEM7QUFDYTs7QUFFekQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVPO0FBQ1AsT0FBTyxPQUFPOztBQUVkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSSx1QkFBdUI7QUFDM0IsTUFBTSx3QkFBZTtBQUNyQjtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQOztBQUVBLEVBQUUsd0JBQWU7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7O0FB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ekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyx5QkFBaUI7QUFDMUIsTUFBTSx5QkFBaUIsT0FBTywyQ0FBaUI7QUFDL0M7QUFDQTtBQUNBLElBQUkseUJBQWlCO0FBQ3JCO0FBQ0EsV0FBVyx5QkFBaUI7QUFDNUIsSUFBSSx5QkFBaUI7QUFDckI7O0FBRUE7QUFDQSxJQUFJLGlCQUFpQjtBQUNyQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQWU7O0FBRWYsa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0Qix5QkFBeUI7QUFDekI7QUFDQSw0QkFBNEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vYWRibG9ja3BsdXNjb3JlL2xpYi9jb21tb24uanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uL2FkYmxvY2twbHVzY29yZS9saWIvY29udGVudC9lbGVtSGlkZUVtdWxhdGlvbi5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vYWRibG9ja3BsdXNjb3JlL2xpYi9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4uLy4uL3ZlbmRvci93ZWJleHRlbnNpb24tcG9seWZpbGwvc3JjL2Jyb3dzZXItcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vc3JjL2FsbC9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uL3NyYy9jb250ZW50L2VsZW1lbnQtY29sbGFwc2luZy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vc3JjL2NvbnRlbnQvYWxsb3dsaXN0aW5nLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9zcmMvY29udGVudC9lbGVtZW50LWhpZGluZy10cmFjZXIuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uL3NyYy9jb250ZW50L3N1YnNjcmliZS1saW5rcy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vc3JjL2NvbnRlbnQvY2RwLXNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uLi8uLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL25hdGl2ZS5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4uLy4uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcm5nLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi4vLi4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9zdHJpbmdpZnkuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uLi8uLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3Y0LmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9zcmMvY29udGVudC9ibG9ja3Rocm91Z2gtdGFnLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9zcmMvY29udGVudC9zYWZhcmktaGlzdG9yeS5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vc3JjL2NvbnRlbnQvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEFkYmxvY2sgUGx1cyA8aHR0cHM6Ly9hZGJsb2NrcGx1cy5vcmcvPixcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBBZGJsb2NrIFBsdXMuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyoqIEBtb2R1bGUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCB0ZXh0VG9SZWdFeHAgPVxuLyoqXG4gKiBDb252ZXJ0cyByYXcgdGV4dCBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgdGhlIHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJuIHtzdHJpbmd9IHJlZ3VsYXIgZXhwcmVzc2lvbiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGV4dFxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy50ZXh0VG9SZWdFeHAgPSB0ZXh0ID0+IHRleHQucmVwbGFjZSgvWy0vXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIik7XG5cbmNvbnN0IHJlZ2V4cFJlZ2V4cCA9IC9eXFwvKC4qKVxcLyhbaW11XSopJC87XG5cbi8qKlxuICogTWFrZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmcm9tIGEgdGV4dCBhcmd1bWVudC5cbiAqXG4gKiBJZiBpdCBjYW4gYmUgcGFyc2VkIGFzIGEgcmVndWxhciBleHByZXNzaW9uLCBwYXJzZSBpdCBhbmQgdGhlIGZsYWdzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IHRoZSB0ZXh0IGFyZ3VtZW50LlxuICpcbiAqIEByZXR1cm4gez9SZWdFeHB9IGEgUmVnRXhwIG9iamVjdCBvciBudWxsIGluIGNhc2Ugb2YgZXJyb3IuXG4gKi9cbmV4cG9ydHMubWFrZVJlZ0V4cFBhcmFtZXRlciA9IGZ1bmN0aW9uIG1ha2VSZWdFeHBQYXJhbWV0ZXIodGV4dCkge1xuICBsZXQgWywgc291cmNlLCBmbGFnc10gPSByZWdleHBSZWdleHAuZXhlYyh0ZXh0KSB8fCBbbnVsbCwgdGV4dFRvUmVnRXhwKHRleHQpXTtcblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgZmxhZ3MpO1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbmxldCBzcGxpdFNlbGVjdG9yID0gZXhwb3J0cy5zcGxpdFNlbGVjdG9yID0gZnVuY3Rpb24gc3BsaXRTZWxlY3RvcihzZWxlY3Rvcikge1xuICBpZiAoIXNlbGVjdG9yLmluY2x1ZGVzKFwiLFwiKSkge1xuICAgIHJldHVybiBbc2VsZWN0b3JdO1xuICB9XG5cbiAgbGV0IHNlbGVjdG9ycyA9IFtdO1xuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgbGV2ZWwgPSAwO1xuICBsZXQgc2VwID0gXCJcIjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNociA9IHNlbGVjdG9yW2ldO1xuXG4gICAgLy8gaWdub3JlIGVzY2FwZWQgY2hhcmFjdGVyc1xuICAgIGlmIChjaHIgPT0gXCJcXFxcXCIpIHtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgLy8gZG9uJ3Qgc3BsaXQgd2l0aGluIHF1b3RlZCB0ZXh0XG4gICAgZWxzZSBpZiAoY2hyID09IHNlcCkge1xuICAgICAgc2VwID0gXCJcIjsgICAgICAgICAgICAgLy8gZS5nLiBbYXR0cj1cIixcIl1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2VwID09IFwiXCIpIHtcbiAgICAgIGlmIChjaHIgPT0gJ1wiJyB8fCBjaHIgPT0gXCInXCIpIHtcbiAgICAgICAgc2VwID0gY2hyO1xuICAgICAgfVxuICAgICAgLy8gZG9uJ3Qgc3BsaXQgYmV0d2VlbiBwYXJlbnRoZXNlc1xuICAgICAgZWxzZSBpZiAoY2hyID09IFwiKFwiKSB7XG4gICAgICAgIGxldmVsKys7ICAgICAgICAgICAgLy8gZS5nLiA6bWF0Y2hlcyhkaXYsc3BhbilcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGNociA9PSBcIilcIikge1xuICAgICAgICBsZXZlbCA9IE1hdGgubWF4KDAsIGxldmVsIC0gMSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHIgPT0gXCIsXCIgJiYgbGV2ZWwgPT0gMCkge1xuICAgICAgICBzZWxlY3RvcnMucHVzaChzZWxlY3Rvci5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZWxlY3RvcnMucHVzaChzZWxlY3Rvci5zdWJzdHJpbmcoc3RhcnQpKTtcbiAgcmV0dXJuIHNlbGVjdG9ycztcbn07XG5cbmZ1bmN0aW9uIGZpbmRUYXJnZXRTZWxlY3RvckluZGV4KHNlbGVjdG9yKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIGxldCB3aGl0ZXNwYWNlID0gMDtcbiAgbGV0IHNjb3BlID0gW107XG5cbiAgLy8gU3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgYW5kIGdvIGNoYXJhY3RlciBieSBjaGFyYWN0ZXIsIHdoZXJlIGVhY2hcbiAgLy8gY2hhcmFjdGVyIGlzIGEgVW5pY29kZSBjb2RlIHBvaW50LlxuICBmb3IgKGxldCBjaGFyYWN0ZXIgb2YgWy4uLnNlbGVjdG9yXS5yZXZlcnNlKCkpIHtcbiAgICBsZXQgY3VycmVudFNjb3BlID0gc2NvcGVbc2NvcGUubGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoY2hhcmFjdGVyID09IFwiJ1wiIHx8IGNoYXJhY3RlciA9PSBcIlxcXCJcIikge1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSB3aXRoaW4gdGhlIHNhbWUgdHlwZSBvZiBxdW90ZSwgY2xvc2UgdGhlIHNjb3BlO1xuICAgICAgLy8gb3RoZXJ3aXNlIG9wZW4gYSBuZXcgc2NvcGUuXG4gICAgICBpZiAoY3VycmVudFNjb3BlID09IGNoYXJhY3Rlcikge1xuICAgICAgICBzY29wZS5wb3AoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzY29wZS5wdXNoKGNoYXJhY3Rlcik7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PSBcIl1cIiB8fCBjaGFyYWN0ZXIgPT0gXCIpXCIpIHtcbiAgICAgIC8vIEZvciBjbG9zaW5nIGJyYWNrZXRzIGFuZCBwYXJlbnRoZXNlcywgb3BlbiBhIG5ldyBzY29wZSBvbmx5IGlmIHdlJ3JlXG4gICAgICAvLyBub3Qgd2l0aGluIGEgcXVvdGUuIFdpdGhpbiBxdW90ZXMgdGhlc2UgY2hhcmFjdGVycyBzaG91bGQgaGF2ZSBub1xuICAgICAgLy8gbWVhbmluZy5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgIT0gXCInXCIgJiYgY3VycmVudFNjb3BlICE9IFwiXFxcIlwiKSB7XG4gICAgICAgIHNjb3BlLnB1c2goY2hhcmFjdGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoY2hhcmFjdGVyID09IFwiW1wiKSB7XG4gICAgICAvLyBJZiB3ZSdyZSBhbHJlYWR5IHdpdGhpbiBhIGJyYWNrZXQsIGNsb3NlIHRoZSBzY29wZS5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgPT0gXCJdXCIpIHtcbiAgICAgICAgc2NvcGUucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PSBcIihcIikge1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSB3aXRoaW4gYSBwYXJlbnRoZXNpcywgY2xvc2UgdGhlIHNjb3BlLlxuICAgICAgaWYgKGN1cnJlbnRTY29wZSA9PSBcIilcIikge1xuICAgICAgICBzY29wZS5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIWN1cnJlbnRTY29wZSkge1xuICAgICAgLy8gQXQgdGhlIHRvcCBsZXZlbCAobm90IHdpdGhpbiBhbnkgc2NvcGUpLCBjb3VudCB0aGUgd2hpdGVzcGFjZSBpZiB3ZSd2ZVxuICAgICAgLy8gZW5jb3VudGVyZWQgaXQuIE90aGVyd2lzZSBpZiB3ZSd2ZSBoaXQgb25lIG9mIHRoZSBjb21iaW5hdG9ycyxcbiAgICAgIC8vIHRlcm1pbmF0ZSBoZXJlOyBvdGhlcndpc2UgaWYgd2UndmUgaGl0IGEgbm9uLWNvbG9uIGNoYXJhY3RlcixcbiAgICAgIC8vIHRlcm1pbmF0ZSBoZXJlLlxuICAgICAgaWYgKC9cXHMvLnRlc3QoY2hhcmFjdGVyKSkge1xuICAgICAgICB3aGl0ZXNwYWNlKys7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICgoY2hhcmFjdGVyID09IFwiPlwiIHx8IGNoYXJhY3RlciA9PSBcIitcIiB8fCBjaGFyYWN0ZXIgPT0gXCJ+XCIpIHx8XG4gICAgICAgICAgICAgICAod2hpdGVzcGFjZSA+IDAgJiYgY2hhcmFjdGVyICE9IFwiOlwiKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBaZXJvIG91dCB0aGUgd2hpdGVzcGFjZSBjb3VudCBpZiB3ZSd2ZSBlbnRlcmVkIGEgc2NvcGUuXG4gICAgaWYgKHNjb3BlLmxlbmd0aCA+IDApIHtcbiAgICAgIHdoaXRlc3BhY2UgPSAwO1xuICAgIH1cblxuICAgIC8vIEluY3JlbWVudCB0aGUgaW5kZXggYnkgdGhlIHNpemUgb2YgdGhlIGNoYXJhY3Rlci4gTm90ZSB0aGF0IGZvciBVbmljb2RlXG4gICAgLy8gY29tcG9zaXRlIGNoYXJhY3RlcnMgKGxpa2UgZW1vamkpIHRoaXMgd2lsbCBiZSBtb3JlIHRoYW4gb25lLlxuICAgIGluZGV4ICs9IGNoYXJhY3Rlci5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3IubGVuZ3RoIC0gaW5kZXggKyB3aGl0ZXNwYWNlO1xufVxuXG4vKipcbiAqIFF1YWxpZmllcyBhIENTUyBzZWxlY3RvciB3aXRoIGEgcXVhbGlmaWVyLCB3aGljaCBtYXkgYmUgYW5vdGhlciBDU1Mgc2VsZWN0b3JcbiAqIG9yIGFuIGVtcHR5IHN0cmluZy4gRm9yIGV4YW1wbGUsIGdpdmVuIHRoZSBzZWxlY3RvciBcImRpdi5iYXJcIiBhbmQgdGhlXG4gKiBxdWFsaWZpZXIgXCIjZm9vXCIsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBcImRpdiNmb28uYmFyXCIuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIHRvIHF1YWxpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcXVhbGlmaWVyIFRoZSBxdWFsaWZpZXIgd2l0aCB3aGljaCB0byBxdWFsaWZ5IHRoZSBzZWxlY3Rvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBxdWFsaWZpZWQgc2VsZWN0b3IuXG4gKiBAcGFja2FnZVxuICovXG5leHBvcnRzLnF1YWxpZnlTZWxlY3RvciA9IGZ1bmN0aW9uIHF1YWxpZnlTZWxlY3RvcihzZWxlY3RvciwgcXVhbGlmaWVyKSB7XG4gIGxldCBxdWFsaWZpZWRTZWxlY3RvciA9IFwiXCI7XG5cbiAgbGV0IHF1YWxpZmllclRhcmdldFNlbGVjdG9ySW5kZXggPSBmaW5kVGFyZ2V0U2VsZWN0b3JJbmRleChxdWFsaWZpZXIpO1xuICBsZXQgWywgcXVhbGlmaWVyVHlwZSA9IFwiXCJdID1cbiAgICAvXihbYS16XVthLXotXSopPy9pLmV4ZWMocXVhbGlmaWVyLnN1YnN0cmluZyhxdWFsaWZpZXJUYXJnZXRTZWxlY3RvckluZGV4KSk7XG5cbiAgZm9yIChsZXQgc3ViIG9mIHNwbGl0U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgc3ViID0gc3ViLnRyaW0oKTtcblxuICAgIHF1YWxpZmllZFNlbGVjdG9yICs9IFwiLCBcIjtcblxuICAgIGxldCBpbmRleCA9IGZpbmRUYXJnZXRTZWxlY3RvckluZGV4KHN1Yik7XG5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIGZpcnN0IGdyb3VwIGluIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gaXMgb3B0aW9uYWwuIElmIGl0XG4gICAgLy8gZG9lc24ndCBtYXRjaCAoZS5nLiBcIiNmb286Om50aC1jaGlsZCgxKVwiKSwgdHlwZSB3aWxsIGJlIGFuIGVtcHR5IHN0cmluZy5cbiAgICBsZXQgWywgdHlwZSA9IFwiXCIsIHJlc3RdID1cbiAgICAgIC9eKFthLXpdW2Etei1dKik/XFwqPyguKikvaS5leGVjKHN1Yi5zdWJzdHJpbmcoaW5kZXgpKTtcblxuICAgIGlmICh0eXBlID09IHF1YWxpZmllclR5cGUpIHtcbiAgICAgIHR5cGUgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBxdWFsaWZpZXIgZW5kcyBpbiBhIGNvbWJpbmF0b3IgKGUuZy4gXCJib2R5ICNmb28+XCIpLCB3ZSBwdXQgdGhlXG4gICAgLy8gdHlwZSBhbmQgdGhlIHJlc3Qgb2YgdGhlIHNlbGVjdG9yIGFmdGVyIHRoZSBxdWFsaWZpZXJcbiAgICAvLyAoZS5nLiBcImJvZHkgI2Zvbz5kaXYuYmFyXCIpOyBvdGhlcndpc2UgKGUuZy4gXCJib2R5ICNmb29cIikgd2UgbWVyZ2UgdGhlXG4gICAgLy8gdHlwZSBpbnRvIHRoZSBxdWFsaWZpZXIgKGUuZy4gXCJib2R5IGRpdiNmb28uYmFyXCIpLlxuICAgIGlmICgvW1xccz4rfl0kLy50ZXN0KHF1YWxpZmllcikpIHtcbiAgICAgIHF1YWxpZmllZFNlbGVjdG9yICs9IHN1Yi5zdWJzdHJpbmcoMCwgaW5kZXgpICsgcXVhbGlmaWVyICsgdHlwZSArIHJlc3Q7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcXVhbGlmaWVkU2VsZWN0b3IgKz0gc3ViLnN1YnN0cmluZygwLCBpbmRleCkgKyB0eXBlICsgcXVhbGlmaWVyICsgcmVzdDtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIGluaXRpYWwgY29tbWEgYW5kIHNwYWNlLlxuICByZXR1cm4gcXVhbGlmaWVkU2VsZWN0b3Iuc3Vic3RyaW5nKDIpO1xufTtcbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBBZGJsb2NrIFBsdXMgPGh0dHBzOi8vYWRibG9ja3BsdXMub3JnLz4sXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggQWRibG9jayBQbHVzLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qKiBAbW9kdWxlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7bWFrZVJlZ0V4cFBhcmFtZXRlciwgc3BsaXRTZWxlY3RvcixcbiAgICAgICBxdWFsaWZ5U2VsZWN0b3J9ID0gcmVxdWlyZShcIi4uL2NvbW1vblwiKTtcbmNvbnN0IHtmaWx0ZXJUb1JlZ0V4cH0gPSByZXF1aXJlKFwiLi4vcGF0dGVybnNcIik7XG5cbmNvbnN0IERFRkFVTFRfTUlOX0lOVk9DQVRJT05fSU5URVJWQUwgPSAzMDAwO1xubGV0IG1pbkludm9jYXRpb25JbnRlcnZhbCA9IERFRkFVTFRfTUlOX0lOVk9DQVRJT05fSU5URVJWQUw7XG5jb25zdCBERUZBVUxUX01BWF9TWUNIUk9OT1VTX1BST0NFU1NJTkdfVElNRSA9IDUwO1xubGV0IG1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgPSBERUZBVUxUX01BWF9TWUNIUk9OT1VTX1BST0NFU1NJTkdfVElNRTtcblxuY29uc3QgYWJwU2VsZWN0b3JSZWdleHAgPSAvOigtYWJwLVtcXHctXSt8aGFzfGhhcy10ZXh0fHhwYXRofG5vdClcXCgvO1xuXG5sZXQgdGVzdEluZm8gPSBudWxsO1xuXG5mdW5jdGlvbiB0b0NTU1N0eWxlRGVjbGFyYXRpb24odmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlc3RcIiksIHtzdHlsZTogdmFsdWV9KS5zdHlsZTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIHRlc3QgbW9kZSwgd2hpY2ggdHJhY2tzIGFkZGl0aW9uYWwgbWV0YWRhdGEgYWJvdXQgdGhlIGlubmVyXG4gKiB3b3JraW5ncyBmb3IgdGVzdCBwdXJwb3Nlcy4gVGhpcyBhbHNvIGFsbG93cyBvdmVycmlkaW5nIGludGVybmFsXG4gKiBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5taW5JbnZvY2F0aW9uSW50ZXJ2YWwgT3ZlcnJpZGVzIGhvdyBsb25nXG4gKiAgIG11c3QgYmUgd2FpdGVkIGJldHdlZW4gZmlsdGVyIHByb2Nlc3NpbmcgcnVuc1xuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSBPdmVycmlkZXMgaG93XG4gKiAgIGxvbmcgdGhlIHRocmVhZCBtYXkgc3BlbmQgcHJvY2Vzc2luZyBmaWx0ZXJzIGJlZm9yZSBpdCBtdXN0IHlpZWxkXG4gKiAgIGl0cyB0aHJlYWRcbiAqL1xuZXhwb3J0cy5zZXRUZXN0TW9kZSA9IGZ1bmN0aW9uIHNldFRlc3RNb2RlKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLm1pbkludm9jYXRpb25JbnRlcnZhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1pbkludm9jYXRpb25JbnRlcnZhbCA9IG9wdGlvbnMubWluSW52b2NhdGlvbkludGVydmFsO1xuICB9XG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5tYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSA9IG9wdGlvbnMubWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZTtcbiAgfVxuXG4gIHRlc3RJbmZvID0ge1xuICAgIGxhc3RQcm9jZXNzZWRFbGVtZW50czogbmV3IFNldCgpLFxuICAgIGZhaWxlZEFzc2VydGlvbnM6IFtdXG4gIH07XG59O1xuXG5leHBvcnRzLmdldFRlc3RJbmZvID0gZnVuY3Rpb24gZ2V0VGVzdEluZm8oKSB7XG4gIHJldHVybiB0ZXN0SW5mbztcbn07XG5cbmV4cG9ydHMuY2xlYXJUZXN0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgPSBERUZBVUxUX01JTl9JTlZPQ0FUSU9OX0lOVEVSVkFMO1xuICBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lID0gREVGQVVMVF9NQVhfU1lDSFJPTk9VU19QUk9DRVNTSU5HX1RJTUU7XG4gIHRlc3RJbmZvID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBJZGxlRGVhZGxpbmUuXG4gKlxuICogTm90ZTogVGhpcyBmdW5jdGlvbiBpcyBzeW5jaHJvbm91cyBhbmQgZG9lcyBOT1QgcmVxdWVzdCBhbiBpZGxlXG4gKiBjYWxsYmFjay5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9JZGxlRGVhZGxpbmV9LlxuICogQHJldHVybiB7SWRsZURlYWRsaW5lfVxuICovXG5mdW5jdGlvbiBuZXdJZGxlRGVhZGxpbmUoKSB7XG4gIGxldCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgcmV0dXJuIHtcbiAgICBkaWRUaW1lb3V0OiBmYWxzZSxcbiAgICB0aW1lUmVtYWluaW5nKCkge1xuICAgICAgbGV0IGVsYXBzZWQgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgIGxldCByZW1haW5pbmcgPSBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lIC0gZWxhcHNlZDtcbiAgICAgIHJldHVybiBNYXRoLm1heCgwLCByZW1haW5pbmcpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGJyb3dzZXIgaXMgbmV4dCBpZGxlLlxuICpcbiAqIFRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBmb3IgbG9uZyBydW5uaW5nIHRhc2tzIG9uIHRoZSBVSSB0aHJlYWRcbiAqIHRvIGFsbG93IG90aGVyIFVJIGV2ZW50cyB0byBwcm9jZXNzLlxuICpcbiAqIEByZXR1cm4ge1Byb21pc2UuPElkbGVEZWFkbGluZT59XG4gKiAgICBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiB5b3UgY2FuIGNvbnRpbnVlIHByb2Nlc3NpbmdcbiAqL1xuZnVuY3Rpb24geWllbGRUaHJlYWQoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBpZiAodHlwZW9mIHJlcXVlc3RJZGxlQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmVxdWVzdElkbGVDYWxsYmFjayhyZXNvbHZlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZShuZXdJZGxlRGVhZGxpbmUoKSk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIGdldENhY2hlZFByb3BlcnR5VmFsdWUob2JqZWN0LCBuYW1lLCBkZWZhdWx0VmFsdWVGdW5jID0gKCkgPT4ge30pIHtcbiAgbGV0IHZhbHVlID0gb2JqZWN0W25hbWVdO1xuICBpZiAodHlwZW9mIHZhbHVlID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7dmFsdWU6IHZhbHVlID0gZGVmYXVsdFZhbHVlRnVuYygpfSk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIFJldHVybiBwb3NpdGlvbiBvZiBub2RlIGZyb20gcGFyZW50LlxuICogQHBhcmFtIHtOb2RlfSBub2RlIHRoZSBub2RlIHRvIGZpbmQgdGhlIHBvc2l0aW9uIG9mLlxuICogQHJldHVybiB7bnVtYmVyfSBPbmUtYmFzZWQgaW5kZXggbGlrZSBmb3IgOm50aC1jaGlsZCgpLCBvciAwIG9uIGVycm9yLlxuICovXG5mdW5jdGlvbiBwb3NpdGlvbkluUGFyZW50KG5vZGUpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgZm9yIChsZXQgY2hpbGQgb2Ygbm9kZS5wYXJlbnROb2RlLmNoaWxkcmVuKSB7XG4gICAgaWYgKGNoaWxkID09IG5vZGUpIHtcbiAgICAgIHJldHVybiBpbmRleCArIDE7XG4gICAgfVxuXG4gICAgaW5kZXgrKztcbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBtYWtlU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IgPSBcIlwiKSB7XG4gIGlmIChub2RlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoIW5vZGUucGFyZW50RWxlbWVudCkge1xuICAgIGxldCBuZXdTZWxlY3RvciA9IFwiOnJvb3RcIjtcbiAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgIG5ld1NlbGVjdG9yICs9IFwiID4gXCIgKyBzZWxlY3RvcjtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1NlbGVjdG9yO1xuICB9XG4gIGxldCBpZHggPSBwb3NpdGlvbkluUGFyZW50KG5vZGUpO1xuICBpZiAoaWR4ID4gMCkge1xuICAgIGxldCBuZXdTZWxlY3RvciA9IGAke25vZGUudGFnTmFtZX06bnRoLWNoaWxkKCR7aWR4fSlgO1xuICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgbmV3U2VsZWN0b3IgKz0gXCIgPiBcIiArIHNlbGVjdG9yO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVNlbGVjdG9yKG5vZGUucGFyZW50RWxlbWVudCwgbmV3U2VsZWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGVjdG9yO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlbGVjdG9yQ29udGVudChjb250ZW50LCBzdGFydEluZGV4KSB7XG4gIGxldCBwYXJlbnMgPSAxO1xuICBsZXQgcXVvdGUgPSBudWxsO1xuICBsZXQgaSA9IHN0YXJ0SW5kZXg7XG4gIGZvciAoOyBpIDwgY29udGVudC5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjID0gY29udGVudFtpXTtcbiAgICBpZiAoYyA9PSBcIlxcXFxcIikge1xuICAgICAgLy8gSWdub3JlIGVzY2FwZWQgY2hhcmFjdGVyc1xuICAgICAgaSsrO1xuICAgIH1cbiAgICBlbHNlIGlmIChxdW90ZSkge1xuICAgICAgaWYgKGMgPT0gcXVvdGUpIHtcbiAgICAgICAgcXVvdGUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjID09IFwiJ1wiIHx8IGMgPT0gJ1wiJykge1xuICAgICAgcXVvdGUgPSBjO1xuICAgIH1cbiAgICBlbHNlIGlmIChjID09IFwiKFwiKSB7XG4gICAgICBwYXJlbnMrKztcbiAgICB9XG4gICAgZWxzZSBpZiAoYyA9PSBcIilcIikge1xuICAgICAgcGFyZW5zLS07XG4gICAgICBpZiAocGFyZW5zID09IDApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcmVucyA+IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge3RleHQ6IGNvbnRlbnQuc3Vic3RyaW5nKHN0YXJ0SW5kZXgsIGkpLCBlbmQ6IGl9O1xufVxuXG4vKipcbiAqIFN0cmluZ2lmaWVkIHN0eWxlIG9iamVjdHNcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFN0cmluZ2lmaWVkU3R5bGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdHlsZSBDU1Mgc3R5bGUgcmVwcmVzZW50ZWQgYnkgYSBzdHJpbmcuXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdfSBzdWJTZWxlY3RvcnMgc2VsZWN0b3JzIHRoZSBDU1MgcHJvcGVydGllcyBhcHBseSB0by5cbiAqL1xuXG4vKipcbiAqIFByb2R1Y2UgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHN0eWxlc2hlZXQgZW50cnkuXG4gKiBAcGFyYW0ge0NTU1N0eWxlUnVsZX0gcnVsZSB0aGUgQ1NTIHN0eWxlIHJ1bGUuXG4gKiBAcmV0dXJuIHtTdHJpbmdpZmllZFN0eWxlfSB0aGUgc3RyaW5naWZpZWQgc3R5bGUuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0eWxlKHJ1bGUpIHtcbiAgbGV0IHN0eWxlcyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGUuc3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgcHJvcGVydHkgPSBydWxlLnN0eWxlLml0ZW0oaSk7XG4gICAgbGV0IHZhbHVlID0gcnVsZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KTtcbiAgICBsZXQgcHJpb3JpdHkgPSBydWxlLnN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkocHJvcGVydHkpO1xuICAgIHN0eWxlcy5wdXNoKGAke3Byb3BlcnR5fTogJHt2YWx1ZX0ke3ByaW9yaXR5ID8gXCIgIVwiICsgcHJpb3JpdHkgOiBcIlwifTtgKTtcbiAgfVxuICBzdHlsZXMuc29ydCgpO1xuICByZXR1cm4ge1xuICAgIHN0eWxlOiBzdHlsZXMuam9pbihcIiBcIiksXG4gICAgc3ViU2VsZWN0b3JzOiBzcGxpdFNlbGVjdG9yKHJ1bGUuc2VsZWN0b3JUZXh0KVxuICB9O1xufVxuXG5sZXQgc2NvcGVTdXBwb3J0ZWQgPSBudWxsO1xuXG5mdW5jdGlvbiB0cnlRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCBhbGwpIHtcbiAgbGV0IGVsZW1lbnRzID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBlbGVtZW50cyA9IGFsbCA/IHN1YnRyZWUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOlxuICAgICAgc3VidHJlZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBzY29wZVN1cHBvcnRlZCA9IHRydWU7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICAvLyBFZGdlIGRvZXNuJ3Qgc3VwcG9ydCBcIjpzY29wZVwiXG4gICAgc2NvcGVTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gZWxlbWVudHM7XG59XG5cbi8qKlxuICogUXVlcnkgc2VsZWN0b3IuXG4gKlxuICogSWYgaXQgaXMgcmVsYXRpdmUsIHdpbGwgdHJ5IDpzY29wZS5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIGVsZW1lbnQgdG8gcXVlcnkgc2VsZWN0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gcXVlcnlcbiAqIEBwYXJhbSB7Ym9vbH0gW2FsbD1mYWxzZV0gdHJ1ZSB0byBwZXJmb3JtIHF1ZXJ5U2VsZWN0b3JBbGwoKVxuICpcbiAqIEByZXR1cm5zIHs/KE5vZGV8Tm9kZUxpc3QpfSByZXN1bHQgb2YgdGhlIHF1ZXJ5LiBudWxsIGluIGNhc2Ugb2YgZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHNjb3BlZFF1ZXJ5U2VsZWN0b3Ioc3VidHJlZSwgc2VsZWN0b3IsIGFsbCkge1xuICBpZiAoc2VsZWN0b3JbMF0gPT0gXCI+XCIpIHtcbiAgICBzZWxlY3RvciA9IFwiOnNjb3BlXCIgKyBzZWxlY3RvcjtcbiAgICBpZiAoc2NvcGVTdXBwb3J0ZWQpIHtcbiAgICAgIHJldHVybiBhbGwgPyBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDpcbiAgICAgICAgc3VidHJlZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9XG4gICAgaWYgKHNjb3BlU3VwcG9ydGVkID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnlRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCBhbGwpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gYWxsID8gc3VidHJlZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6XG4gICAgc3VidHJlZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBzZWxlY3Rvcikge1xuICByZXR1cm4gc2NvcGVkUXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgdHJ1ZSk7XG59XG5cbmNsYXNzIFBsYWluU2VsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihzZWxlY3Rvcikge1xuICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMgPSAvWyMuOl18XFxbLitcXF0vLnRlc3Qoc2VsZWN0b3IpO1xuICAgIHRoaXMubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycyA9IC9bfitdLy50ZXN0KHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIGEgcGFpciBvZiBzZWxlY3RvciBzdHJpbmcgYW5kIHN1YnRyZWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdGhlIHByZWZpeCBmb3IgdGhlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvbi5cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIHlpZWxkIFtwcmVmaXggKyB0aGlzLl9zZWxlY3Rvciwgc3VidHJlZV07XG4gIH1cbn1cblxuY29uc3QgaW5jb21wbGV0ZVByZWZpeFJlZ2V4cCA9IC9bXFxzPit+XSQvO1xuXG5jbGFzcyBOb3RTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybiA9IG5ldyBQYXR0ZXJuKHNlbGVjdG9ycyk7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uU3R5bGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uU3R5bGVzO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPbkNoYXJhY3RlckRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhO1xuICB9XG5cbiAgZ2V0IG1heWJlRGVwZW5kc09uQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcztcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpIHtcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIGVsZW1lbnRdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIHNlbGVjdGVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRoZSBwcmVmaXggZm9yIHRoZSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb24uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKi9cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBhY3R1YWxQcmVmaXggPSAoIXByZWZpeCB8fCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSkgP1xuICAgICAgcHJlZml4ICsgXCIqXCIgOiBwcmVmaXg7XG4gICAgbGV0IGVsZW1lbnRzID0gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBhY3R1YWxQcmVmaXgpO1xuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBuZWl0aGVyIGFuIGFuY2VzdG9yIG5vciBhIGRlc2NlbmRhbnQgb2Ygb25lIG9mIHRoZVxuICAgICAgICAvLyB0YXJnZXRzLCB3ZSBjYW4gc2tpcCBpdC5cbiAgICAgICAgaWYgKHRhcmdldHMgJiYgIXRhcmdldHMuc29tZSh0YXJnZXQgPT4gZWxlbWVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jb250YWlucyhlbGVtZW50KSkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faW5uZXJQYXR0ZXJuLm1hdGNoZXMoZWxlbWVudCwgc3VidHJlZSkpIHtcbiAgICAgICAgICB5aWVsZCBlbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgdGhpcy5faW5uZXJQYXR0ZXJuLnNldFN0eWxlcyhzdHlsZXMpO1xuICB9XG59XG5cbmNsYXNzIEhhc1NlbGVjdG9yIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgdGhpcy5faW5uZXJQYXR0ZXJuID0gbmV3IFBhdHRlcm4oc2VsZWN0b3JzKTtcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25TdHlsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25TdHlsZXM7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLmRlcGVuZHNPbkNoYXJhY3RlckRhdGE7XG4gIH1cblxuICBnZXQgbWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4ubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSkge1xuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgZWxlbWVudF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRvciBmdW5jdGlvbiByZXR1cm5pbmcgc2VsZWN0ZWQgZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdGhlIHByZWZpeCBmb3IgdGhlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvbi5cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICAqZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IGFjdHVhbFByZWZpeCA9ICghcHJlZml4IHx8IGluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKSA/XG4gICAgICBwcmVmaXggKyBcIipcIiA6IHByZWZpeDtcbiAgICBsZXQgZWxlbWVudHMgPSBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIGFjdHVhbFByZWZpeCk7XG4gICAgaWYgKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIG5laXRoZXIgYW4gYW5jZXN0b3Igbm9yIGEgZGVzY2VuZGFudCBvZiBvbmUgb2YgdGhlXG4gICAgICAgIC8vIHRhcmdldHMsIHdlIGNhbiBza2lwIGl0LlxuICAgICAgICBpZiAodGFyZ2V0cyAmJiAhdGFyZ2V0cy5zb21lKHRhcmdldCA9PiBlbGVtZW50LmNvbnRhaW5zKHRhcmdldCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNvbnRhaW5zKGVsZW1lbnQpKSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVzdEluZm8pIHtcbiAgICAgICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgc2VsZWN0b3Igb2YgdGhpcy5faW5uZXJQYXR0ZXJuLmV2YWx1YXRlKGVsZW1lbnQsIHRhcmdldHMpKSB7XG4gICAgICAgICAgaWYgKHNlbGVjdG9yID09IG51bGwpIHtcbiAgICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKHNjb3BlZFF1ZXJ5U2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICB5aWVsZCBlbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHlpZWxkIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybi5zZXRTdHlsZXMoc3R5bGVzKTtcbiAgfVxufVxuXG5jbGFzcyBYUGF0aFNlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IodGV4dENvbnRlbnQpIHtcbiAgICB0aGlzLmRlcGVuZHNPbkNoYXJhY3RlckRhdGEgPSB0cnVlO1xuICAgIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzID0gdHJ1ZTtcblxuICAgIGxldCBldmFsdWF0b3IgPSBuZXcgWFBhdGhFdmFsdWF0b3IoKTtcbiAgICB0aGlzLl9leHByZXNzaW9uID0gZXZhbHVhdG9yLmNyZWF0ZUV4cHJlc3Npb24odGV4dENvbnRlbnQsIG51bGwpO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSkge1xuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgZWxlbWVudF07XG4gICAgfVxuICB9XG5cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCB7T1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEU6IGZsYWd9ID0gWFBhdGhSZXN1bHQ7XG4gICAgbGV0IGVsZW1lbnRzID0gcHJlZml4ID8gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBwcmVmaXgpIDogW3N1YnRyZWVdO1xuICAgIGZvciAobGV0IHBhcmVudCBvZiBlbGVtZW50cykge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuX2V4cHJlc3Npb24uZXZhbHVhdGUocGFyZW50LCBmbGFnLCBudWxsKTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCB7c25hcHNob3RMZW5ndGh9ID0gcmVzdWx0OyBpIDwgc25hcHNob3RMZW5ndGg7IGkrKykge1xuICAgICAgICB5aWVsZCByZXN1bHQuc25hcHNob3RJdGVtKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDb250YWluc1NlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IodGV4dENvbnRlbnQpIHtcbiAgICB0aGlzLmRlcGVuZHNPbkNoYXJhY3RlckRhdGEgPSB0cnVlO1xuXG4gICAgdGhpcy5fcmVnZXhwID0gbWFrZVJlZ0V4cFBhcmFtZXRlcih0ZXh0Q29udGVudCk7XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5nZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpKSB7XG4gICAgICB5aWVsZCBbbWFrZVNlbGVjdG9yKGVsZW1lbnQpLCBzdWJ0cmVlXTtcbiAgICB9XG4gIH1cblxuICAqZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IGFjdHVhbFByZWZpeCA9ICghcHJlZml4IHx8IGluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKSA/XG4gICAgICBwcmVmaXggKyBcIipcIiA6IHByZWZpeDtcblxuICAgIGxldCBlbGVtZW50cyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgYWN0dWFsUHJlZml4KTtcblxuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgbGV0IGxhc3RSb290ID0gbnVsbDtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgLy8gRm9yIGEgZmlsdGVyIGxpa2UgZGl2Oi1hYnAtY29udGFpbnMoSGVsbG8pIGFuZCBhIHN1YnRyZWUgbGlrZVxuICAgICAgICAvLyA8ZGl2IGlkPVwiYVwiPjxkaXYgaWQ9XCJiXCI+PGRpdiBpZD1cImNcIj5IZWxsbzwvZGl2PjwvZGl2PjwvZGl2PlxuICAgICAgICAvLyB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gZGl2I2FcbiAgICAgICAgaWYgKGxhc3RSb290ICYmIGxhc3RSb290LmNvbnRhaW5zKGVsZW1lbnQpKSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RSb290ID0gZWxlbWVudDtcblxuICAgICAgICBpZiAodGFyZ2V0cyAmJiAhdGFyZ2V0cy5zb21lKHRhcmdldCA9PiBlbGVtZW50LmNvbnRhaW5zKHRhcmdldCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNvbnRhaW5zKGVsZW1lbnQpKSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVzdEluZm8pIHtcbiAgICAgICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlZ2V4cCAmJiB0aGlzLl9yZWdleHAudGVzdChlbGVtZW50LnRleHRDb250ZW50KSkge1xuICAgICAgICAgIHlpZWxkIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBQcm9wc1NlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJvcGVydHlFeHByZXNzaW9uKSB7XG4gICAgdGhpcy5kZXBlbmRzT25TdHlsZXMgPSB0cnVlO1xuICAgIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzID0gdHJ1ZTtcblxuICAgIGxldCByZWdleHBTdHJpbmc7XG4gICAgaWYgKHByb3BlcnR5RXhwcmVzc2lvbi5sZW5ndGggPj0gMiAmJiBwcm9wZXJ0eUV4cHJlc3Npb25bMF0gPT0gXCIvXCIgJiZcbiAgICAgICAgcHJvcGVydHlFeHByZXNzaW9uW3Byb3BlcnR5RXhwcmVzc2lvbi5sZW5ndGggLSAxXSA9PSBcIi9cIikge1xuICAgICAgcmVnZXhwU3RyaW5nID0gcHJvcGVydHlFeHByZXNzaW9uLnNsaWNlKDEsIC0xKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZWdleHBTdHJpbmcgPSBmaWx0ZXJUb1JlZ0V4cChwcm9wZXJ0eUV4cHJlc3Npb24pO1xuICAgIH1cblxuICAgIHRoaXMuX3JlZ2V4cCA9IG5ldyBSZWdFeHAocmVnZXhwU3RyaW5nLCBcImlcIik7XG5cbiAgICB0aGlzLl9zdWJTZWxlY3RvcnMgPSBbXTtcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgc3ViU2VsZWN0b3Igb2YgdGhpcy5fc3ViU2VsZWN0b3JzKSB7XG4gICAgICBpZiAoc3ViU2VsZWN0b3Iuc3RhcnRzV2l0aChcIipcIikgJiZcbiAgICAgICAgICAhaW5jb21wbGV0ZVByZWZpeFJlZ2V4cC50ZXN0KHByZWZpeCkpIHtcbiAgICAgICAgc3ViU2VsZWN0b3IgPSBzdWJTZWxlY3Rvci5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIHlpZWxkIFtxdWFsaWZ5U2VsZWN0b3Ioc3ViU2VsZWN0b3IsIHByZWZpeCksIHN1YnRyZWVdO1xuICAgIH1cbiAgfVxuXG4gIHNldFN0eWxlcyhzdHlsZXMpIHtcbiAgICB0aGlzLl9zdWJTZWxlY3RvcnMgPSBbXTtcbiAgICBmb3IgKGxldCBzdHlsZSBvZiBzdHlsZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZWdleHAudGVzdChzdHlsZS5zdHlsZSkpIHtcbiAgICAgICAgZm9yIChsZXQgc3ViU2VsZWN0b3Igb2Ygc3R5bGUuc3ViU2VsZWN0b3JzKSB7XG4gICAgICAgICAgbGV0IGlkeCA9IHN1YlNlbGVjdG9yLmxhc3RJbmRleE9mKFwiOjpcIik7XG4gICAgICAgICAgaWYgKGlkeCAhPSAtMSkge1xuICAgICAgICAgICAgc3ViU2VsZWN0b3IgPSBzdWJTZWxlY3Rvci5zdWJzdHJpbmcoMCwgaWR4KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9zdWJTZWxlY3RvcnMucHVzaChzdWJTZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUGF0dGVybiB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycywgdGV4dCwgcmVtb3ZlID0gZmFsc2UsIGNzcyA9IG51bGwpIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIHRoaXMucmVtb3ZlID0gcmVtb3ZlO1xuICAgIHRoaXMuY3NzID0gY3NzO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPblN0eWxlcygpIHtcbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX2RlcGVuZHNPblN0eWxlc1wiLCAoKSA9PiB0aGlzLnNlbGVjdG9ycy5zb21lKFxuICAgICAgICBzZWxlY3RvciA9PiBzZWxlY3Rvci5kZXBlbmRzT25TdHlsZXNcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0IG1heWJlRGVwZW5kc09uQXR0cmlidXRlcygpIHtcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgdG8gYXR0cmlidXRlcyBpZiBlaXRoZXIgdGhlcmUncyBhIHBsYWluIHNlbGVjdG9yIHRoYXRcbiAgICAvLyBsb29rcyBsaWtlIGFuIElEIHNlbGVjdG9yLCBjbGFzcyBzZWxlY3Rvciwgb3IgYXR0cmlidXRlIHNlbGVjdG9yIGluIG9uZVxuICAgIC8vIG9mIHRoZSBwYXR0ZXJucyAoZS5nLiBcImFbaHJlZj0naHR0cHM6Ly9leGFtcGxlLmNvbS8nXVwiKVxuICAgIC8vIG9yIHRoZXJlJ3MgYSBwcm9wZXJ0aWVzIHNlbGVjdG9yIG5lc3RlZCBpbnNpZGUgYSBoYXMgc2VsZWN0b3JcbiAgICAvLyAoZS5nLiBcImRpdjotYWJwLWhhcyg6LWFicC1wcm9wZXJ0aWVzKGNvbG9yOiBibHVlKSlcIilcbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX21heWJlRGVwZW5kc09uQXR0cmlidXRlc1wiLCAoKSA9PiB0aGlzLnNlbGVjdG9ycy5zb21lKFxuICAgICAgICBzZWxlY3RvciA9PiBzZWxlY3Rvci5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHNlbGVjdG9yIGluc3RhbmNlb2YgSGFzU2VsZWN0b3IgJiZcbiAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLmRlcGVuZHNPblN0eWxlcylcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPbkNoYXJhY3RlckRhdGEoKSB7XG4gICAgLy8gT2JzZXJ2ZSBjaGFuZ2VzIHRvIGNoYXJhY3RlciBkYXRhIG9ubHkgaWYgdGhlcmUncyBhIGNvbnRhaW5zIHNlbGVjdG9yIGluXG4gICAgLy8gb25lIG9mIHRoZSBwYXR0ZXJucy5cbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX2RlcGVuZHNPbkNoYXJhY3RlckRhdGFcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IuZGVwZW5kc09uQ2hhcmFjdGVyRGF0YVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXQgbWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycygpIHtcbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX21heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnNcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9yc1xuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBtYXRjaGVzTXV0YXRpb25UeXBlcyhtdXRhdGlvblR5cGVzKSB7XG4gICAgbGV0IG11dGF0aW9uVHlwZU1hdGNoTWFwID0gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX211dGF0aW9uVHlwZU1hdGNoTWFwXCIsICgpID0+IG5ldyBNYXAoW1xuICAgICAgICAvLyBBbGwgdHlwZXMgb2YgRE9NLWRlcGVuZGVudCBwYXR0ZXJucyBhcmUgYWZmZWN0ZWQgYnkgbXV0YXRpb25zIG9mXG4gICAgICAgIC8vIHR5cGUgXCJjaGlsZExpc3RcIi5cbiAgICAgICAgW1wiY2hpbGRMaXN0XCIsIHRydWVdLFxuICAgICAgICBbXCJhdHRyaWJ1dGVzXCIsIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzXSxcbiAgICAgICAgW1wiY2hhcmFjdGVyRGF0YVwiLCB0aGlzLmRlcGVuZHNPbkNoYXJhY3RlckRhdGFdXG4gICAgICBdKVxuICAgICk7XG5cbiAgICBmb3IgKGxldCBtdXRhdGlvblR5cGUgb2YgbXV0YXRpb25UeXBlcykge1xuICAgICAgaWYgKG11dGF0aW9uVHlwZU1hdGNoTWFwLmdldChtdXRhdGlvblR5cGUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIENTUyBzZWxlY3RvcnMgZm9yIGFsbCBlbGVtZW50cyB0aGF0XG4gICAqIG1hdGNoIHRoZSBwYXR0ZXJuLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB0cmFuc2Zvcm1pbmcgZnJvbSBzZWxlY3RvcnMgdGhhdCBtYXkgY29udGFpbiBjdXN0b21cbiAgICogOi1hYnAtIHNlbGVjdG9ycyB0byBwdXJlIENTUyBzZWxlY3RvcnMgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWxlY3RcbiAgICogZWxlbWVudHMuXG4gICAqXG4gICAqIFRoZSBzZWxlY3RvcnMgcmV0dXJuZWQgZnJvbSB0aGlzIGZ1bmN0aW9uIG1heSBiZSBpbnZhbGlkYXRlZCBieSBET01cbiAgICogbXV0YXRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvblxuICAgKiBAcGFyYW0ge05vZGVbXX0gW3RhcmdldHNdIHRoZSBub2RlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi4gTWF5IGJlXG4gICAqIHVzZWQgdG8gb3B0aW1pemUgc2VhcmNoLlxuICAgKi9cbiAgKmV2YWx1YXRlKHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQgc2VsZWN0b3JzID0gdGhpcy5zZWxlY3RvcnM7XG4gICAgZnVuY3Rpb24qIGV2YWx1YXRlSW5uZXIoaW5kZXgsIHByZWZpeCwgY3VycmVudFN1YnRyZWUpIHtcbiAgICAgIGlmIChpbmRleCA+PSBzZWxlY3RvcnMubGVuZ3RoKSB7XG4gICAgICAgIHlpZWxkIHByZWZpeDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgW3NlbGVjdG9yLCBlbGVtZW50XSBvZiBzZWxlY3RvcnNbaW5kZXhdLmdldFNlbGVjdG9ycyhcbiAgICAgICAgcHJlZml4LCBjdXJyZW50U3VidHJlZSwgdGFyZ2V0c1xuICAgICAgKSkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgPT0gbnVsbCkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgeWllbGQqIGV2YWx1YXRlSW5uZXIoaW5kZXggKyAxLCBzZWxlY3RvciwgZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEp1c3QgaW4gY2FzZSB0aGUgZ2V0U2VsZWN0b3JzKCkgZ2VuZXJhdG9yIGFib3ZlIGhhZCB0byBydW4gc29tZSBoZWF2eVxuICAgICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgpIGNhbGwgd2hpY2ggZGlkbid0IHByb2R1Y2UgYW55IHJlc3VsdHMsIG1ha2VcbiAgICAgIC8vIHN1cmUgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHBvaW50IHdoZXJlIGV4ZWN1dGlvbiBjYW4gcGF1c2UuXG4gICAgICB5aWVsZCBudWxsO1xuICAgIH1cbiAgICB5aWVsZCogZXZhbHVhdGVJbm5lcigwLCBcIlwiLCBzdWJ0cmVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSBwYXR0ZXJuIG1hdGNoZXMgYSBzcGVjaWZpYyBlbGVtZW50XG4gICAqIEBwYXJhbSB7Tm9kZX0gW3RhcmdldF0gdGhlIGVsZW1lbnQgd2UncmUgaW50ZXJlc3RlZCBpbiBjaGVja2luZyBmb3JcbiAgICogbWF0Y2hlcyBvbi5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb25cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIG1hdGNoZXModGFyZ2V0LCBzdWJ0cmVlKSB7XG4gICAgbGV0IHRhcmdldEZpbHRlciA9IFt0YXJnZXRdO1xuICAgIGlmICh0aGlzLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMpIHtcbiAgICAgIHRhcmdldEZpbHRlciA9IG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHNlbGVjdG9yR2VuZXJhdG9yID0gdGhpcy5ldmFsdWF0ZShzdWJ0cmVlLCB0YXJnZXRGaWx0ZXIpO1xuICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHNlbGVjdG9yR2VuZXJhdG9yKSB7XG4gICAgICBpZiAoc2VsZWN0b3IgJiYgdGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgZm9yIChsZXQgc2VsZWN0b3Igb2YgdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgIGlmIChzZWxlY3Rvci5kZXBlbmRzT25TdHlsZXMpIHtcbiAgICAgICAgc2VsZWN0b3Iuc2V0U3R5bGVzKHN0eWxlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RNdXRhdGlvblR5cGVzKG11dGF0aW9ucykge1xuICBsZXQgdHlwZXMgPSBuZXcgU2V0KCk7XG5cbiAgZm9yIChsZXQgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XG4gICAgdHlwZXMuYWRkKG11dGF0aW9uLnR5cGUpO1xuXG4gICAgLy8gVGhlcmUgYXJlIG9ubHkgMyB0eXBlcyBvZiBtdXRhdGlvbnM6IFwiYXR0cmlidXRlc1wiLCBcImNoYXJhY3RlckRhdGFcIiwgYW5kXG4gICAgLy8gXCJjaGlsZExpc3RcIi5cbiAgICBpZiAodHlwZXMuc2l6ZSA9PSAzKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHlwZXM7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RNdXRhdGlvblRhcmdldHMobXV0YXRpb25zKSB7XG4gIGlmICghbXV0YXRpb25zKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgdGFyZ2V0cyA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGxldCBtdXRhdGlvbiBvZiBtdXRhdGlvbnMpIHtcbiAgICBpZiAobXV0YXRpb24udHlwZSA9PSBcImNoaWxkTGlzdFwiKSB7XG4gICAgICAvLyBXaGVuIG5ldyBub2RlcyBhcmUgYWRkZWQsIHdlJ3JlIGludGVyZXN0ZWQgaW4gdGhlIGFkZGVkIG5vZGVzIHJhdGhlclxuICAgICAgLy8gdGhhbiB0aGUgcGFyZW50LlxuICAgICAgZm9yIChsZXQgbm9kZSBvZiBtdXRhdGlvbi5hZGRlZE5vZGVzKSB7XG4gICAgICAgIHRhcmdldHMuYWRkKG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKG11dGF0aW9uLnJlbW92ZWROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRhcmdldHMuYWRkKG11dGF0aW9uLnRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGFyZ2V0cy5hZGQobXV0YXRpb24udGFyZ2V0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWy4uLnRhcmdldHNdO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJQYXR0ZXJucyhwYXR0ZXJucywge3N0eWxlc2hlZXRzLCBtdXRhdGlvbnN9KSB7XG4gIGlmICghc3R5bGVzaGVldHMgJiYgIW11dGF0aW9ucykge1xuICAgIHJldHVybiBwYXR0ZXJucy5zbGljZSgpO1xuICB9XG5cbiAgbGV0IG11dGF0aW9uVHlwZXMgPSBtdXRhdGlvbnMgPyBleHRyYWN0TXV0YXRpb25UeXBlcyhtdXRhdGlvbnMpIDogbnVsbDtcblxuICByZXR1cm4gcGF0dGVybnMuZmlsdGVyKFxuICAgIHBhdHRlcm4gPT4gKHN0eWxlc2hlZXRzICYmIHBhdHRlcm4uZGVwZW5kc09uU3R5bGVzKSB8fFxuICAgICAgICAgICAgICAgKG11dGF0aW9ucyAmJiBwYXR0ZXJuLm1hdGNoZXNNdXRhdGlvblR5cGVzKG11dGF0aW9uVHlwZXMpKVxuICApO1xufVxuXG5mdW5jdGlvbiBzaG91bGRPYnNlcnZlQXR0cmlidXRlcyhwYXR0ZXJucykge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkT2JzZXJ2ZUNoYXJhY3RlckRhdGEocGF0dGVybnMpIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLmRlcGVuZHNPbkNoYXJhY3RlckRhdGEpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRPYnNlcnZlU3R5bGVzKHBhdHRlcm5zKSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5kZXBlbmRzT25TdHlsZXMpO1xufVxuXG4vKipcbiAqIEBjYWxsYmFjayBoaWRlRWxlbXNGdW5jXG4gKiBAcGFyYW0ge05vZGVbXX0gZWxlbWVudHMgRWxlbWVudHMgb24gdGhlIHBhZ2UgdGhhdCBzaG91bGQgYmUgaGlkZGVuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBlbGVtZW50RmlsdGVyc1xuICogICBUaGUgZmlsdGVyIHRleHQgdGhhdCBjYXVzZWQgdGhlIGVsZW1lbnRzIHRvIGJlIGhpZGRlblxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIHVuaGlkZUVsZW1zRnVuY1xuICogQHBhcmFtIHtOb2RlW119IGVsZW1lbnRzIEVsZW1lbnRzIG9uIHRoZSBwYWdlIHRoYXQgc2hvdWxkIGJlIGhpZGRlblxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIHJlbW92ZUVsZW1zRnVuY1xuICogQHBhcmFtIHtOb2RlW119IGVsZW1lbnRzIEVsZW1lbnRzIG9uIHRoZSBwYWdlIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWRcbiAqIEBwYXJhbSB7c3RyaW5nW119IGVsZW1lbnRGaWx0ZXJzXG4gKiAgIFRoZSBmaWx0ZXIgdGV4dCB0aGF0IGNhdXNlZCB0aGUgZWxlbWVudHMgdG8gYmUgcmVtb3ZlZFxuICogcmVtb3ZlZCBmcm9tIHRoZSBET01cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBjc3NFbGVtc0Z1bmNcbiAqIEBwYXJhbSB7Tm9kZVtdfSBlbGVtZW50cyBFbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IHNob3VsZFxuICogYXBwbHkgaW5saW5lIENTUyBydWxlc1xuICogQHBhcmFtIHtzdHJpbmdbXX0gY3NzUGF0dGVybnMgVGhlIENTUyBwYXR0ZXJucyB0byBiZSBhcHBsaWVkXG4gKi9cblxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIGZyb250LWVuZCBwcm9jZXNzaW5nIG9mIGVsZW1lbnQgaGlkaW5nIGVtdWxhdGlvbiBmaWx0ZXJzLlxuICovXG5leHBvcnRzLkVsZW1IaWRlRW11bGF0aW9uID0gY2xhc3MgRWxlbUhpZGVFbXVsYXRpb24ge1xuICAvKipcbiAgICogQHBhcmFtIHttb2R1bGU6Y29udGVudC9lbGVtSGlkZUVtdWxhdGlvbn5oaWRlRWxlbXNGdW5jfSBoaWRlRWxlbXNGdW5jXG4gICAqICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBwcm92aWRlZCB0byBkbyB0aGUgYWN0dWFsIGVsZW1lbnQgaGlkaW5nLlxuICAgKiBAcGFyYW0ge21vZHVsZTpjb250ZW50L2VsZW1IaWRlRW11bGF0aW9ufnVuaGlkZUVsZW1zRnVuY30gdW5oaWRlRWxlbXNGdW5jXG4gICAqICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBwcm92aWRlZCB0byB1bmhpZGUgcHJldmlvdXNseSBoaWRkZW4gZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOmNvbnRlbnQvZWxlbUhpZGVFbXVsYXRpb25+cmVtb3ZlRWxlbXNGdW5jfSByZW1vdmVFbGVtc0Z1bmNcbiAgICogICBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIHByb3ZpZGVkIHRvIHJlbW92ZSBlbGVtZW50cyBmcm9tIHRoZSBET00uXG4gICAqIEBwYXJhbSB7bW9kdWxlOmNvbnRlbnQvZWxlbUhpZGVFbXVsYXRpb25+Y3NzRWxlbXNGdW5jfSBjc3NFbGVtc0Z1bmNcbiAgICogICBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIHByb3ZpZGVkIHRvIGFwcGx5IGlubGluZSBDU1MgcnVsZXMgdG8gZWxlbWVudHNcbiAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgaGlkZUVsZW1zRnVuYyA9ICgpID0+IHt9LFxuICAgIHVuaGlkZUVsZW1zRnVuYyA9ICgpID0+IHt9LFxuICAgIHJlbW92ZUVsZW1zRnVuYyA9ICgpID0+IHt9LFxuICAgIGNzc0VsZW1zRnVuYyA9ICgpID0+IHt9XG4gICkge1xuICAgIHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgdGhpcy5fbGFzdEludm9jYXRpb24gPSAtbWluSW52b2NhdGlvbkludGVydmFsO1xuICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSBudWxsO1xuXG4gICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50O1xuICAgIHRoaXMuaGlkZUVsZW1zRnVuYyA9IGhpZGVFbGVtc0Z1bmM7XG4gICAgdGhpcy51bmhpZGVFbGVtc0Z1bmMgPSB1bmhpZGVFbGVtc0Z1bmM7XG4gICAgdGhpcy5yZW1vdmVFbGVtc0Z1bmMgPSByZW1vdmVFbGVtc0Z1bmM7XG4gICAgdGhpcy5jc3NFbGVtc0Z1bmMgPSBjc3NFbGVtc0Z1bmM7XG4gICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHRoaXMub2JzZXJ2ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmhpZGRlbkVsZW1lbnRzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgaXNTYW1lT3JpZ2luKHN0eWxlc2hlZXQpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBVUkwoc3R5bGVzaGVldC5ocmVmKS5vcmlnaW4gPT0gdGhpcy5kb2N1bWVudC5sb2NhdGlvbi5vcmlnaW47XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAvLyBJbnZhbGlkIFVSTCwgYXNzdW1lIHRoYXQgaXQgaXMgZmlyc3QtcGFydHkuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIHNlbGVjdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gcGFyc2VcbiAgICogQHJldHVybiB7QXJyYXl9IHNlbGVjdG9ycyBpcyBhbiBhcnJheSBvZiBvYmplY3RzLFxuICAgKiBvciBudWxsIGluIGNhc2Ugb2YgZXJyb3JzLlxuICAgKi9cbiAgcGFyc2VTZWxlY3RvcihzZWxlY3Rvcikge1xuICAgIGlmIChzZWxlY3Rvci5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGxldCBtYXRjaCA9IGFicFNlbGVjdG9yUmVnZXhwLmV4ZWMoc2VsZWN0b3IpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHJldHVybiBbbmV3IFBsYWluU2VsZWN0b3Ioc2VsZWN0b3IpXTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZWN0b3JzID0gW107XG4gICAgaWYgKG1hdGNoLmluZGV4ID4gMCkge1xuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IFBsYWluU2VsZWN0b3Ioc2VsZWN0b3Iuc3Vic3RyaW5nKDAsIG1hdGNoLmluZGV4KSkpO1xuICAgIH1cblxuICAgIGxldCBzdGFydEluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgbGV0IGNvbnRlbnQgPSBwYXJzZVNlbGVjdG9yQ29udGVudChzZWxlY3Rvciwgc3RhcnRJbmRleCk7XG4gICAgaWYgKCFjb250ZW50KSB7XG4gICAgICBjb25zb2xlLndhcm4obmV3IFN5bnRheEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkdWUgdG8gdW5tYXRjaGVkIHBhcmVudGhlc2VzLlwiKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobWF0Y2hbMV0gPT0gXCItYWJwLXByb3BlcnRpZXNcIikge1xuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IFByb3BzU2VsZWN0b3IoY29udGVudC50ZXh0KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09IFwiLWFicC1oYXNcIiB8fCBtYXRjaFsxXSA9PSBcImhhc1wiKSB7XG4gICAgICBsZXQgaGFzU2VsZWN0b3JzID0gdGhpcy5wYXJzZVNlbGVjdG9yKGNvbnRlbnQudGV4dCk7XG4gICAgICBpZiAoaGFzU2VsZWN0b3JzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBzZWxlY3RvcnMucHVzaChuZXcgSGFzU2VsZWN0b3IoaGFzU2VsZWN0b3JzKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09IFwiLWFicC1jb250YWluc1wiIHx8IG1hdGNoWzFdID09IFwiaGFzLXRleHRcIikge1xuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IENvbnRhaW5zU2VsZWN0b3IoY29udGVudC50ZXh0KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09PSBcInhwYXRoXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBYUGF0aFNlbGVjdG9yKGNvbnRlbnQudGV4dCkpO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKHttZXNzYWdlfSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgICAgXCJGYWlsZWQgdG8gcGFyc2UgQWRibG9jayBQbHVzIFwiICtcbiAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSwgaW52YWxpZCBgICtcbiAgICAgICAgICAgIGB4cGF0aDogJHtjb250ZW50LnRleHR9IGAgK1xuICAgICAgICAgICAgYGVycm9yOiAke21lc3NhZ2V9LmBcbiAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09IFwibm90XCIpIHtcbiAgICAgIGxldCBub3RTZWxlY3RvcnMgPSB0aGlzLnBhcnNlU2VsZWN0b3IoY29udGVudC50ZXh0KTtcbiAgICAgIGlmIChub3RTZWxlY3RvcnMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgYWxsIG9mIHRoZSBpbm5lciBzZWxlY3RvcnMgYXJlIFBsYWluU2VsZWN0b3JzLCB0aGVuIHdlXG4gICAgICAvLyBkb24ndCBhY3R1YWxseSBuZWVkIHRvIHVzZSBvdXIgc2VsZWN0b3IgYXQgYWxsLiBXZSdyZSBiZXR0ZXJcbiAgICAgIC8vIG9mZiBkZWxlZ2F0aW5nIHRvIHRoZSBicm93c2VyIDpub3QgaW1wbGVtZW50YXRpb24uXG4gICAgICBpZiAobm90U2VsZWN0b3JzLmV2ZXJ5KHMgPT4gcyBpbnN0YW5jZW9mIFBsYWluU2VsZWN0b3IpKSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBQbGFpblNlbGVjdG9yKGA6bm90KCR7Y29udGVudC50ZXh0fSlgKSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IE5vdFNlbGVjdG9yKG5vdFNlbGVjdG9ycykpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3IsIGNhbid0IHBhcnNlIHNlbGVjdG9yLlxuICAgICAgY29uc29sZS53YXJuKG5ldyBTeW50YXhFcnJvcihcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0sIGludmFsaWQgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBwc2V1ZG8tY2xhc3MgOiR7bWF0Y2hbMV19KCkuYCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHN1ZmZpeCA9IHRoaXMucGFyc2VTZWxlY3RvcihzZWxlY3Rvci5zdWJzdHJpbmcoY29udGVudC5lbmQgKyAxKSk7XG4gICAgaWYgKHN1ZmZpeCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzZWxlY3RvcnMucHVzaCguLi5zdWZmaXgpO1xuXG4gICAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPT0gMSAmJiBzZWxlY3RvcnNbMF0gaW5zdGFuY2VvZiBDb250YWluc1NlbGVjdG9yKSB7XG4gICAgICBjb25zb2xlLndhcm4obmV3IFN5bnRheEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSwgY2FuJ3QgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGF2ZSBhIGxvbmVseSA6LWFicC1jb250YWlucygpLlwiKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdG9ycztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgcnVsZXMgb3V0IG9mIENTUyBzdHlsZXNoZWV0c1xuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXSBUaGUgbGlzdCBvZiBzdHlsZXNoZWV0cyB0b1xuICAgKiByZWFkLlxuICAgKiBAcmV0dXJuIHtDU1NTdHlsZVJ1bGVbXX1cbiAgICovXG4gIF9yZWFkQ3NzUnVsZXMoc3R5bGVzaGVldHMpIHtcbiAgICBsZXQgY3NzU3R5bGVzID0gW107XG5cbiAgICBmb3IgKGxldCBzdHlsZXNoZWV0IG9mIHN0eWxlc2hlZXRzIHx8IFtdKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGlnbm9yZSB0aGlyZC1wYXJ0eSBzdHlsZXNoZWV0cyB0byBlbnN1cmUgY29uc2lzdGVudCBiZWhhdmlvclxuICAgICAgLy8gYmV0d2VlbiBGaXJlZm94IGFuZCBDaHJvbWUuXG4gICAgICBpZiAoIXRoaXMuaXNTYW1lT3JpZ2luKHN0eWxlc2hlZXQpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsZXQgcnVsZXM7XG4gICAgICB0cnkge1xuICAgICAgICBydWxlcyA9IHN0eWxlc2hlZXQuY3NzUnVsZXM7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICAvLyBPbiBGaXJlZm94LCB0aGVyZSBpcyBhIGNoYW5jZSB0aGF0IGFuIEludmFsaWRBY2Nlc3NFcnJvclxuICAgICAgICAvLyBnZXQgdGhyb3duIHdoZW4gYWNjZXNzaW5nIGNzc1J1bGVzLiBKdXN0IHNraXAgdGhlIHN0eWxlc2hlZXRcbiAgICAgICAgLy8gaW4gdGhhdCBjYXNlLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9zZWFyY2hmb3gub3JnL21vemlsbGEtY2VudHJhbC9yZXYvZjY1ZDc1MjhlMzRlZjFhNzY2NWI0YTFhN2I3Y2RiMTM4OGZjZDNhYS9sYXlvdXQvc3R5bGUvU3R5bGVTaGVldC5jcHAjNjk5XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJ1bGVzKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICAgIGlmIChydWxlLnR5cGUgIT0gcnVsZS5TVFlMRV9SVUxFKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjc3NTdHlsZXMucHVzaChzdHJpbmdpZnlTdHlsZShydWxlKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjc3NTdHlsZXM7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIHRoZSBjdXJyZW50IGRvY3VtZW50IGFuZCBhcHBsaWVzIGFsbCBydWxlcyB0byBpdC5cbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c11cbiAgICogICAgVGhlIGxpc3Qgb2YgbmV3IHN0eWxlc2hlZXRzIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoZSBkb2N1bWVudCBhbmRcbiAgICogICAgbWFkZSByZXByb2Nlc3NpbmcgbmVjZXNzYXJ5LiBUaGlzIHBhcmFtZXRlciBzaG91bGRuJ3QgYmUgcGFzc2VkIGluIGZvclxuICAgKiAgICB0aGUgaW5pdGlhbCBwcm9jZXNzaW5nLCBhbGwgb2YgZG9jdW1lbnQncyBzdHlsZXNoZWV0cyB3aWxsIGJlIGNvbnNpZGVyZWRcbiAgICogICAgdGhlbiBhbmQgYWxsIHJ1bGVzLCBpbmNsdWRpbmcgdGhlIG9uZXMgbm90IGRlcGVuZGVudCBvbiBzdHlsZXMuXG4gICAqIEBwYXJhbSB7TXV0YXRpb25SZWNvcmRbXX0gW211dGF0aW9uc11cbiAgICogICAgVGhlIGxpc3Qgb2YgRE9NIG11dGF0aW9ucyB0aGF0IGhhdmUgYmVlbiBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCBhbmRcbiAgICogICAgbWFkZSByZXByb2Nlc3NpbmcgbmVjZXNzYXJ5LiBUaGlzIHBhcmFtZXRlciBzaG91bGRuJ3QgYmUgcGFzc2VkIGluIGZvclxuICAgKiAgICB0aGUgaW5pdGlhbCBwcm9jZXNzaW5nLCB0aGUgZW50aXJlIGRvY3VtZW50IHdpbGwgYmUgY29uc2lkZXJlZFxuICAgKiAgICB0aGVuIGFuZCBhbGwgcnVsZXMsIGluY2x1ZGluZyB0aGUgb25lcyBub3QgZGVwZW5kZW50IG9uIHRoZSBET00uXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqICAgIEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCBvbmNlIGFsbCBmaWx0ZXJpbmcgaXMgY29tcGxldGVkXG4gICAqL1xuICBhc3luYyBfYWRkU2VsZWN0b3JzKHN0eWxlc2hlZXRzLCBtdXRhdGlvbnMpIHtcbiAgICBpZiAodGVzdEluZm8pIHtcbiAgICAgIHRlc3RJbmZvLmxhc3RQcm9jZXNzZWRFbGVtZW50cy5jbGVhcigpO1xuICAgIH1cblxuICAgIGxldCBkZWFkbGluZSA9IG5ld0lkbGVEZWFkbGluZSgpO1xuXG4gICAgaWYgKHNob3VsZE9ic2VydmVTdHlsZXModGhpcy5wYXR0ZXJucykpIHtcbiAgICAgIHRoaXMuX3JlZnJlc2hQYXR0ZXJuU3R5bGVzKCk7XG4gICAgfVxuXG4gICAgbGV0IHBhdHRlcm5zVG9DaGVjayA9IGZpbHRlclBhdHRlcm5zKFxuICAgICAgdGhpcy5wYXR0ZXJucywge3N0eWxlc2hlZXRzLCBtdXRhdGlvbnN9XG4gICAgKTtcblxuICAgIGxldCB0YXJnZXRzID0gZXh0cmFjdE11dGF0aW9uVGFyZ2V0cyhtdXRhdGlvbnMpO1xuXG4gICAgY29uc3QgZWxlbWVudHNUb0hpZGUgPSBbXTtcbiAgICBjb25zdCBlbGVtZW50c1RvSGlkZUZpbHRlcnMgPSBbXTtcbiAgICBjb25zdCBlbGVtZW50c1RvUmVtb3ZlRmlsdGVycyA9IFtdO1xuICAgIGNvbnN0IGVsZW1lbnRzVG9SZW1vdmUgPSBbXTtcbiAgICBjb25zdCBlbGVtZW50c1RvQXBwbHlDU1MgPSBbXTtcbiAgICBjb25zdCBjc3NQYXR0ZXJucyA9IFtdO1xuICAgIGxldCBlbGVtZW50c1RvVW5oaWRlID0gbmV3IFNldCh0aGlzLmhpZGRlbkVsZW1lbnRzLmtleXMoKSk7XG4gICAgZm9yIChsZXQgcGF0dGVybiBvZiBwYXR0ZXJuc1RvQ2hlY2spIHtcbiAgICAgIGxldCBldmFsdWF0aW9uVGFyZ2V0cyA9IHRhcmdldHM7XG5cbiAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIGFwcGVhcnMgdG8gY29udGFpbiBhbnkgc2libGluZyBjb21iaW5hdG9ycywgd2UgY2FuJ3RcbiAgICAgIC8vIGVhc2lseSBvcHRpbWl6ZSBiYXNlZCBvbiB0aGUgbXV0YXRpb24gdGFyZ2V0cy4gU2luY2UgdGhpcyBpcyBhXG4gICAgICAvLyBzcGVjaWFsIGNhc2UsIHNraXAgdGhlIG9wdGltaXphdGlvbi4gQnkgc2V0dGluZyBpdCB0byBudWxsIGhlcmUgd2VcbiAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBwcm9jZXNzIHRoZSBlbnRpcmUgRE9NLlxuICAgICAgaWYgKHBhdHRlcm4ubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycykge1xuICAgICAgICBldmFsdWF0aW9uVGFyZ2V0cyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGxldCBnZW5lcmF0b3IgPSBwYXR0ZXJuLmV2YWx1YXRlKHRoaXMuZG9jdW1lbnQsIGV2YWx1YXRpb25UYXJnZXRzKTtcbiAgICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIGdlbmVyYXRvcikge1xuICAgICAgICBpZiAoc2VsZWN0b3IgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaWYgKHBhdHRlcm4ucmVtb3ZlKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9SZW1vdmUucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgICAgZWxlbWVudHNUb1JlbW92ZUZpbHRlcnMucHVzaChwYXR0ZXJuLnRleHQpO1xuICAgICAgICAgICAgICBlbGVtZW50c1RvVW5oaWRlLmRlbGV0ZShlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBhdHRlcm4uY3NzKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9BcHBseUNTUy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgICAgICBjc3NQYXR0ZXJucy5wdXNoKHBhdHRlcm4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIXRoaXMuaGlkZGVuRWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9IaWRlLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9IaWRlRmlsdGVycy5wdXNoKHBhdHRlcm4udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZWxlbWVudHNUb1VuaGlkZS5kZWxldGUoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlYWRsaW5lLnRpbWVSZW1haW5pbmcoKSA8PSAwKSB7XG4gICAgICAgICAgZGVhZGxpbmUgPSBhd2FpdCB5aWVsZFRocmVhZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3JlbW92ZUVsZW1zKGVsZW1lbnRzVG9SZW1vdmUsIGVsZW1lbnRzVG9SZW1vdmVGaWx0ZXJzKTtcbiAgICB0aGlzLl9hcHBseUNTU1RvRWxlbXMoZWxlbWVudHNUb0FwcGx5Q1NTLCBjc3NQYXR0ZXJucyk7XG4gICAgdGhpcy5faGlkZUVsZW1zKGVsZW1lbnRzVG9IaWRlLCBlbGVtZW50c1RvSGlkZUZpbHRlcnMpO1xuXG4gICAgLy8gVGhlIHNlYXJjaCBmb3IgZWxlbWVudHMgdG8gaGlkZSBpdCBvcHRpbWl6ZWQgdG8gZmluZCBuZXcgdGhpbmdzXG4gICAgLy8gdG8gaGlkZSBxdWlja2x5LCBieSBub3QgY2hlY2tpbmcgYWxsIHBhdHRlcm5zIGFuZCBub3QgY2hlY2tpbmdcbiAgICAvLyB0aGUgZnVsbCBET00uIFRoYXQncyB3aHkgd2UgbmVlZCB0byBkbyBhIG1vcmUgdGhvcm91Z2ggY2hlY2tcbiAgICAvLyBmb3IgZWFjaCByZW1haW5pbmcgZWxlbWVudCB0aGF0IG1pZ2h0IG5lZWQgdG8gYmUgdW5oaWRkZW4sXG4gICAgLy8gY2hlY2tpbmcgYWxsIHBhdHRlcm5zLlxuICAgIGZvciAobGV0IGVsZW0gb2YgZWxlbWVudHNUb1VuaGlkZSkge1xuICAgICAgaWYgKCFlbGVtLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIC8vIGVsZW1lbnRzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgRE9NIHNob3VsZCBiZSB1bmhpZGRlblxuICAgICAgICAvLyBpbiBjYXNlIHRoZXkncmUgZXZlciByZWFkZGVkLCBhbmQgdGhlbiBmb3Jnb3R0ZW4gYWJvdXQgc29cbiAgICAgICAgLy8gd2UgZG9uJ3QgY2F1c2UgYSBtZW1vcnkgbGVhay5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgbWF0Y2hlc0FueSA9IHRoaXMucGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF0Y2hlcyhcbiAgICAgICAgZWxlbSwgdGhpcy5kb2N1bWVudFxuICAgICAgKSk7XG4gICAgICBpZiAobWF0Y2hlc0FueSkge1xuICAgICAgICBlbGVtZW50c1RvVW5oaWRlLmRlbGV0ZShlbGVtKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlYWRsaW5lLnRpbWVSZW1haW5pbmcoKSA8PSAwKSB7XG4gICAgICAgIGRlYWRsaW5lID0gYXdhaXQgeWllbGRUaHJlYWQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fdW5oaWRlRWxlbXMoQXJyYXkuZnJvbShlbGVtZW50c1RvVW5oaWRlKSk7XG4gIH1cblxuICBfcmVtb3ZlRWxlbXMoZWxlbWVudHNUb1JlbW92ZSwgZWxlbWVudEZpbHRlcnMpIHtcbiAgICBpZiAoZWxlbWVudHNUb1JlbW92ZS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbW92ZUVsZW1zRnVuYyhlbGVtZW50c1RvUmVtb3ZlLCBlbGVtZW50RmlsdGVycyk7XG4gICAgICBmb3IgKGxldCBlbGVtIG9mIGVsZW1lbnRzVG9SZW1vdmUpIHtcbiAgICAgICAgLy8gdGhleSdyZSBub3QgaGlkZGVuIGFueW1vcmUgKGlmIHRoZXkgZXZlciB3ZXJlKSwgdGhleSdyZVxuICAgICAgICAvLyByZW1vdmVkLiBUaGVyZSdzIG5vIHVuaGlkaW5nIHRoZXNlIG9uZXMhXG4gICAgICAgIHRoaXMuaGlkZGVuRWxlbWVudHMuZGVsZXRlKGVsZW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hcHBseUNTU1RvRWxlbXMoZWxlbWVudHMsIGNzc1BhdHRlcm5zKSB7XG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY3NzRWxlbXNGdW5jKGVsZW1lbnRzLCBjc3NQYXR0ZXJucyk7XG4gICAgfVxuICB9XG5cbiAgX2hpZGVFbGVtcyhlbGVtZW50c1RvSGlkZSwgZWxlbWVudEZpbHRlcnMpIHtcbiAgICBpZiAoZWxlbWVudHNUb0hpZGUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5oaWRlRWxlbXNGdW5jKGVsZW1lbnRzVG9IaWRlLCBlbGVtZW50RmlsdGVycyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzVG9IaWRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuaGlkZGVuRWxlbWVudHMuc2V0KGVsZW1lbnRzVG9IaWRlW2ldLCBlbGVtZW50RmlsdGVyc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3VuaGlkZUVsZW1zKGVsZW1lbnRzVG9VbmhpZGUpIHtcbiAgICBpZiAoZWxlbWVudHNUb1VuaGlkZS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnVuaGlkZUVsZW1zRnVuYyhlbGVtZW50c1RvVW5oaWRlKTtcbiAgICAgIGZvciAobGV0IGVsZW0gb2YgZWxlbWVudHNUb1VuaGlkZSkge1xuICAgICAgICB0aGlzLmhpZGRlbkVsZW1lbnRzLmRlbGV0ZShlbGVtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybWVkIGFueSBzY2hlZHVsZWQgcHJvY2Vzc2luZy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBhc3luY3Jvbm91cywgYW5kIHNob3VsZCBub3QgYmUgcnVuIG11bHRpcGxlXG4gICAqIHRpbWVzIGluIHBhcmFsbGVsLiBUaGUgZmxhZyBgX2ZpbHRlcmluZ0luUHJvZ3Jlc3NgIGlzIHNldCBhbmRcbiAgICogdW5zZXQgc28geW91IGNhbiBjaGVjayBpZiBpdCdzIGFscmVhZHkgcnVubmluZy5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICogIEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCBvbmNlIGFsbCBmaWx0ZXJpbmcgaXMgY29tcGxldGVkXG4gICAqL1xuICBhc3luYyBfcHJvY2Vzc0ZpbHRlcmluZygpIHtcbiAgICBpZiAodGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcykge1xuICAgICAgY29uc29sZS53YXJuKFwiRWxlbUhpZGVFbXVsYXRpb24gc2NoZWR1bGluZyBlcnJvcjogXCIgK1xuICAgICAgICAgICAgICAgICAgIFwiVHJpZWQgdG8gcHJvY2VzcyBmaWx0ZXJpbmcgaW4gcGFyYWxsZWwuXCIpO1xuICAgICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAgIHRlc3RJbmZvLmZhaWxlZEFzc2VydGlvbnMucHVzaChcbiAgICAgICAgICBcIlRyaWVkIHRvIHByb2Nlc3MgZmlsdGVyaW5nIGluIHBhcmFsbGVsXCJcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nIHx8IHt9O1xuICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSBudWxsO1xuICAgIHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICBhd2FpdCB0aGlzLl9hZGRTZWxlY3RvcnMoXG4gICAgICBwYXJhbXMuc3R5bGVzaGVldHMsXG4gICAgICBwYXJhbXMubXV0YXRpb25zXG4gICAgKTtcbiAgICB0aGlzLl9sYXN0SW52b2NhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZykge1xuICAgICAgdGhpcy5fc2NoZWR1bGVOZXh0RmlsdGVyaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgbmV3IGNoYW5nZXMgdG8gdGhlIGxpc3Qgb2YgZmlsdGVycyBmb3IgdGhlIG5leHQgdGltZVxuICAgKiBmaWx0ZXJpbmcgaXMgcnVuLlxuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXVxuICAgKiAgICBuZXcgc3R5bGVzaGVldHMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqIEBwYXJhbSB7TXV0YXRpb25SZWNvcmRbXX0gW211dGF0aW9uc11cbiAgICogICAgbmV3IERPTSBtdXRhdGlvbnMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqL1xuICBfYXBwZW5kU2NoZWR1bGVkUHJvY2Vzc2luZyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKSB7XG4gICAgaWYgKCF0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nKSB7XG4gICAgICAvLyBUaGVyZSBpc24ndCBhbnl0aGluZyBzY2hlZHVsZWQgeWV0LiBNYWtlIHRoZSBzY2hlZHVsZS5cbiAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSB7c3R5bGVzaGVldHMsIG11dGF0aW9uc307XG4gICAgfVxuICAgIGVsc2UgaWYgKCFzdHlsZXNoZWV0cyAmJiAhbXV0YXRpb25zKSB7XG4gICAgICAvLyBUaGUgbmV3IHJlcXVlc3Qgd2FzIHRvIHJlcHJvY2VzcyBldmVyeXRoaW5nLCBhbmQgc28gYW55XG4gICAgICAvLyBwcmV2aW91cyBmaWx0ZXJzIGFyZSBpcnJlbGV2YW50LlxuICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyA9IHt9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzIHx8XG4gICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMpIHtcbiAgICAgIC8vIFRoZSBwcmV2aW91cyBmaWx0ZXJzIGFyZSBub3QgdG8gZmlsdGVyIGV2ZXJ5dGhpbmcsIHNvIHRoZSBuZXdcbiAgICAgIC8vIHBhcmFtZXRlcnMgbWF0dGVyLiBQdXNoIHRoZW0gb250byB0aGUgYXBwcm9wcmlhdGUgbGlzdHMuXG4gICAgICBpZiAoc3R5bGVzaGVldHMpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzKSB7XG4gICAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3Npbmcuc3R5bGVzaGVldHMucHVzaCguLi5zdHlsZXNoZWV0cyk7XG4gICAgICB9XG4gICAgICBpZiAobXV0YXRpb25zKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLm11dGF0aW9ucyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zLnB1c2goLi4ubXV0YXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nIGlzIGFscmVhZHkgZ29pbmcgdG8gcmVjaGVja1xuICAgICAgLy8gZXZlcnl0aGluZywgc28gbm8gbmVlZCB0byBkbyBhbnl0aGluZyBoZXJlLlxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZSBmaWx0ZXJpbmcgdG8gYmUgcHJvY2Vzc2VkIGluIHRoZSBmdXR1cmUsIG9yIHN0YXJ0XG4gICAqIHByb2Nlc3NpbmcgaW1tZWRpYXRlbHkuXG4gICAqXG4gICAqIElmIHByb2Nlc3NpbmcgaXMgYWxyZWFkeSBzY2hlZHVsZWQsIHRoaXMgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgX3NjaGVkdWxlTmV4dEZpbHRlcmluZygpIHtcbiAgICBpZiAodGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCB8fCB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzKSB7XG4gICAgICAvLyBUaGUgbmV4dCBvbmUgaGFzIGFscmVhZHkgYmVlbiBzY2hlZHVsZWQuIE91ciBuZXcgZXZlbnRzIGFyZVxuICAgICAgLy8gb24gdGhlIHF1ZXVlLCBzbyBub3RoaW5nIG1vcmUgdG8gZG8uXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIC8vIERvY3VtZW50IGlzbid0IGZ1bGx5IGxvYWRlZCB5ZXQsIHNvIHNjaGVkdWxlIG91ciBmaXJzdFxuICAgICAgLy8gZmlsdGVyaW5nIGFzIHNvb24gYXMgdGhhdCdzIGRvbmUuXG4gICAgICB0aGlzLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIFwiRE9NQ29udGVudExvYWRlZFwiLFxuICAgICAgICAoKSA9PiB0aGlzLl9wcm9jZXNzRmlsdGVyaW5nKCksXG4gICAgICAgIHtvbmNlOiB0cnVlfVxuICAgICAgKTtcbiAgICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuX2xhc3RJbnZvY2F0aW9uIDxcbiAgICAgICAgICAgICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwpIHtcbiAgICAgIC8vIEl0IGhhc24ndCBiZWVuIGxvbmcgZW5vdWdoIHNpbmNlIG91ciBsYXN0IGZpbHRlci4gU2V0IHRoZVxuICAgICAgLy8gdGltZW91dCBmb3Igd2hlbiBpdCdzIHRpbWUgZm9yIHRoYXQuXG4gICAgICBzZXRUaW1lb3V0KFxuICAgICAgICAoKSA9PiB0aGlzLl9wcm9jZXNzRmlsdGVyaW5nKCksXG4gICAgICAgIG1pbkludm9jYXRpb25JbnRlcnZhbCAtIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuX2xhc3RJbnZvY2F0aW9uKVxuICAgICAgKTtcbiAgICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFdlIGNhbiBhY3R1YWxseSBqdXN0IHN0YXJ0IGZpbHRlcmluZyBpbW1lZGlhdGVseSFcbiAgICAgIHRoaXMuX3Byb2Nlc3NGaWx0ZXJpbmcoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmUtcnVuIGZpbHRlcmluZyBlaXRoZXIgaW1tZWRpYXRlbHkgb3IgcXVldWVkLlxuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXVxuICAgKiAgICBuZXcgc3R5bGVzaGVldHMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqIEBwYXJhbSB7TXV0YXRpb25SZWNvcmRbXX0gW211dGF0aW9uc11cbiAgICogICAgbmV3IERPTSBtdXRhdGlvbnMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqL1xuICBxdWV1ZUZpbHRlcmluZyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKSB7XG4gICAgdGhpcy5fYXBwZW5kU2NoZWR1bGVkUHJvY2Vzc2luZyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKTtcbiAgICB0aGlzLl9zY2hlZHVsZU5leHRGaWx0ZXJpbmcoKTtcbiAgfVxuXG4gIF9yZWZyZXNoUGF0dGVyblN0eWxlcyhzdHlsZXNoZWV0KSB7XG4gICAgbGV0IGFsbENzc1J1bGVzID0gdGhpcy5fcmVhZENzc1J1bGVzKHRoaXMuZG9jdW1lbnQuc3R5bGVTaGVldHMpO1xuICAgIGZvciAobGV0IHBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucykge1xuICAgICAgcGF0dGVybi5zZXRTdHlsZXMoYWxsQ3NzUnVsZXMpO1xuICAgIH1cbiAgfVxuXG4gIG9uTG9hZChldmVudCkge1xuICAgIGxldCBzdHlsZXNoZWV0ID0gZXZlbnQudGFyZ2V0LnNoZWV0O1xuICAgIGlmIChzdHlsZXNoZWV0KSB7XG4gICAgICB0aGlzLnF1ZXVlRmlsdGVyaW5nKFtzdHlsZXNoZWV0XSk7XG4gICAgfVxuICB9XG5cbiAgb2JzZXJ2ZShtdXRhdGlvbnMpIHtcbiAgICBpZiAodGVzdEluZm8pIHtcbiAgICAgIC8vIEluIHRlc3QgbW9kZSwgZmlsdGVyIG91dCBhbnkgbXV0YXRpb25zIGxpa2VseSBkb25lIGJ5IHVzXG4gICAgICAvLyAoaS5lLiBzdHlsZT1cImRpc3BsYXk6IG5vbmUgIWltcG9ydGFudFwiKS4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICAgIC8vIG9ic2VydmUgaG93IHRoZSBjb2RlIHJlc3BvbmRzIHRvIERPTSBtdXRhdGlvbnMuXG4gICAgICBtdXRhdGlvbnMgPSBtdXRhdGlvbnMuZmlsdGVyKFxuICAgICAgICAoe3R5cGUsIGF0dHJpYnV0ZU5hbWUsIHRhcmdldDoge3N0eWxlOiBuZXdWYWx1ZX0sIG9sZFZhbHVlfSkgPT5cbiAgICAgICAgICAhKHR5cGUgPT0gXCJhdHRyaWJ1dGVzXCIgJiYgYXR0cmlidXRlTmFtZSA9PSBcInN0eWxlXCIgJiZcbiAgICAgICAgICAgIG5ld1ZhbHVlLmRpc3BsYXkgPT0gXCJub25lXCIgJiZcbiAgICAgICAgICAgIHRvQ1NTU3R5bGVEZWNsYXJhdGlvbihvbGRWYWx1ZSkuZGlzcGxheSAhPSBcIm5vbmVcIilcbiAgICAgICk7XG5cbiAgICAgIGlmIChtdXRhdGlvbnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucXVldWVGaWx0ZXJpbmcobnVsbCwgbXV0YXRpb25zKTtcbiAgfVxuXG4gIGFwcGx5KHBhdHRlcm5zKSB7XG4gICAgaWYgKHRoaXMucGF0dGVybnMpIHtcbiAgICAgIGxldCByZW1vdmVkUGF0dGVybnMgPSBbXTtcbiAgICAgIGZvciAobGV0IG9sZFBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucykge1xuICAgICAgICBpZiAoIXBhdHRlcm5zLmZpbmQobmV3UGF0dGVybiA9PiBuZXdQYXR0ZXJuLnRleHQgPT0gb2xkUGF0dGVybi50ZXh0KSkge1xuICAgICAgICAgIHJlbW92ZWRQYXR0ZXJucy5wdXNoKG9sZFBhdHRlcm4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgZWxlbWVudHNUb1VuaGlkZSA9IFtdO1xuICAgICAgZm9yIChsZXQgcGF0dGVybiBvZiByZW1vdmVkUGF0dGVybnMpIHtcbiAgICAgICAgZm9yIChsZXQgW2VsZW1lbnQsIGZpbHRlcl0gb2YgdGhpcy5oaWRkZW5FbGVtZW50cykge1xuICAgICAgICAgIGlmIChmaWx0ZXIgPT0gcGF0dGVybi50ZXh0KSB7XG4gICAgICAgICAgICBlbGVtZW50c1RvVW5oaWRlLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudHNUb1VuaGlkZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3VuaGlkZUVsZW1zKGVsZW1lbnRzVG9VbmhpZGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucGF0dGVybnMgPSBbXTtcbiAgICBmb3IgKGxldCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICBsZXQgc2VsZWN0b3JzID0gdGhpcy5wYXJzZVNlbGVjdG9yKHBhdHRlcm4uc2VsZWN0b3IpO1xuICAgICAgaWYgKHNlbGVjdG9ycyAhPSBudWxsICYmIHNlbGVjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMucGF0dGVybnMucHVzaChcbiAgICAgICAgICBuZXcgUGF0dGVybihzZWxlY3RvcnMsIHBhdHRlcm4udGV4dCwgcGF0dGVybi5yZW1vdmUsIHBhdHRlcm4uY3NzKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBhdHRlcm5zLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucXVldWVGaWx0ZXJpbmcoKTtcblxuICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBzaG91bGRPYnNlcnZlQXR0cmlidXRlcyh0aGlzLnBhdHRlcm5zKTtcbiAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShcbiAgICAgICAgdGhpcy5kb2N1bWVudCxcbiAgICAgICAge1xuICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICBhdHRyaWJ1dGVzLFxuICAgICAgICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiBhdHRyaWJ1dGVzICYmICEhdGVzdEluZm8sXG4gICAgICAgICAgY2hhcmFjdGVyRGF0YTogc2hvdWxkT2JzZXJ2ZUNoYXJhY3RlckRhdGEodGhpcy5wYXR0ZXJucyksXG4gICAgICAgICAgc3VidHJlZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgaWYgKHNob3VsZE9ic2VydmVTdHlsZXModGhpcy5wYXR0ZXJucykpIHtcbiAgICAgICAgbGV0IG9uTG9hZCA9IHRoaXMub25Mb2FkLmJpbmQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBvbkxvYWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuX3VuaGlkZUVsZW1zKEFycmF5LmZyb20odGhpcy5oaWRkZW5FbGVtZW50cy5rZXlzKCkpKTtcbiAgfVxufTtcbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBBZGJsb2NrIFBsdXMgPGh0dHBzOi8vYWRibG9ja3BsdXMub3JnLz4sXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggQWRibG9jayBQbHVzLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qKiBAbW9kdWxlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBwYXR0ZXJucyB0aGF0XG4gKiBge0BsaW5rIG1vZHVsZTpwYXR0ZXJucy5jb21waWxlUGF0dGVybnMgY29tcGlsZVBhdHRlcm5zKCl9YCB3aWxsIGNvbXBpbGVcbiAqIGludG8gcmVndWxhciBleHByZXNzaW9ucy5cbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmNvbnN0IENPTVBJTEVfUEFUVEVSTlNfTUFYID0gMTAwO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIG1hdGNoIHRoZSBgXmAgc3VmZml4IGluIGFuIG90aGVyd2lzZSBsaXRlcmFsXG4gKiBwYXR0ZXJuLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xubGV0IHNlcGFyYXRvclJlZ0V4cCA9IC9bXFx4MDAtXFx4MjRcXHgyNi1cXHgyQ1xceDJGXFx4M0EtXFx4NDBcXHg1Qi1cXHg1RVxceDYwXFx4N0ItXFx4N0ZdLztcblxubGV0IGZpbHRlclRvUmVnRXhwID1cbi8qKlxuICogQ29udmVydHMgZmlsdGVyIHRleHQgaW50byByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBhcyBpbiBGaWx0ZXIoKVxuICogQHJldHVybiB7c3RyaW5nfSByZWd1bGFyIGV4cHJlc3Npb24gcmVwcmVzZW50YXRpb24gb2YgZmlsdGVyIHRleHRcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMuZmlsdGVyVG9SZWdFeHAgPSBmdW5jdGlvbiBmaWx0ZXJUb1JlZ0V4cCh0ZXh0KSB7XG4gIC8vIHJlbW92ZSBtdWx0aXBsZSB3aWxkY2FyZHNcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwqKy9nLCBcIipcIik7XG5cbiAgLy8gcmVtb3ZlIGxlYWRpbmcgd2lsZGNhcmRcbiAgaWYgKHRleHRbMF0gPT0gXCIqXCIpIHtcbiAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSk7XG4gIH1cblxuICAvLyByZW1vdmUgdHJhaWxpbmcgd2lsZGNhcmRcbiAgaWYgKHRleHRbdGV4dC5sZW5ndGggLSAxXSA9PSBcIipcIikge1xuICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHRleHRcbiAgICAvLyByZW1vdmUgYW5jaG9ycyBmb2xsb3dpbmcgc2VwYXJhdG9yIHBsYWNlaG9sZGVyXG4gICAgLnJlcGxhY2UoL1xcXlxcfCQvLCBcIl5cIilcbiAgICAvLyBlc2NhcGUgc3BlY2lhbCBzeW1ib2xzXG4gICAgLnJlcGxhY2UoL1xcVy9nLCBcIlxcXFwkJlwiKVxuICAgIC8vIHJlcGxhY2Ugd2lsZGNhcmRzIGJ5IC4qXG4gICAgLnJlcGxhY2UoL1xcXFxcXCovZywgXCIuKlwiKVxuICAgIC8vIHByb2Nlc3Mgc2VwYXJhdG9yIHBsYWNlaG9sZGVycyAoYWxsIEFOU0kgY2hhcmFjdGVycyBidXQgYWxwaGFudW1lcmljXG4gICAgLy8gY2hhcmFjdGVycyBhbmQgXyUuLSlcbiAgICAucmVwbGFjZSgvXFxcXFxcXi9nLCBgKD86JHtzZXBhcmF0b3JSZWdFeHAuc291cmNlfXwkKWApXG4gICAgLy8gcHJvY2VzcyBleHRlbmRlZCBhbmNob3IgYXQgZXhwcmVzc2lvbiBzdGFydFxuICAgIC5yZXBsYWNlKC9eXFxcXFxcfFxcXFxcXHwvLCBcIl5bXFxcXHdcXFxcLV0rOlxcXFwvKyg/OlteXFxcXC9dK1xcXFwuKT9cIilcbiAgICAvLyBwcm9jZXNzIGFuY2hvciBhdCBleHByZXNzaW9uIHN0YXJ0XG4gICAgLnJlcGxhY2UoL15cXFxcXFx8LywgXCJeXCIpXG4gICAgLy8gcHJvY2VzcyBhbmNob3IgYXQgZXhwcmVzc2lvbiBlbmRcbiAgICAucmVwbGFjZSgvXFxcXFxcfCQvLCBcIiRcIik7XG59O1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIG1hdGNoIHRoZSBgfHxgIHByZWZpeCBpbiBhbiBvdGhlcndpc2UgbGl0ZXJhbFxuICogcGF0dGVybi5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBleHRlbmRlZEFuY2hvclJlZ0V4cCA9IG5ldyBSZWdFeHAoZmlsdGVyVG9SZWdFeHAoXCJ8fFwiKSArIFwiJFwiKTtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIG1hdGNoaW5nIGEga2V5d29yZCBpbiBhIGZpbHRlci5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBrZXl3b3JkUmVnRXhwID0gL1teYS16MC05JSpdW2EtejAtOSVdezIsfSg/PVteYS16MC05JSpdKS87XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBhbGwga2V5d29yZHMgaW4gYSBmaWx0ZXIuXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQgYWxsS2V5d29yZHNSZWdFeHAgPSBuZXcgUmVnRXhwKGtleXdvcmRSZWdFeHAsIFwiZ1wiKTtcblxuLyoqXG4gKiBBIGBDb21waWxlZFBhdHRlcm5zYCBvYmplY3QgcmVwcmVzZW50cyB0aGUgY29tcGlsZWQgdmVyc2lvbiBvZiBtdWx0aXBsZSBVUkxcbiAqIHJlcXVlc3QgcGF0dGVybnMuIEl0IGlzIHJldHVybmVkIGJ5XG4gKiBge0BsaW5rIG1vZHVsZTpwYXR0ZXJucy5jb21waWxlUGF0dGVybnMgY29tcGlsZVBhdHRlcm5zKCl9YC5cbiAqL1xuY2xhc3MgQ29tcGlsZWRQYXR0ZXJucyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9iamVjdCB3aXRoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb25zIGZvciBjYXNlLXNlbnNpdGl2ZVxuICAgKiBhbmQgY2FzZS1pbnNlbnNpdGl2ZSBtYXRjaGluZyByZXNwZWN0aXZlbHkuXG4gICAqIEBwYXJhbSB7P1JlZ0V4cH0gW2Nhc2VTZW5zaXRpdmVdXG4gICAqIEBwYXJhbSB7P1JlZ0V4cH0gW2Nhc2VJbnNlbnNpdGl2ZV1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNhc2VTZW5zaXRpdmUsIGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgIHRoaXMuX2Nhc2VTZW5zaXRpdmUgPSBjYXNlU2Vuc2l0aXZlO1xuICAgIHRoaXMuX2Nhc2VJbnNlbnNpdGl2ZSA9IGNhc2VJbnNlbnNpdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIHRoZSBnaXZlbiBVUkwgcmVxdWVzdCBtYXRjaGVzIHRoZSBwYXR0ZXJucyB1c2VkIHRvIGNyZWF0ZVxuICAgKiB0aGlzIG9iamVjdC5cbiAgICogQHBhcmFtIHttb2R1bGU6dXJsLlVSTFJlcXVlc3R9IHJlcXVlc3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICB0ZXN0KHJlcXVlc3QpIHtcbiAgICByZXR1cm4gKCh0aGlzLl9jYXNlU2Vuc2l0aXZlICYmXG4gICAgICAgICAgICAgdGhpcy5fY2FzZVNlbnNpdGl2ZS50ZXN0KHJlcXVlc3QuaHJlZikpIHx8XG4gICAgICAgICAgICAodGhpcy5fY2FzZUluc2Vuc2l0aXZlICYmXG4gICAgICAgICAgICAgdGhpcy5fY2FzZUluc2Vuc2l0aXZlLnRlc3QocmVxdWVzdC5sb3dlckNhc2VIcmVmKSkpO1xuICB9XG59XG5cbi8qKlxuICogQ29tcGlsZXMgcGF0dGVybnMgZnJvbSB0aGUgZ2l2ZW4gZmlsdGVycyBpbnRvIGEgc2luZ2xlXG4gKiBge0BsaW5rIG1vZHVsZTpwYXR0ZXJuc35Db21waWxlZFBhdHRlcm5zIENvbXBpbGVkUGF0dGVybnN9YCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHttb2R1bGU6ZmlsdGVyQ2xhc3Nlcy5VUkxGaWx0ZXJ8XG4gKiAgICAgICAgIFNldC48bW9kdWxlOmZpbHRlckNsYXNzZXMuVVJMRmlsdGVyPn0gZmlsdGVyc1xuICogICBUaGUgZmlsdGVycy4gSWYgdGhlIG51bWJlciBvZiBmaWx0ZXJzIGV4Y2VlZHNcbiAqICAgYHtAbGluayBtb2R1bGU6cGF0dGVybnN+Q09NUElMRV9QQVRURVJOU19NQVggQ09NUElMRV9QQVRURVJOU19NQVh9YCwgdGhlXG4gKiAgIGZ1bmN0aW9uIHJldHVybnMgYG51bGxgLlxuICpcbiAqIEByZXR1cm5zIHs/bW9kdWxlOnBhdHRlcm5zfkNvbXBpbGVkUGF0dGVybnN9XG4gKlxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy5jb21waWxlUGF0dGVybnMgPSBmdW5jdGlvbiBjb21waWxlUGF0dGVybnMoZmlsdGVycykge1xuICBsZXQgbGlzdCA9IEFycmF5LmlzQXJyYXkoZmlsdGVycykgPyBmaWx0ZXJzIDogW2ZpbHRlcnNdO1xuXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgZmlsdGVycyBpcyB0b28gbGFyZ2UsIGl0IG1heSBjaG9rZSBlc3BlY2lhbGx5IG9uIGxvdy1lbmRcbiAgLy8gcGxhdGZvcm1zLiBBcyBhIHByZWNhdXRpb24sIHdlIHJlZnVzZSB0byBjb21waWxlLiBJZGVhbGx5IHdlIHdvdWxkIGNoZWNrXG4gIC8vIHRoZSBsZW5ndGggb2YgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBzb3VyY2UgcmF0aGVyIHRoYW4gdGhlIG51bWJlciBvZlxuICAvLyBmaWx0ZXJzLCBidXQgdGhpcyBpcyBmYXIgbW9yZSBzdHJhaWdodGZvcndhcmQgYW5kIHByYWN0aWNhbC5cbiAgaWYgKGxpc3QubGVuZ3RoID4gQ09NUElMRV9QQVRURVJOU19NQVgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBjYXNlU2Vuc2l0aXZlID0gXCJcIjtcbiAgbGV0IGNhc2VJbnNlbnNpdGl2ZSA9IFwiXCI7XG5cbiAgZm9yIChsZXQgZmlsdGVyIG9mIGZpbHRlcnMpIHtcbiAgICBsZXQgc291cmNlID0gZmlsdGVyLnVybFBhdHRlcm4ucmVnZXhwU291cmNlO1xuXG4gICAgaWYgKGZpbHRlci5tYXRjaENhc2UpIHtcbiAgICAgIGNhc2VTZW5zaXRpdmUgKz0gc291cmNlICsgXCJ8XCI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY2FzZUluc2Vuc2l0aXZlICs9IHNvdXJjZSArIFwifFwiO1xuICAgIH1cbiAgfVxuXG4gIGxldCBjYXNlU2Vuc2l0aXZlUmVnRXhwID0gbnVsbDtcbiAgbGV0IGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCA9IG51bGw7XG5cbiAgdHJ5IHtcbiAgICBpZiAoY2FzZVNlbnNpdGl2ZSkge1xuICAgICAgY2FzZVNlbnNpdGl2ZVJlZ0V4cCA9IG5ldyBSZWdFeHAoY2FzZVNlbnNpdGl2ZS5zbGljZSgwLCAtMSkpO1xuICAgIH1cblxuICAgIGlmIChjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgIGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCA9IG5ldyBSZWdFeHAoY2FzZUluc2Vuc2l0aXZlLnNsaWNlKDAsIC0xKSk7XG4gICAgfVxuICB9XG4gIGNhdGNoIChlcnJvcikge1xuICAgIC8vIEl0IGlzIHBvc3NpYmxlIGluIHRoZW9yeSBmb3IgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBiZSB0b28gbGFyZ2VcbiAgICAvLyBkZXNwaXRlIENPTVBJTEVfUEFUVEVSTlNfTUFYXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gbmV3IENvbXBpbGVkUGF0dGVybnMoY2FzZVNlbnNpdGl2ZVJlZ0V4cCwgY2FzZUluc2Vuc2l0aXZlUmVnRXhwKTtcbn07XG5cbi8qKlxuICogUGF0dGVybnMgZm9yIG1hdGNoaW5nIGFnYWluc3QgVVJMcy5cbiAqXG4gKiBJbnRlcm5hbGx5LCB0aGlzIG1heSBiZSBhIFJlZ0V4cCBvciBtYXRjaCBkaXJlY3RseSBhZ2FpbnN0IHRoZVxuICogcGF0dGVybiBmb3Igc2ltcGxlIGxpdGVyYWwgcGF0dGVybnMuXG4gKi9cbmV4cG9ydHMuUGF0dGVybiA9IGNsYXNzIFBhdHRlcm4ge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gcGF0dGVybiB0aGF0IHJlcXVlc3RzIFVSTHMgc2hvdWxkIGJlXG4gICAqIG1hdGNoZWQgYWdhaW5zdCBpbiBmaWx0ZXIgdGV4dCBub3RhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2x9IG1hdGNoQ2FzZSBgdHJ1ZWAgaWYgY29tcGFyaXNvbnMgbXVzdCBiZSBjYXNlXG4gICAqIHNlbnNpdGl2ZVxuICAgKi9cbiAgY29uc3RydWN0b3IocGF0dGVybiwgbWF0Y2hDYXNlKSB7XG4gICAgdGhpcy5tYXRjaENhc2UgPSBtYXRjaENhc2UgfHwgZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMubWF0Y2hDYXNlKSB7XG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmIChwYXR0ZXJuLmxlbmd0aCA+PSAyICYmXG4gICAgICAgIHBhdHRlcm5bMF0gPT0gXCIvXCIgJiZcbiAgICAgICAgcGF0dGVybltwYXR0ZXJuLmxlbmd0aCAtIDFdID09IFwiL1wiKSB7XG4gICAgICAvLyBUaGUgZmlsdGVyIGlzIGEgcmVndWxhciBleHByZXNzaW9uIC0gY29udmVydCBpdCBpbW1lZGlhdGVseSB0b1xuICAgICAgLy8gY2F0Y2ggc3ludGF4IGVycm9yc1xuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyaW5nKDEsIHBhdHRlcm4ubGVuZ3RoIC0gMSk7XG4gICAgICB0aGlzLl9yZWdleHAgPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFBhdHRlcm5zIGxpa2UgL2Zvby9iYXIvKiBleGlzdCBzbyB0aGF0IHRoZXkgYXJlIG5vdCB0cmVhdGVkIGFzIHJlZ3VsYXJcbiAgICAgIC8vIGV4cHJlc3Npb25zLiBXZSBkcm9wIGFueSBzdXBlcmZsdW91cyB3aWxkY2FyZHMgaGVyZSBzbyBvdXJcbiAgICAgIC8vIG9wdGltaXphdGlvbnMgY2FuIGtpY2sgaW4uXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC9eXFwqKy8sIFwiXCIpLnJlcGxhY2UoL1xcKiskLywgXCJcIik7XG5cbiAgICAgIC8vIE5vIG5lZWQgdG8gY29udmVydCB0aGlzIGZpbHRlciB0byByZWd1bGFyIGV4cHJlc3Npb24geWV0LCBkbyBpdCBvblxuICAgICAgLy8gZGVtYW5kXG4gICAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgcGF0dGVybiBpcyBhIHN0cmluZyBvZiBsaXRlcmFsIGNoYXJhY3RlcnMgd2l0aFxuICAgKiBubyB3aWxkY2FyZHMgb3IgYW55IG90aGVyIHNwZWNpYWwgY2hhcmFjdGVycy5cbiAgICpcbiAgICogSWYgdGhlIHBhdHRlcm4gaXMgcHJlZml4ZWQgd2l0aCBhIGB8fGAgb3Igc3VmZml4ZWQgd2l0aCBhIGBeYCBidXQgb3RoZXJ3aXNlXG4gICAqIGNvbnRhaW5zIG5vIHNwZWNpYWwgY2hhcmFjdGVycywgaXQgaXMgc3RpbGwgY29uc2lkZXJlZCB0byBiZSBhIGxpdGVyYWxcbiAgICogcGF0dGVybi5cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0xpdGVyYWxQYXR0ZXJuKCkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5wYXR0ZXJuICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAhL1sqXnxdLy50ZXN0KHRoaXMucGF0dGVybi5yZXBsYWNlKC9eXFx8ezEsMn0vLCBcIlwiKS5yZXBsYWNlKC9bfF5dJC8sIFwiXCIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYmUgdXNlZCB3aGVuIHRlc3RpbmcgYWdhaW5zdCB0aGlzIHBhdHRlcm4uXG4gICAqXG4gICAqIG51bGwgaWYgdGhlIHBhdHRlcm4gaXMgbWF0Y2hlZCB3aXRob3V0IHVzaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICBnZXQgcmVnZXhwKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fcmVnZXhwID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuX3JlZ2V4cCA9IHRoaXMuaXNMaXRlcmFsUGF0dGVybigpID9cbiAgICAgICAgbnVsbCA6IG5ldyBSZWdFeHAoZmlsdGVyVG9SZWdFeHAodGhpcy5wYXR0ZXJuKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZWdleHA7XG4gIH1cblxuICAvKipcbiAgICogUGF0dGVybiBpbiByZWd1bGFyIGV4cHJlc3Npb24gbm90YXRpb24uIFRoaXMgd2lsbCBoYXZlIGEgdmFsdWVcbiAgICogZXZlbiBpZiBgcmVnZXhwYCByZXR1cm5zIG51bGwuXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBnZXQgcmVnZXhwU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLl9yZWdleHAgPyB0aGlzLl9yZWdleHAuc291cmNlIDogZmlsdGVyVG9SZWdFeHAodGhpcy5wYXR0ZXJuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gVVJMIHJlcXVlc3QgbWF0Y2hlcyB0aGlzIGZpbHRlcidzIHBhdHRlcm4uXG4gICAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkxSZXF1ZXN0fSByZXF1ZXN0IFRoZSBVUkwgcmVxdWVzdCB0byBjaGVjay5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgVVJMIHJlcXVlc3QgbWF0Y2hlcy5cbiAgICovXG4gIG1hdGNoZXNMb2NhdGlvbihyZXF1ZXN0KSB7XG4gICAgbGV0IGxvY2F0aW9uID0gdGhpcy5tYXRjaENhc2UgPyByZXF1ZXN0LmhyZWYgOiByZXF1ZXN0Lmxvd2VyQ2FzZUhyZWY7XG4gICAgbGV0IHJlZ2V4cCA9IHRoaXMucmVnZXhwO1xuICAgIGlmIChyZWdleHApIHtcbiAgICAgIHJldHVybiByZWdleHAudGVzdChsb2NhdGlvbik7XG4gICAgfVxuXG4gICAgbGV0IHBhdHRlcm4gPSB0aGlzLnBhdHRlcm47XG4gICAgbGV0IHN0YXJ0c1dpdGhBbmNob3IgPSBwYXR0ZXJuWzBdID09IFwifFwiO1xuICAgIGxldCBzdGFydHNXaXRoRXh0ZW5kZWRBbmNob3IgPSBzdGFydHNXaXRoQW5jaG9yICYmIHBhdHRlcm5bMV0gPT0gXCJ8XCI7XG4gICAgbGV0IGVuZHNXaXRoU2VwYXJhdG9yID0gcGF0dGVybltwYXR0ZXJuLmxlbmd0aCAtIDFdID09IFwiXlwiO1xuICAgIGxldCBlbmRzV2l0aEFuY2hvciA9ICFlbmRzV2l0aFNlcGFyYXRvciAmJlxuICAgICAgICBwYXR0ZXJuW3BhdHRlcm4ubGVuZ3RoIC0gMV0gPT0gXCJ8XCI7XG5cbiAgICBpZiAoc3RhcnRzV2l0aEV4dGVuZGVkQW5jaG9yKSB7XG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMik7XG4gICAgfVxuICAgIGVsc2UgaWYgKHN0YXJ0c1dpdGhBbmNob3IpIHtcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cigxKTtcbiAgICB9XG5cbiAgICBpZiAoZW5kc1dpdGhTZXBhcmF0b3IgfHwgZW5kc1dpdGhBbmNob3IpIHtcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnNsaWNlKDAsIC0xKTtcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSBsb2NhdGlvbi5pbmRleE9mKHBhdHRlcm4pO1xuXG4gICAgd2hpbGUgKGluZGV4ICE9IC0xKSB7XG4gICAgICAvLyBUaGUgXCJ8fFwiIHByZWZpeCByZXF1aXJlcyB0aGF0IHRoZSB0ZXh0IHRoYXQgZm9sbG93cyBkb2VzIG5vdCBzdGFydFxuICAgICAgLy8gd2l0aCBhIGZvcndhcmQgc2xhc2guXG4gICAgICBpZiAoKHN0YXJ0c1dpdGhFeHRlbmRlZEFuY2hvciA/XG4gICAgICAgICAgIGxvY2F0aW9uW2luZGV4XSAhPSBcIi9cIiAmJlxuICAgICAgICAgICBleHRlbmRlZEFuY2hvclJlZ0V4cC50ZXN0KGxvY2F0aW9uLnN1YnN0cmluZygwLCBpbmRleCkpIDpcbiAgICAgICAgICAgc3RhcnRzV2l0aEFuY2hvciA/XG4gICAgICAgICAgIGluZGV4ID09IDAgOlxuICAgICAgICAgICB0cnVlKSAmJlxuICAgICAgICAgIChlbmRzV2l0aFNlcGFyYXRvciA/XG4gICAgICAgICAgICFsb2NhdGlvbltpbmRleCArIHBhdHRlcm4ubGVuZ3RoXSB8fFxuICAgICAgICAgICBzZXBhcmF0b3JSZWdFeHAudGVzdChsb2NhdGlvbltpbmRleCArIHBhdHRlcm4ubGVuZ3RoXSkgOlxuICAgICAgICAgICBlbmRzV2l0aEFuY2hvciA/XG4gICAgICAgICAgIGluZGV4ID09IGxvY2F0aW9uLmxlbmd0aCAtIHBhdHRlcm4ubGVuZ3RoIDpcbiAgICAgICAgICAgdHJ1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXR0ZXJuID09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGluZGV4ID0gbG9jYXRpb24uaW5kZXhPZihwYXR0ZXJuLCBpbmRleCArIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgcGF0dGVybiBoYXMga2V5d29yZHNcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBoYXNLZXl3b3JkcygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXR0ZXJuICYmIGtleXdvcmRSZWdFeHAudGVzdCh0aGlzLnBhdHRlcm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIGFsbCBrZXl3b3JkcyB0aGF0IGNvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHBhdHRlcm5cbiAgICogQHJldHVybnMge3N0cmluZ1tdfVxuICAgKi9cbiAga2V5d29yZENhbmRpZGF0ZXMoKSB7XG4gICAgaWYgKCF0aGlzLnBhdHRlcm4pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYXR0ZXJuLnRvTG93ZXJDYXNlKCkubWF0Y2goYWxsS2V5d29yZHNSZWdFeHApO1xuICB9XG59O1xuIiwiLyogQEBwYWNrYWdlX25hbWUgLSB2QEB2ZXJzaW9uIC0gQEB0aW1lc3RhbXAgKi9cbi8qIC0qLSBNb2RlOiBpbmRlbnQtdGFicy1tb2RlOiBuaWw7IGpzLWluZGVudC1sZXZlbDogMiAtKi0gKi9cbi8qIHZpbTogc2V0IHN0cz0yIHN3PTIgZXQgdHc9ODA6ICovXG4vKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXG4gKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gKiBmaWxlLCBZb3UgY2FuIG9idGFpbiBvbmUgYXQgaHR0cDovL21vemlsbGEub3JnL01QTC8yLjAvLiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmlmICghKGdsb2JhbFRoaXMuY2hyb21lICYmIGdsb2JhbFRoaXMuY2hyb21lLnJ1bnRpbWUgJiYgZ2xvYmFsVGhpcy5jaHJvbWUucnVudGltZS5pZCkpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzY3JpcHQgc2hvdWxkIG9ubHkgYmUgbG9hZGVkIGluIGEgYnJvd3NlciBleHRlbnNpb24uXCIpO1xufVxuXG5pZiAoIShnbG9iYWxUaGlzLmJyb3dzZXIgJiYgZ2xvYmFsVGhpcy5icm93c2VyLnJ1bnRpbWUgJiYgZ2xvYmFsVGhpcy5icm93c2VyLnJ1bnRpbWUuaWQpKSB7XG4gIGNvbnN0IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSA9IFwiVGhlIG1lc3NhZ2UgcG9ydCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlwiO1xuICBjb25zdCBFUlJPUl9UT19JR05PUkUgPSBgQSBsaXN0ZW5lciBpbmRpY2F0ZWQgYW4gYXN5bmNocm9ub3VzIHJlc3BvbnNlIGJ5IHJldHVybmluZyB0cnVlLCBidXQgdGhlIG1lc3NhZ2UgY2hhbm5lbCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkYDtcblxuICAvLyBXcmFwcGluZyB0aGUgYnVsayBvZiB0aGlzIHBvbHlmaWxsIGluIGEgb25lLXRpbWUtdXNlIGZ1bmN0aW9uIGlzIGEgbWlub3JcbiAgLy8gb3B0aW1pemF0aW9uIGZvciBGaXJlZm94LiBTaW5jZSBTcGlkZXJtb25rZXkgZG9lcyBub3QgZnVsbHkgcGFyc2UgdGhlXG4gIC8vIGNvbnRlbnRzIG9mIGEgZnVuY3Rpb24gdW50aWwgdGhlIGZpcnN0IHRpbWUgaXQncyBjYWxsZWQsIGFuZCBzaW5jZSBpdCB3aWxsXG4gIC8vIG5ldmVyIGFjdHVhbGx5IG5lZWQgdG8gYmUgY2FsbGVkLCB0aGlzIGFsbG93cyB0aGUgcG9seWZpbGwgdG8gYmUgaW5jbHVkZWRcbiAgLy8gaW4gRmlyZWZveCBuZWFybHkgZm9yIGZyZWUuXG4gIGNvbnN0IHdyYXBBUElzID0gZXh0ZW5zaW9uQVBJcyA9PiB7XG4gICAgLy8gTk9URTogYXBpTWV0YWRhdGEgaXMgYXNzb2NpYXRlZCB0byB0aGUgY29udGVudCBvZiB0aGUgYXBpLW1ldGFkYXRhLmpzb24gZmlsZVxuICAgIC8vIGF0IGJ1aWxkIHRpbWUgYnkgcmVwbGFjaW5nIHRoZSBmb2xsb3dpbmcgXCJpbmNsdWRlXCIgd2l0aCB0aGUgY29udGVudCBvZiB0aGVcbiAgICAvLyBKU09OIGZpbGUuXG4gICAgY29uc3QgYXBpTWV0YWRhdGEgPSByZXF1aXJlKFwiLi4vYXBpLW1ldGFkYXRhLmpzb25cIik7XG5cbiAgICBpZiAoT2JqZWN0LmtleXMoYXBpTWV0YWRhdGEpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXBpLW1ldGFkYXRhLmpzb24gaGFzIG5vdCBiZWVuIGluY2x1ZGVkIGluIGJyb3dzZXItcG9seWZpbGxcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBXZWFrTWFwIHN1YmNsYXNzIHdoaWNoIGNyZWF0ZXMgYW5kIHN0b3JlcyBhIHZhbHVlIGZvciBhbnkga2V5IHdoaWNoIGRvZXNcbiAgICAgKiBub3QgZXhpc3Qgd2hlbiBhY2Nlc3NlZCwgYnV0IGJlaGF2ZXMgZXhhY3RseSBhcyBhbiBvcmRpbmFyeSBXZWFrTWFwXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY3JlYXRlSXRlbVxuICAgICAqICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgdmFsdWUgZm9yIGFueVxuICAgICAqICAgICAgICBrZXkgd2hpY2ggZG9lcyBub3QgZXhpc3QsIHRoZSBmaXJzdCB0aW1lIGl0IGlzIGFjY2Vzc2VkLiBUaGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZXMsIGFzIGl0cyBvbmx5IGFyZ3VtZW50LCB0aGUga2V5IGJlaW5nIGNyZWF0ZWQuXG4gICAgICovXG4gICAgY2xhc3MgRGVmYXVsdFdlYWtNYXAgZXh0ZW5kcyBXZWFrTWFwIHtcbiAgICAgIGNvbnN0cnVjdG9yKGNyZWF0ZUl0ZW0sIGl0ZW1zID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN1cGVyKGl0ZW1zKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJdGVtID0gY3JlYXRlSXRlbTtcbiAgICAgIH1cblxuICAgICAgZ2V0KGtleSkge1xuICAgICAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICB0aGlzLnNldChrZXksIHRoaXMuY3JlYXRlSXRlbShrZXkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdXBlci5nZXQoa2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBvYmplY3Qgd2l0aCBhIGB0aGVuYCBtZXRob2QsIGFuZCBjYW5cbiAgICAgKiB0aGVyZWZvcmUgYmUgYXNzdW1lZCB0byBiZWhhdmUgYXMgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdGhlbmFibGUuXG4gICAgICovXG4gICAgY29uc3QgaXNUaGVuYWJsZSA9IHZhbHVlID0+IHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoLCB3aGVuIGNhbGxlZCwgd2lsbCByZXNvbHZlIG9yIHJlamVjdFxuICAgICAqIHRoZSBnaXZlbiBwcm9taXNlIGJhc2VkIG9uIGhvdyBpdCBpcyBjYWxsZWQ6XG4gICAgICpcbiAgICAgKiAtIElmLCB3aGVuIGNhbGxlZCwgYGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcmAgY29udGFpbnMgYSBub24tbnVsbCBvYmplY3QsXG4gICAgICogICB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aXRoIHRoYXQgdmFsdWUuXG4gICAgICogLSBJZiB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggZXhhY3RseSBvbmUgYXJndW1lbnQsIHRoZSBwcm9taXNlIGlzXG4gICAgICogICByZXNvbHZlZCB0byB0aGF0IHZhbHVlLlxuICAgICAqIC0gT3RoZXJ3aXNlLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB0byBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGVcbiAgICAgKiAgIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHByb21pc2VcbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc29sdXRpb24gYW5kIHJlamVjdGlvbiBmdW5jdGlvbnMgb2YgYVxuICAgICAqICAgICAgICBwcm9taXNlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVzb2x2ZVxuICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlc29sdXRpb24gZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZWplY3RcbiAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZWplY3Rpb24gZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSB3cmFwcGVkIG1ldGhvZCB3aGljaCBoYXMgY3JlYXRlZCB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICogICAgICAgIFRoZSBnZW5lcmF0ZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICovXG4gICAgY29uc3QgbWFrZUNhbGxiYWNrID0gKHByb21pc2UsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAvLyBJbiBjYXNlIHdlIGVuY291bnRlciBhIGJyb3dzZXIgZXJyb3IgaW4gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCB3ZSBkb24ndFxuICAgICAgLy8gd2FudCB0byBsb3NlIHRoZSBzdGFjayB0cmFjZSBsZWFkaW5nIHVwIHRvIHRoaXMgcG9pbnQuIEZvciB0aGF0IHJlYXNvbixcbiAgICAgIC8vIHdlIG5lZWQgdG8gaW5zdGFudGlhdGUgdGhlIGVycm9yIG91dHNpZGUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICByZXR1cm4gKC4uLmNhbGxiYWNrQXJncykgPT4ge1xuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgcHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnIHx8XG4gICAgICAgICAgICAgICAgICAgKGNhbGxiYWNrQXJncy5sZW5ndGggPD0gMSAmJiBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyAhPT0gZmFsc2UpKSB7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJnc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJncyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IHBsdXJhbGl6ZUFyZ3VtZW50cyA9IChudW1BcmdzKSA9PiBudW1BcmdzID09IDEgPyBcImFyZ3VtZW50XCIgOiBcImFyZ3VtZW50c1wiO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24gZm9yIGEgbWV0aG9kIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1ldGFkYXRhLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKiAgICAgICAgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB3aGljaCBpcyBiZWluZyB3cmFwcGVkLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5taW5BcmdzXG4gICAgICogICAgICAgIFRoZSBtaW5pbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbXVzdCBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBmZXdlciB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5tYXhBcmdzXG4gICAgICogICAgICAgIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIG1vcmUgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9uKG9iamVjdCwgLi4uKil9XG4gICAgICogICAgICAgVGhlIGdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBBc3luY0Z1bmN0aW9uID0gKG5hbWUsIG1ldGFkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gYXN5bmNGdW5jdGlvbldyYXBwZXIodGFyZ2V0LCAuLi5hcmdzKSB7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUaGlzIEFQSSBtZXRob2QgaGFzIGN1cnJlbnRseSBubyBjYWxsYmFjayBvbiBDaHJvbWUsIGJ1dCBpdCByZXR1cm4gYSBwcm9taXNlIG9uIEZpcmVmb3gsXG4gICAgICAgICAgICAvLyBhbmQgc28gdGhlIHBvbHlmaWxsIHdpbGwgdHJ5IHRvIGNhbGwgaXQgd2l0aCBhIGNhbGxiYWNrIGZpcnN0LCBhbmQgaXQgd2lsbCBmYWxsYmFja1xuICAgICAgICAgICAgLy8gdG8gbm90IHBhc3NpbmcgdGhlIGNhbGxiYWNrIGlmIHRoZSBmaXJzdCBjYWxsIGZhaWxzLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7cmVzb2x2ZSwgcmVqZWN0fSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGNiRXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGAke25hbWV9IEFQSSBtZXRob2QgZG9lc24ndCBzZWVtIHRvIHN1cHBvcnQgdGhlIGNhbGxiYWNrIHBhcmFtZXRlciwgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsIGNiRXJyb3IpO1xuXG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcblxuICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIEFQSSBtZXRob2QgbWV0YWRhdGEsIHNvIHRoYXQgdGhlIG5leHQgQVBJIGNhbGxzIHdpbGwgbm90IHRyeSB0b1xuICAgICAgICAgICAgICAvLyB1c2UgdGhlIHVuc3VwcG9ydGVkIGNhbGxiYWNrIGFueW1vcmUuXG4gICAgICAgICAgICAgIG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgIG1ldGFkYXRhLm5vQ2FsbGJhY2sgPSB0cnVlO1xuXG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLm5vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7cmVzb2x2ZSwgcmVqZWN0fSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYW4gZXhpc3RpbmcgbWV0aG9kIG9mIHRoZSB0YXJnZXQgb2JqZWN0LCBzbyB0aGF0IGNhbGxzIHRvIGl0IGFyZVxuICAgICAqIGludGVyY2VwdGVkIGJ5IHRoZSBnaXZlbiB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBmdW5jdGlvbiByZWNlaXZlcyxcbiAgICAgKiBhcyBpdHMgZmlyc3QgYXJndW1lbnQsIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YCBvYmplY3QsIGZvbGxvd2VkIGJ5IGVhY2ggb2ZcbiAgICAgKiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAqICAgICAgICBUaGUgb3JpZ2luYWwgdGFyZ2V0IG9iamVjdCB0aGF0IHRoZSB3cmFwcGVkIG1ldGhvZCBiZWxvbmdzIHRvLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZFxuICAgICAqICAgICAgICBUaGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuIFRoaXMgaXMgdXNlZCBhcyB0aGUgdGFyZ2V0IG9mIHRoZSBQcm94eVxuICAgICAqICAgICAgICBvYmplY3Qgd2hpY2ggaXMgY3JlYXRlZCB0byB3cmFwIHRoZSBtZXRob2QuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gd3JhcHBlclxuICAgICAqICAgICAgICBUaGUgd3JhcHBlciBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgYSBkaXJlY3QgaW52b2NhdGlvblxuICAgICAqICAgICAgICBvZiB0aGUgd3JhcHBlZCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJveHk8ZnVuY3Rpb24+fVxuICAgICAqICAgICAgICBBIFByb3h5IG9iamVjdCBmb3IgdGhlIGdpdmVuIG1ldGhvZCwgd2hpY2ggaW52b2tlcyB0aGUgZ2l2ZW4gd3JhcHBlclxuICAgICAqICAgICAgICBtZXRob2QgaW4gaXRzIHBsYWNlLlxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBNZXRob2QgPSAodGFyZ2V0LCBtZXRob2QsIHdyYXBwZXIpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJveHkobWV0aG9kLCB7XG4gICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgIHJldHVybiB3cmFwcGVyLmNhbGwodGhpc09iaiwgdGFyZ2V0LCAuLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgaGFzT3duUHJvcGVydHkgPSBGdW5jdGlvbi5jYWxsLmJpbmQoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhbiBvYmplY3QgaW4gYSBQcm94eSB3aGljaCBpbnRlcmNlcHRzIGFuZCB3cmFwcyBjZXJ0YWluIG1ldGhvZHNcbiAgICAgKiBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHdyYXBwZXJzYCBhbmQgYG1ldGFkYXRhYCBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAqICAgICAgICBUaGUgdGFyZ2V0IG9iamVjdCB0byB3cmFwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFt3cmFwcGVycyA9IHt9XVxuICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBzcGVjaWFsIGNhc2VzLiBBbnlcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gcHJlc2VudCBpbiB0aGlzIG9iamVjdCB0cmVlIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGVcbiAgICAgKiAgICAgICAgbWV0aG9kIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZS4gVGhlc2VcbiAgICAgKiAgICAgICAgd3JhcHBlciBtZXRob2RzIGFyZSBpbnZva2VkIGFzIGRlc2NyaWJlZCBpbiB7QHNlZSB3cmFwTWV0aG9kfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbbWV0YWRhdGEgPSB7fV1cbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyBtZXRhZGF0YSB1c2VkIHRvIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVcbiAgICAgKiAgICAgICAgUHJvbWlzZS1iYXNlZCB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYXN5bmNocm9ub3VzLiBBbnkgZnVuY3Rpb24gaW5cbiAgICAgKiAgICAgICAgdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlIHdoaWNoIGhhcyBhIGNvcnJlc3BvbmRpbmcgbWV0YWRhdGEgb2JqZWN0XG4gICAgICogICAgICAgIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgbWV0YWRhdGFgIHRyZWUgaXMgcmVwbGFjZWQgd2l0aCBhblxuICAgICAqICAgICAgICBhdXRvbWF0aWNhbGx5LWdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLCBhcyBkZXNjcmliZWQgaW5cbiAgICAgKiAgICAgICAge0BzZWUgd3JhcEFzeW5jRnVuY3Rpb259XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJveHk8b2JqZWN0Pn1cbiAgICAgKi9cbiAgICBjb25zdCB3cmFwT2JqZWN0ID0gKHRhcmdldCwgd3JhcHBlcnMgPSB7fSwgbWV0YWRhdGEgPSB7fSkgPT4ge1xuICAgICAgbGV0IGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIGxldCBoYW5kbGVycyA9IHtcbiAgICAgICAgaGFzKHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0IHx8IHByb3AgaW4gY2FjaGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0KHByb3h5VGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEocHJvcCBpbiB0YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB2YWx1ZSA9IHRhcmdldFtwcm9wXTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBvYmplY3QuIENoZWNrIGlmIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgIC8vIGFueSB3cmFwcGluZy5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3cmFwcGVyc1twcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzcGVjaWFsLWNhc2Ugd3JhcHBlciBmb3IgdGhpcyBtZXRob2QuXG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcnNbcHJvcF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBhc3luYyBtZXRob2QgdGhhdCB3ZSBoYXZlIG1ldGFkYXRhIGZvci4gQ3JlYXRlIGFcbiAgICAgICAgICAgICAgLy8gUHJvbWlzZSB3cmFwcGVyIGZvciBpdC5cbiAgICAgICAgICAgICAgbGV0IHdyYXBwZXIgPSB3cmFwQXN5bmNGdW5jdGlvbihwcm9wLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIHRoYXQgd2UgZG9uJ3Qga25vdyBvciBjYXJlIGFib3V0LiBSZXR1cm4gdGhlXG4gICAgICAgICAgICAgIC8vIG9yaWdpbmFsIG1ldGhvZCwgYm91bmQgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgKGhhc093blByb3BlcnR5KHdyYXBwZXJzLCBwcm9wKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgd2UgbmVlZCB0byBkbyBzb21lIHdyYXBwaW5nIGZvciB0aGUgY2hpbGRyZW5cbiAgICAgICAgICAgIC8vIG9mLiBDcmVhdGUgYSBzdWItb2JqZWN0IHdyYXBwZXIgZm9yIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGNoaWxkXG4gICAgICAgICAgICAvLyBtZXRhZGF0YS5cbiAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBcIipcIikpIHtcbiAgICAgICAgICAgIC8vIFdyYXAgYWxsIHByb3BlcnRpZXMgaW4gKiBuYW1lc3BhY2UuXG4gICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtcIipcIl0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueSB3cmFwcGluZyBmb3IgdGhpcyBwcm9wZXJ0eSxcbiAgICAgICAgICAgIC8vIHNvIGp1c3QgZm9yd2FyZCBhbGwgYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwge1xuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0KHByb3h5VGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wLCBkZXNjKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIGRlc2MpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoY2FjaGUsIHByb3ApO1xuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgLy8gUGVyIGNvbnRyYWN0IG9mIHRoZSBQcm94eSBBUEksIHRoZSBcImdldFwiIHByb3h5IGhhbmRsZXIgbXVzdCByZXR1cm4gdGhlXG4gICAgICAvLyBvcmlnaW5hbCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGlmIHRoYXQgdmFsdWUgaXMgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZFxuICAgICAgLy8gbm9uLWNvbmZpZ3VyYWJsZS4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlXG4gICAgICAvLyBwcm90b3R5cGUgc2V0IHRvIGB0YXJnZXRgIGluc3RlYWQgb2YgdXNpbmcgYHRhcmdldGAgZGlyZWN0bHkuXG4gICAgICAvLyBPdGhlcndpc2Ugd2UgY2Fubm90IHJldHVybiBhIGN1c3RvbSBvYmplY3QgZm9yIEFQSXMgdGhhdFxuICAgICAgLy8gYXJlIGRlY2xhcmVkIHJlYWQtb25seSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSwgc3VjaCBhcyBgY2hyb21lLmRldnRvb2xzYC5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgcHJveHkgaGFuZGxlcnMgdGhlbXNlbHZlcyB3aWxsIHN0aWxsIHVzZSB0aGUgb3JpZ2luYWwgYHRhcmdldGBcbiAgICAgIC8vIGluc3RlYWQgb2YgdGhlIGBwcm94eVRhcmdldGAsIHNvIHRoYXQgdGhlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXJlXG4gICAgICAvLyBkZXJlZmVyZW5jZWQgdmlhIHRoZSBvcmlnaW5hbCB0YXJnZXRzLlxuICAgICAgbGV0IHByb3h5VGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZSh0YXJnZXQpO1xuICAgICAgcmV0dXJuIG5ldyBQcm94eShwcm94eVRhcmdldCwgaGFuZGxlcnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2V0IG9mIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBvYmplY3QsIHdoaWNoIGhhbmRsZXNcbiAgICAgKiB3cmFwcGluZyBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCB0aG9zZSBtZXNzYWdlcyBhcmUgcGFzc2VkLlxuICAgICAqXG4gICAgICogQSBzaW5nbGUgd3JhcHBlciBpcyBjcmVhdGVkIGZvciBlYWNoIGxpc3RlbmVyIGZ1bmN0aW9uLCBhbmQgc3RvcmVkIGluIGFcbiAgICAgKiBtYXAuIFN1YnNlcXVlbnQgY2FsbHMgdG8gYGFkZExpc3RlbmVyYCwgYGhhc0xpc3RlbmVyYCwgb3IgYHJlbW92ZUxpc3RlbmVyYFxuICAgICAqIHJldHJpZXZlIHRoZSBvcmlnaW5hbCB3cmFwcGVyLCBzbyB0aGF0ICBhdHRlbXB0cyB0byByZW1vdmUgYVxuICAgICAqIHByZXZpb3VzbHktYWRkZWQgbGlzdGVuZXIgd29yayBhcyBleHBlY3RlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RGVmYXVsdFdlYWtNYXA8ZnVuY3Rpb24sIGZ1bmN0aW9uPn0gd3JhcHBlck1hcFxuICAgICAqICAgICAgICBBIERlZmF1bHRXZWFrTWFwIG9iamVjdCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgYXBwcm9wcmlhdGUgd3JhcHBlclxuICAgICAqICAgICAgICBmb3IgYSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiB3aGVuIG9uZSBkb2VzIG5vdCBleGlzdCwgYW5kIHJldHJpZXZlXG4gICAgICogICAgICAgIGFuIGV4aXN0aW5nIG9uZSB3aGVuIGl0IGRvZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBFdmVudCA9IHdyYXBwZXJNYXAgPT4gKHtcbiAgICAgIGFkZExpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIsIC4uLmFyZ3MpIHtcbiAgICAgICAgdGFyZ2V0LmFkZExpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSwgLi4uYXJncyk7XG4gICAgICB9LFxuXG4gICAgICBoYXNMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuaGFzTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZUxpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIG9uUmVxdWVzdEZpbmlzaGVkIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgd2lsbCByZXR1cm4gYVxuICAgICAgICogYGdldENvbnRlbnQoKWAgcHJvcGVydHkgd2hpY2ggcmV0dXJucyBhIGBQcm9taXNlYCByYXRoZXIgdGhhbiB1c2luZyBhXG4gICAgICAgKiBjYWxsYmFjayBBUEkuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICAgICAgICogICAgICAgIFRoZSBIQVIgZW50cnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbmV0d29yayByZXF1ZXN0LlxuICAgICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gb25SZXF1ZXN0RmluaXNoZWQocmVxKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRSZXEgPSB3cmFwT2JqZWN0KHJlcSwge30gLyogd3JhcHBlcnMgKi8sIHtcbiAgICAgICAgICBnZXRDb250ZW50OiB7XG4gICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbGlzdGVuZXIod3JhcHBlZFJlcSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb25NZXNzYWdlV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAobGlzdGVuZXIgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhIG1lc3NhZ2UgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCBtYXkgc2VuZCByZXNwb25zZXMgYmFzZWQgb25cbiAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAqIGNhbGxiYWNrLiBJZiB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gcmV0dXJucyBhIFByb21pc2UsIHRoZSByZXNwb25zZSBpc1xuICAgICAgICogc2VudCB3aGVuIHRoZSBwcm9taXNlIGVpdGhlciByZXNvbHZlcyBvciByZWplY3RzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7Kn0gbWVzc2FnZVxuICAgICAgICogICAgICAgIFRoZSBtZXNzYWdlIHNlbnQgYnkgdGhlIG90aGVyIGVuZCBvZiB0aGUgY2hhbm5lbC5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAqICAgICAgICBEZXRhaWxzIGFib3V0IHRoZSBzZW5kZXIgb2YgdGhlIG1lc3NhZ2UuXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCopfSBzZW5kUmVzcG9uc2VcbiAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAqICAgICAgICB0aGF0IHZhbHVlIGFzIGEgcmVzcG9uc2UuXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICogICAgICAgIHlpZWxkIGEgcmVzcG9uc2UuIEZhbHNlIG90aGVyd2lzZS5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCB3cmFwcGVkU2VuZFJlc3BvbnNlO1xuICAgICAgICBsZXQgc2VuZFJlc3BvbnNlUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgIHdyYXBwZWRTZW5kUmVzcG9uc2UgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IHRydWU7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGxpc3RlbmVyKG1lc3NhZ2UsIHNlbmRlciwgd3JhcHBlZFNlbmRSZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlc3VsdCA9IFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTtcblxuICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgZGlkbid0IHJldHVybmVkIHRydWUgb3IgYSBQcm9taXNlLCBvciBjYWxsZWRcbiAgICAgICAgLy8gd3JhcHBlZFNlbmRSZXNwb25zZSBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gZXhpdCBlYXJsaWVyXG4gICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyByZXNwb25zZSBzZW50IGZyb20gdGhpcyBsaXN0ZW5lci5cbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSAmJiAhaXNSZXN1bHRUaGVuYWJsZSAmJiAhZGlkQ2FsbFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgc21hbGwgaGVscGVyIHRvIHNlbmQgdGhlIG1lc3NhZ2UgaWYgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgICAgLy8gYW5kIGFuIGVycm9yIGlmIHRoZSBwcm9taXNlIHJlamVjdHMgKGEgd3JhcHBlZCBzZW5kTWVzc2FnZSBoYXNcbiAgICAgICAgLy8gdG8gdHJhbnNsYXRlIHRoZSBtZXNzYWdlIGludG8gYSByZXNvbHZlZCBwcm9taXNlIG9yIGEgcmVqZWN0ZWRcbiAgICAgICAgLy8gcHJvbWlzZSkuXG4gICAgICAgIGNvbnN0IHNlbmRQcm9taXNlZFJlc3VsdCA9IChwcm9taXNlKSA9PiB7XG4gICAgICAgICAgcHJvbWlzZS50aGVuKG1zZyA9PiB7XG4gICAgICAgICAgICAvLyBzZW5kIHRoZSBtZXNzYWdlIHZhbHVlLlxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgLy8gU2VuZCBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGlmIHRoZSByZWplY3RlZCB2YWx1ZVxuICAgICAgICAgICAgLy8gaXMgYW4gaW5zdGFuY2Ugb2YgZXJyb3IsIG9yIHRoZSBvYmplY3QgaXRzZWxmIG90aGVyd2lzZS5cbiAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICAgICAgaWYgKGVycm9yICYmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yIHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICBfX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X186IHRydWUsXG4gICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgLy8gUHJpbnQgYW4gZXJyb3Igb24gdGhlIGNvbnNvbGUgaWYgdW5hYmxlIHRvIHNlbmQgdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzZW5kIG9uTWVzc2FnZSByZWplY3RlZCByZXBseVwiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHNlbmQgdGhlIHJlc29sdmVkIHZhbHVlIGFzIGFcbiAgICAgICAgLy8gcmVzdWx0LCBvdGhlcndpc2Ugd2FpdCB0aGUgcHJvbWlzZSByZWxhdGVkIHRvIHRoZSB3cmFwcGVkU2VuZFJlc3BvbnNlXG4gICAgICAgIC8vIGNhbGxiYWNrIHRvIHJlc29sdmUgYW5kIHNlbmQgaXQgYXMgYSByZXNwb25zZS5cbiAgICAgICAgaWYgKGlzUmVzdWx0VGhlbmFibGUpIHtcbiAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQoc2VuZFJlc3BvbnNlUHJvbWlzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXQgQ2hyb21lIGtub3cgdGhhdCB0aGUgbGlzdGVuZXIgaXMgcmVwbHlpbmcuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrID0gKHtyZWplY3QsIHJlc29sdmV9LCByZXBseSkgPT4ge1xuICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgLy8gRGV0ZWN0IHdoZW4gbm9uZSBvZiB0aGUgbGlzdGVuZXJzIHJlcGxpZWQgdG8gdGhlIHNlbmRNZXNzYWdlIGNhbGwgYW5kIHJlc29sdmVcbiAgICAgICAgLy8gdGhlIHByb21pc2UgdG8gdW5kZWZpbmVkIGFzIGluIEZpcmVmb3guXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS93ZWJleHRlbnNpb24tcG9seWZpbGwvaXNzdWVzLzEzMFxuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlID09PSBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UgfHwgZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlLmluY2x1ZGVzKEVSUk9SX1RPX0lHTk9SRSkpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZXBseSAmJiByZXBseS5fX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X18pIHtcbiAgICAgICAgLy8gQ29udmVydCBiYWNrIHRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpbnRvXG4gICAgICAgIC8vIGFuIEVycm9yIGluc3RhbmNlLlxuICAgICAgICByZWplY3QobmV3IEVycm9yKHJlcGx5Lm1lc3NhZ2UpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUocmVwbHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2UgPSAobmFtZSwgbWV0YWRhdGEsIGFwaU5hbWVzcGFjZU9iaiwgLi4uYXJncykgPT4ge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZENiID0gd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2suYmluZChudWxsLCB7cmVzb2x2ZSwgcmVqZWN0fSk7XG4gICAgICAgIGFyZ3MucHVzaCh3cmFwcGVkQ2IpO1xuICAgICAgICBhcGlOYW1lc3BhY2VPYmouc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc3RhdGljV3JhcHBlcnMgPSB7XG4gICAgICBkZXZ0b29sczoge1xuICAgICAgICBuZXR3b3JrOiB7XG4gICAgICAgICAgb25SZXF1ZXN0RmluaXNoZWQ6IHdyYXBFdmVudChvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBydW50aW1lOiB7XG4gICAgICAgIG9uTWVzc2FnZTogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgb25NZXNzYWdlRXh0ZXJuYWw6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHttaW5BcmdzOiAxLCBtYXhBcmdzOiAzfSksXG4gICAgICB9LFxuICAgICAgdGFiczoge1xuICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7bWluQXJnczogMiwgbWF4QXJnczogM30pLFxuICAgICAgfSxcbiAgICB9O1xuICAgIGNvbnN0IHNldHRpbmdNZXRhZGF0YSA9IHtcbiAgICAgIGNsZWFyOiB7bWluQXJnczogMSwgbWF4QXJnczogMX0sXG4gICAgICBnZXQ6IHttaW5BcmdzOiAxLCBtYXhBcmdzOiAxfSxcbiAgICAgIHNldDoge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDF9LFxuICAgIH07XG4gICAgYXBpTWV0YWRhdGEucHJpdmFjeSA9IHtcbiAgICAgIG5ldHdvcms6IHtcIipcIjogc2V0dGluZ01ldGFkYXRhfSxcbiAgICAgIHNlcnZpY2VzOiB7XCIqXCI6IHNldHRpbmdNZXRhZGF0YX0sXG4gICAgICB3ZWJzaXRlczoge1wiKlwiOiBzZXR0aW5nTWV0YWRhdGF9LFxuICAgIH07XG5cbiAgICByZXR1cm4gd3JhcE9iamVjdChleHRlbnNpb25BUElzLCBzdGF0aWNXcmFwcGVycywgYXBpTWV0YWRhdGEpO1xuICB9O1xuXG4gIC8vIFRoZSBidWlsZCBwcm9jZXNzIGFkZHMgYSBVTUQgd3JhcHBlciBhcm91bmQgdGhpcyBmaWxlLCB3aGljaCBtYWtlcyB0aGVcbiAgLy8gYG1vZHVsZWAgdmFyaWFibGUgYXZhaWxhYmxlLlxuICBtb2R1bGUuZXhwb3J0cyA9IHdyYXBBUElzKGNocm9tZSk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuYnJvd3Nlcjtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuY29uc3QgRVJST1JfTk9fQ09OTkVDVElPTiA9IFwiQ291bGQgbm90IGVzdGFibGlzaCBjb25uZWN0aW9uLiBcIiArXG4gICAgICBcIlJlY2VpdmluZyBlbmQgZG9lcyBub3QgZXhpc3QuXCI7XG5jb25zdCBFUlJPUl9DTE9TRURfQ09OTkVDVElPTiA9IFwiQSBsaXN0ZW5lciBpbmRpY2F0ZWQgYW4gYXN5bmNocm9ub3VzIFwiICtcbiAgICAgIFwicmVzcG9uc2UgYnkgcmV0dXJuaW5nIHRydWUsIGJ1dCB0aGUgbWVzc2FnZSBjaGFubmVsIGNsb3NlZCBiZWZvcmUgYSBcIiArXG4gICAgICBcInJlc3BvbnNlIHdhcyByZWNlaXZlZFwiO1xuLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTU3ODY5N1xuY29uc3QgRVJST1JfTUFOQUdFUl9ESVNDT05ORUNURUQgPSBcIk1lc3NhZ2UgbWFuYWdlciBkaXNjb25uZWN0ZWRcIjtcblxuLyoqXG4gKiBSZWNvbnN0cnVjdHMgYW4gZXJyb3IgZnJvbSBhIHNlcmlhbGl6YWJsZSBlcnJvciBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXJyb3JEYXRhIC0gRXJyb3Igb2JqZWN0XG4gKlxuICogQHJldHVybnMge0Vycm9yfSBlcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVNlcmlhbGl6YWJsZUVycm9yKGVycm9yRGF0YSkge1xuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihlcnJvckRhdGEubWVzc2FnZSk7XG4gIGVycm9yLmNhdXNlID0gZXJyb3JEYXRhLmNhdXNlO1xuICBlcnJvci5uYW1lID0gZXJyb3JEYXRhLm5hbWU7XG4gIGVycm9yLnN0YWNrID0gZXJyb3JEYXRhLnN0YWNrO1xuXG4gIHJldHVybiBlcnJvcjtcbn1cblxuLyoqXG4gKiBGaWx0ZXJzIG91dCBgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlYCBlcnJvcnMgdG8gZG8gd2l0aCB0aGUgcmVjZWl2aW5nIGVuZFxuICogbm8gbG9uZ2VyIGV4aXN0aW5nLlxuICpcbiAqIEBwYXJhbSB7UHJvbWlzZX0gcHJvbWlzZSBUaGUgcHJvbWlzZSB0aGF0IHNob3VsZCBoYXZlIFwibm8gY29ubmVjdGlvblwiIGVycm9yc1xuICogICBpZ25vcmVkLiBHZW5lcmFsbHkgdGhpcyB3b3VsZCBiZSB0aGUgcHJvbWlzZSByZXR1cm5lZCBieVxuICogICBgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlYC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IFRoZSBzYW1lIHByb21pc2UsIGJ1dCB3aWxsIHJlc29sdmUgd2l0aCBgdW5kZWZpbmVkYCBpbnN0ZWFkXG4gKiAgIG9mIHJlamVjdGluZyBpZiB0aGUgcmVjZWl2aW5nIGVuZCBubyBsb25nZXIgZXhpc3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWdub3JlTm9Db25uZWN0aW9uRXJyb3IocHJvbWlzZSkge1xuICByZXR1cm4gcHJvbWlzZS5jYXRjaChlcnJvciA9PiB7XG4gICAgaWYgKHR5cGVvZiBlcnJvciA9PSBcIm9iamVjdFwiICYmXG4gICAgICAgIChlcnJvci5tZXNzYWdlID09IEVSUk9SX05PX0NPTk5FQ1RJT04gfHxcbiAgICAgICAgIGVycm9yLm1lc3NhZ2UgPT0gRVJST1JfQ0xPU0VEX0NPTk5FQ1RJT04gfHxcbiAgICAgICAgIGVycm9yLm1lc3NhZ2UgPT0gRVJST1JfTUFOQUdFUl9ESVNDT05ORUNURUQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhyb3cgZXJyb3I7XG4gIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgc2VyaWFsaXphYmxlIGVycm9yIG9iamVjdCBmcm9tIGdpdmVuIGVycm9yXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgLSBFcnJvclxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHNlcmlhbGl6YWJsZSBlcnJvciBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU2VyaWFsaXphYmxlRXJyb3IoZXJyb3IpIHtcbiAgcmV0dXJuIHtcbiAgICBjYXVzZTogZXJyb3IuY2F1c2UgaW5zdGFuY2VvZiBFcnJvciA/XG4gICAgICB0b1NlcmlhbGl6YWJsZUVycm9yKGVycm9yLmNhdXNlKSA6XG4gICAgICBlcnJvci5jYXVzZSxcbiAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgc3RhY2s6IGVycm9yLnN0YWNrXG4gIH07XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2FsbC9lcnJvcnMuanNcIjtcblxubGV0IGNvbGxhcHNlZFNlbGVjdG9ycyA9IG5ldyBTZXQoKTtcbmxldCBvYnNlcnZlcnMgPSBuZXcgV2Vha01hcCgpO1xuXG5mdW5jdGlvbiBnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgaWYgKGVsZW1lbnQuZGF0YSkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQuZGF0YTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQubG9jYWxOYW1lID09IFwicGFyYW1cIiAmJiBjaGlsZC5uYW1lID09IFwibW92aWVcIiAmJiBjaGlsZC52YWx1ZSkge1xuICAgICAgICByZXR1cm4gbmV3IFVSTChjaGlsZC52YWx1ZSwgZG9jdW1lbnQuYmFzZVVSSSkuaHJlZjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50LmN1cnJlbnRTcmMgfHwgZWxlbWVudC5zcmM7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdG9yRm9yQmxvY2tlZEVsZW1lbnQoZWxlbWVudCkge1xuICAvLyBTZXR0aW5nIHRoZSBcImRpc3BsYXlcIiBDU1MgcHJvcGVydHkgdG8gXCJub25lXCIgZG9lc24ndCBoYXZlIGFueSBlZmZlY3Qgb25cbiAgLy8gPGZyYW1lPiBlbGVtZW50cyAoaW4gZnJhbWVzZXRzKS4gU28gd2UgaGF2ZSB0byBoaWRlIGl0IGlubGluZSB0aHJvdWdoXG4gIC8vIHRoZSBcInZpc2liaWxpdHlcIiBDU1MgcHJvcGVydHkuXG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcImZyYW1lXCIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIElmIHRoZSA8dmlkZW8+IG9yIDxhdWRpbz4gZWxlbWVudCBjb250YWlucyBhbnkgPHNvdXJjZT4gY2hpbGRyZW4sXG4gIC8vIHdlIGNhbm5vdCBhZGRyZXNzIGl0IGluIENTUyBieSB0aGUgc291cmNlIFVSTDsgaW4gdGhhdCBjYXNlIHdlXG4gIC8vIGRvbid0IFwiY29sbGFwc2VcIiBpdCB1c2luZyBhIENTUyBzZWxlY3RvciBidXQgcmF0aGVyIGhpZGUgaXQgZGlyZWN0bHkgYnlcbiAgLy8gc2V0dGluZyB0aGUgc3R5bGU9XCIuLi5cIiBhdHRyaWJ1dGUuXG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcInZpZGVvXCIgfHwgZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJhdWRpb1wiKSB7XG4gICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkLmxvY2FsTmFtZSA9PSBcInNvdXJjZVwiKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBzZWxlY3RvciA9IFwiXCI7XG4gIGZvciAobGV0IGF0dHIgb2YgW1wic3JjXCIsIFwic3Jjc2V0XCJdKSB7XG4gICAgbGV0IHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gICAgaWYgKHZhbHVlICYmIGF0dHIgaW4gZWxlbWVudCkge1xuICAgICAgc2VsZWN0b3IgKz0gXCJbXCIgKyBhdHRyICsgXCI9XCIgKyBDU1MuZXNjYXBlKHZhbHVlKSArIFwiXVwiO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZWxlY3RvciA/IGVsZW1lbnQubG9jYWxOYW1lICsgc2VsZWN0b3IgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZUVsZW1lbnQoZWxlbWVudCwgcHJvcGVydGllcykge1xuICBsZXQge3N0eWxlfSA9IGVsZW1lbnQ7XG5cbiAgaWYgKCFwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKGVsZW1lbnQubG9jYWxOYW1lID09IFwiZnJhbWVcIikge1xuICAgICAgcHJvcGVydGllcyA9IFtbXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCJdXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwcm9wZXJ0aWVzID0gW1tcImRpc3BsYXlcIiwgXCJub25lXCJdXTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgcHJvcGVydGllcykge1xuICAgIHN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICB9XG5cbiAgaWYgKG9ic2VydmVycy5oYXMoZWxlbWVudCkpIHtcbiAgICBvYnNlcnZlcnMuZ2V0KGVsZW1lbnQpLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgcHJvcGVydGllcykge1xuICAgICAgaWYgKHN0eWxlLmdldFByb3BlcnR5VmFsdWUoa2V5KSAhPSB2YWx1ZSB8fFxuICAgICAgICAgIHN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkoa2V5KSAhPSBcImltcG9ydGFudFwiKSB7XG4gICAgICAgIHN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIG9ic2VydmVyLm9ic2VydmUoXG4gICAgZWxlbWVudCwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wic3R5bGVcIl1cbiAgICB9XG4gICk7XG4gIG9ic2VydmVycy5zZXQoZWxlbWVudCwgb2JzZXJ2ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5oaWRlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBvYnNlcnZlciA9IG9ic2VydmVycy5nZXQoZWxlbWVudCk7XG4gIGlmIChvYnNlcnZlcikge1xuICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICBvYnNlcnZlcnMuZGVsZXRlKGVsZW1lbnQpO1xuICB9XG5cbiAgbGV0IHByb3BlcnR5ID0gZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJmcmFtZVwiID8gXCJ2aXNpYmlsaXR5XCIgOiBcImRpc3BsYXlcIjtcbiAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzZWxlY3RvciA9IGdldFNlbGVjdG9yRm9yQmxvY2tlZEVsZW1lbnQoZWxlbWVudCk7XG4gIGlmICghc2VsZWN0b3IpIHtcbiAgICBoaWRlRWxlbWVudChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbGxhcHNlZFNlbGVjdG9ycy5oYXMoc2VsZWN0b3IpKSB7XG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiBcImV3ZTppbmplY3QtY3NzXCIsXG4gICAgICAgIHNlbGVjdG9yXG4gICAgICB9KVxuICAgICk7XG4gICAgY29sbGFwc2VkU2VsZWN0b3JzLmFkZChzZWxlY3Rvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhzZWxlY3RvciwgdXJscykge1xuICAvLyBSZXNvdXJjZXMgKGUuZy4gaW1hZ2VzKSBsb2FkZWQgaW50byBhYm91dDpibGFuayBmcmFtZXNcbiAgLy8gYXJlIChzb21ldGltZXMpIGxvYWRlZCB3aXRoIHRoZSBmcmFtZUlkIG9mIHRoZSBtYWluX2ZyYW1lLlxuICBmb3IgKGxldCBmcmFtZSBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lW3NyYz0nYWJvdXQ6YmxhbmsnXVwiKSkge1xuICAgIGlmICghZnJhbWUuY29udGVudERvY3VtZW50KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIGZyYW1lLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkge1xuICAgICAgLy8gVXNlIGhpZGVFbGVtZW50LCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGNvcnJlY3QgZnJhbWVJZFxuICAgICAgLy8gZm9yIHRoZSBcImV3ZTppbmplY3QtY3NzXCIgbWVzc2FnZS5cbiAgICAgIGlmICh1cmxzLmhhcyhnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSkpIHtcbiAgICAgICAgaGlkZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEVsZW1lbnRDb2xsYXBzaW5nKCkge1xuICBsZXQgZGVmZXJyZWQgPSBudWxsO1xuXG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlcikgPT4ge1xuICAgIGlmICghbWVzc2FnZSB8fCBtZXNzYWdlLnR5cGUgIT0gXCJld2U6Y29sbGFwc2VcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwibG9hZGluZ1wiKSB7XG4gICAgICBpZiAoIWRlZmVycmVkKSB7XG4gICAgICAgIGRlZmVycmVkID0gbmV3IE1hcCgpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgLy8gVW5kZXIgc29tZSBjb25kaXRpb25zIGEgaG9zdGlsZSBzY3JpcHQgY291bGQgdHJ5IHRvIHRyaWdnZXJcbiAgICAgICAgICAvLyB0aGUgZXZlbnQgYWdhaW4uIFNpbmNlIHdlIHNldCBkZWZlcnJlZCB0byBgbnVsbGAsIHRoZW5cbiAgICAgICAgICAvLyB3ZSBhc3N1bWUgdGhhdCB3ZSBzaG91bGQganVzdCByZXR1cm4gaW5zdGVhZCBvZiB0aHJvd2luZ1xuICAgICAgICAgIC8vIGEgVHlwZUVycm9yLlxuICAgICAgICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGxldCBbc2VsZWN0b3IsIHVybHNdIG9mIGRlZmVycmVkKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgIGlmICh1cmxzLmhhcyhnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSkpIHtcbiAgICAgICAgICAgICAgICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhzZWxlY3RvciwgdXJscyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGVmZXJyZWQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbGV0IHVybHMgPSBkZWZlcnJlZC5nZXQobWVzc2FnZS5zZWxlY3RvcikgfHwgbmV3IFNldCgpO1xuICAgICAgZGVmZXJyZWQuc2V0KG1lc3NhZ2Uuc2VsZWN0b3IsIHVybHMpO1xuICAgICAgdXJscy5hZGQobWVzc2FnZS51cmwpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChtZXNzYWdlLnNlbGVjdG9yKSkge1xuICAgICAgICBpZiAoZ2V0VVJMRnJvbUVsZW1lbnQoZWxlbWVudCkgPT0gbWVzc2FnZS51cmwpIHtcbiAgICAgICAgICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhtZXNzYWdlLnNlbGVjdG9yLCBuZXcgU2V0KFttZXNzYWdlLnVybF0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vYWxsL2Vycm9ycy5qc1wiO1xuXG5jb25zdCBNQVhfRVJST1JfVEhSRVNIT0xEID0gMzA7XG5jb25zdCBNQVhfUVVFVUVEX0VWRU5UUyA9IDIwO1xuY29uc3QgRVZFTlRfSU5URVJWQUxfTVMgPSAxMDA7XG5cbmxldCBlcnJvckNvdW50ID0gMDtcbmxldCBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IG51bGw7XG5sZXQgZXZlbnRQcm9jZXNzaW5nSW5Qcm9ncmVzcyA9IGZhbHNlO1xubGV0IGV2ZW50UXVldWUgPSBbXTtcblxuZnVuY3Rpb24gaXNFdmVudFRydXN0ZWQoZXZlbnQpIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihldmVudCkgPT09IEN1c3RvbUV2ZW50LnByb3RvdHlwZSAmJlxuICAgICFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChldmVudCwgXCJkZXRhaWxcIik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFsbG93bGlzdERvbWFpbihldmVudCkge1xuICBpZiAoIWlzRXZlbnRUcnVzdGVkKGV2ZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJld2U6YWxsb3dsaXN0LXBhZ2VcIixcbiAgICAgIHRpbWVzdGFtcDogZXZlbnQuZGV0YWlsLnRpbWVzdGFtcCxcbiAgICAgIHNpZ25hdHVyZTogZXZlbnQuZGV0YWlsLnNpZ25hdHVyZSxcbiAgICAgIG9wdGlvbnM6IGV2ZW50LmRldGFpbC5vcHRpb25zXG4gICAgfSlcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc05leHRFdmVudCgpIHtcbiAgaWYgKGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIGxldCBldmVudCA9IGV2ZW50UXVldWUuc2hpZnQoKTtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBhbGxvd2xpc3RpbmdSZXN1bHQgPSBhd2FpdCBhbGxvd2xpc3REb21haW4oZXZlbnQpO1xuICAgICAgICBpZiAoYWxsb3dsaXN0aW5nUmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJkb21haW5fYWxsb3dsaXN0aW5nX3N1Y2Nlc3NcIikpO1xuICAgICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRvbWFpbiBhbGxvd2xpc3RpbmcgcmVqZWN0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yQ291bnQrKztcbiAgICAgICAgaWYgKGVycm9yQ291bnQgPj0gTUFYX0VSUk9SX1RIUkVTSE9MRCkge1xuICAgICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFldmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgc3RvcFByb2Nlc3NpbmdJbnRlcnZhbCgpO1xuICAgIH1cbiAgfVxuICBmaW5hbGx5IHtcbiAgICBldmVudFByb2Nlc3NpbmdJblByb2dyZXNzID0gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Eb21haW5BbGxvd2xpc3RpbmdSZXF1ZXN0KGV2ZW50KSB7XG4gIGlmIChldmVudFF1ZXVlLmxlbmd0aCA+PSBNQVhfUVVFVUVEX0VWRU5UUykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGV2ZW50UXVldWUucHVzaChldmVudCk7XG4gIHN0YXJ0UHJvY2Vzc2luZ0ludGVydmFsKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0UHJvY2Vzc2luZ0ludGVydmFsKCkge1xuICBpZiAoIWV2ZW50UHJvY2Vzc2luZ0ludGVydmFsKSB7XG4gICAgcHJvY2Vzc05leHRFdmVudCgpO1xuICAgIGV2ZW50UHJvY2Vzc2luZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwocHJvY2Vzc05leHRFdmVudCwgRVZFTlRfSU5URVJWQUxfTVMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKSB7XG4gIGNsZWFySW50ZXJ2YWwoZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwpO1xuICBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wT25lQ2xpY2tBbGxvd2xpc3RpbmcoKSB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkb21haW5fYWxsb3dsaXN0aW5nX3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QsIHRydWUpO1xuICBldmVudFF1ZXVlID0gW107XG4gIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0T25lQ2xpY2tBbGxvd2xpc3RpbmcoKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkb21haW5fYWxsb3dsaXN0aW5nX3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QsIHRydWUpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9hbGwvZXJyb3JzLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50SGlkaW5nVHJhY2VyIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSBuZXcgTWFwKHNlbGVjdG9ycyk7XG5cbiAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgdGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudHJhY2UoKSwgMTAwMCk7XG4gICAgfSk7XG5cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImxvYWRpbmdcIikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4gdGhpcy50cmFjZSgpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnRyYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgbG9nKGZpbHRlcnMsIHNlbGVjdG9ycyA9IFtdKSB7XG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKFxuICAgICAge3R5cGU6IFwiZXdlOnRyYWNlLWVsZW0taGlkZVwiLCBmaWx0ZXJzLCBzZWxlY3RvcnN9XG4gICAgKSk7XG4gIH1cblxuICB0cmFjZSgpIHtcbiAgICBsZXQgZmlsdGVycyA9IFtdO1xuICAgIGxldCBzZWxlY3RvcnMgPSBbXTtcblxuICAgIGZvciAobGV0IFtzZWxlY3RvciwgZmlsdGVyXSBvZiB0aGlzLnNlbGVjdG9ycykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZGVsZXRlKHNlbGVjdG9yKTtcbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goZmlsdGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3RvcnMucHVzaChzZWxlY3Rvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUudG9TdHJpbmcoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbHRlcnMubGVuZ3RoID4gMCB8fCBzZWxlY3RvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5sb2coZmlsdGVycywgc2VsZWN0b3JzKTtcbiAgICB9XG5cbiAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHtjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlfSk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICB9XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2FsbC9lcnJvcnMuanNcIjtcblxuY29uc3QgQUxMT1dFRF9ET01BSU5TID0gbmV3IFNldChbXG4gIFwiYWJwY2hpbmEub3JnXCIsXG4gIFwiYWJwaW5kby5ibG9nc3BvdC5jb21cIixcbiAgXCJhYnB2bi5jb21cIixcbiAgXCJhZGJsb2NrLmVlXCIsXG4gIFwiYWRibG9jay5nYXJkYXIubmV0XCIsXG4gIFwiYWRibG9ja3BsdXMubWVcIixcbiAgXCJhZGJsb2NrcGx1cy5vcmdcIixcbiAgXCJhYnB0ZXN0cGFnZXMub3JnXCIsXG4gIFwiY29tbWVudGNhbWFyY2hlLm5ldFwiLFxuICBcImRyb2l0LWZpbmFuY2VzLmNvbW1lbnRjYW1hcmNoZS5jb21cIixcbiAgXCJlYXN5bGlzdC50b1wiLFxuICBcImV5ZW8uY29tXCIsXG4gIFwiZmFuYm95LmNvLm56XCIsXG4gIFwiZmlsdGVybGlzdHMuY29tXCIsXG4gIFwiZm9ydW1zLmxhbmlrLnVzXCIsXG4gIFwiZ2l0ZWUuY29tXCIsXG4gIFwiZ2l0ZWUuaW9cIixcbiAgXCJnaXRodWIuY29tXCIsXG4gIFwiZ2l0aHViLmlvXCIsXG4gIFwiZ2l0bGFiLmNvbVwiLFxuICBcImdpdGxhYi5pb1wiLFxuICBcImd1cnVkLmVlXCIsXG4gIFwiaHVnb2xlc2NhcmdvdC5jb21cIixcbiAgXCJpLWRvbnQtY2FyZS1hYm91dC1jb29raWVzLmV1XCIsXG4gIFwiam91cm5hbGRlc2ZlbW1lcy5mclwiLFxuICBcImpvdXJuYWxkdW5ldC5jb21cIixcbiAgXCJsaW50ZXJuYXV0ZS5jb21cIixcbiAgXCJzcGFtNDA0LmNvbVwiLFxuICBcInN0YW5ldi5vcmdcIixcbiAgXCJ2b2lkLmdyXCIsXG4gIFwieGZpbGVzLm5vYWRzLml0XCIsXG4gIFwiem9zby5yb1wiXG5dKTtcblxuZnVuY3Rpb24gaXNEb21haW5BbGxvd2VkKGRvbWFpbikge1xuICBpZiAoZG9tYWluLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zdWJzdHJpbmcoMCwgZG9tYWluLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAoQUxMT1dFRF9ET01BSU5TLmhhcyhkb21haW4pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbGV0IGluZGV4ID0gZG9tYWluLmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBkb21haW4gPSBkb21haW4uc3Vic3RyKGluZGV4ICsgMSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmliZUxpbmtzRW5hYmxlZCh1cmwpIHtcbiAgbGV0IHtwcm90b2NvbCwgaG9zdG5hbWV9ID0gbmV3IFVSTCh1cmwpO1xuICByZXR1cm4gaG9zdG5hbWUgPT0gXCJsb2NhbGhvc3RcIiB8fFxuICAgIHByb3RvY29sID09IFwiaHR0cHM6XCIgJiYgaXNEb21haW5BbGxvd2VkKGhvc3RuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVN1YnNjcmliZUxpbmtzKCkge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4ge1xuICAgIGlmIChldmVudC5idXR0b24gPT0gMiB8fCAhZXZlbnQuaXNUcnVzdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxpbmsgPSBldmVudC50YXJnZXQ7XG4gICAgd2hpbGUgKCEobGluayBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50KSkge1xuICAgICAgbGluayA9IGxpbmsucGFyZW50Tm9kZTtcblxuICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcXVlcnlTdHJpbmcgPSBudWxsO1xuICAgIGlmIChsaW5rLnByb3RvY29sID09IFwiaHR0cDpcIiB8fCBsaW5rLnByb3RvY29sID09IFwiaHR0cHM6XCIpIHtcbiAgICAgIGlmIChsaW5rLmhvc3QgPT0gXCJzdWJzY3JpYmUuYWRibG9ja3BsdXMub3JnXCIgJiYgbGluay5wYXRobmFtZSA9PSBcIi9cIikge1xuICAgICAgICBxdWVyeVN0cmluZyA9IGxpbmsuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBGaXJlZm94IGRvZXNuJ3Qgc2VlbSB0byBwb3B1bGF0ZSB0aGUgXCJzZWFyY2hcIiBwcm9wZXJ0eSBmb3JcbiAgICAgIC8vIGxpbmtzIHdpdGggbm9uLXN0YW5kYXJkIFVSTCBzY2hlbWVzIHNvIHdlIG5lZWQgdG8gZXh0cmFjdCB0aGUgcXVlcnlcbiAgICAgIC8vIHN0cmluZyBtYW51YWxseS5cbiAgICAgIGxldCBtYXRjaCA9IC9eYWJwOlxcLypzdWJzY3JpYmVcXC8qXFw/KC4qKS9pLmV4ZWMobGluay5ocmVmKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBxdWVyeVN0cmluZyA9IG1hdGNoWzFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcXVlcnlTdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdGl0bGUgPSBudWxsO1xuICAgIGxldCB1cmwgPSBudWxsO1xuICAgIGZvciAobGV0IHBhcmFtIG9mIHF1ZXJ5U3RyaW5nLnNwbGl0KFwiJlwiKSkge1xuICAgICAgbGV0IHBhcnRzID0gcGFyYW0uc3BsaXQoXCI9XCIsIDIpO1xuICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAyIHx8ICEvXFxTLy50ZXN0KHBhcnRzWzFdKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAocGFydHNbMF0pIHtcbiAgICAgICAgY2FzZSBcInRpdGxlXCI6XG4gICAgICAgICAgdGl0bGUgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibG9jYXRpb25cIjpcbiAgICAgICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXVybCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIHRpdGxlID0gdXJsO1xuICAgIH1cblxuICAgIHRpdGxlID0gdGl0bGUudHJpbSgpO1xuICAgIHVybCA9IHVybC50cmltKCk7XG4gICAgaWYgKCEvXihodHRwcz98ZnRwKTovLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHt0eXBlOiBcImV3ZTpzdWJzY3JpYmUtbGluay1jbGlja2VkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLCB1cmx9KVxuICAgICk7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LCB0cnVlKTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vYWxsL2Vycm9ycy5qc1wiO1xuXG5sZXQgaXNBY3RpdmUgPSBmYWxzZTtcblxuZnVuY3Rpb24gbm90aWZ5QWN0aXZlKCkge1xuICBpZiAoaXNBY3RpdmUpIHtcbiAgICBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IFwiZXdlOmNkcC1zZXNzaW9uLWFjdGl2ZVwiXG4gICAgICB9KVxuICAgICk7XG4gICAgaXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuICBzY2hlZHVsZUNoZWNrQWN0aXZlKCk7XG59XG5cbmZ1bmN0aW9uIHNjaGVkdWxlQ2hlY2tBY3RpdmUoKSB7XG4gIHNldFRpbWVvdXQobm90aWZ5QWN0aXZlLCAxMDAwKTtcbn1cblxuZnVuY3Rpb24gbWFya0FjdGl2ZSgpIHtcbiAgaXNBY3RpdmUgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnROb3RpZnlBY3RpdmUoKSB7XG4gIHNjaGVkdWxlQ2hlY2tBY3RpdmUoKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIG1hcmtBY3RpdmUsIHRydWUpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbWFya0FjdGl2ZSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBtYXJrQWN0aXZlLCB0cnVlKTtcbn1cbiIsImNvbnN0IHJhbmRvbVVVSUQgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCAmJiBjcnlwdG8ucmFuZG9tVVVJRC5iaW5kKGNyeXB0byk7XG5leHBvcnQgZGVmYXVsdCB7XG4gIHJhbmRvbVVVSURcbn07IiwiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gSW4gdGhlIGJyb3dzZXIgd2UgdGhlcmVmb3JlXG4vLyByZXF1aXJlIHRoZSBjcnlwdG8gQVBJIGFuZCBkbyBub3Qgc3VwcG9ydCBidWlsdC1pbiBmYWxsYmFjayB0byBsb3dlciBxdWFsaXR5IHJhbmRvbSBudW1iZXJcbi8vIGdlbmVyYXRvcnMgKGxpa2UgTWF0aC5yYW5kb20oKSkuXG5sZXQgZ2V0UmFuZG9tVmFsdWVzO1xuY29uc3Qgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi5cbiAgICBnZXRSYW5kb21WYWx1ZXMgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pO1xuXG4gICAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbn0iLCJpbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XG4vKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cblxuY29uc3QgYnl0ZVRvSGV4ID0gW107XG5cbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4LnB1c2goKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnNsaWNlKDEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2FmZVN0cmluZ2lmeShhcnIsIG9mZnNldCA9IDApIHtcbiAgLy8gTm90ZTogQmUgY2FyZWZ1bCBlZGl0aW5nIHRoaXMgY29kZSEgIEl0J3MgYmVlbiB0dW5lZCBmb3IgcGVyZm9ybWFuY2VcbiAgLy8gYW5kIHdvcmtzIGluIHdheXMgeW91IG1heSBub3QgZXhwZWN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkL3B1bGwvNDM0XG4gIHJldHVybiBieXRlVG9IZXhbYXJyW29mZnNldCArIDBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDNdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA1XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDZdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgN11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA4XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDldXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTNdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTVdXTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICBjb25zdCB1dWlkID0gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0KTsgLy8gQ29uc2lzdGVuY3kgY2hlY2sgZm9yIHZhbGlkIFVVSUQuICBJZiB0aGlzIHRocm93cywgaXQncyBsaWtlbHkgZHVlIHRvIG9uZVxuICAvLyBvZiB0aGUgZm9sbG93aW5nOlxuICAvLyAtIE9uZSBvciBtb3JlIGlucHV0IGFycmF5IHZhbHVlcyBkb24ndCBtYXAgdG8gYSBoZXggb2N0ZXQgKGxlYWRpbmcgdG9cbiAgLy8gXCJ1bmRlZmluZWRcIiBpbiB0aGUgdXVpZClcbiAgLy8gLSBJbnZhbGlkIGlucHV0IHZhbHVlcyBmb3IgdGhlIFJGQyBgdmVyc2lvbmAgb3IgYHZhcmlhbnRgIGZpZWxkc1xuXG4gIGlmICghdmFsaWRhdGUodXVpZCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1N0cmluZ2lmaWVkIFVVSUQgaXMgaW52YWxpZCcpO1xuICB9XG5cbiAgcmV0dXJuIHV1aWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ2lmeTsiLCJpbXBvcnQgbmF0aXZlIGZyb20gJy4vbmF0aXZlLmpzJztcbmltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHsgdW5zYWZlU3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICBpZiAobmF0aXZlLnJhbmRvbVVVSUQgJiYgIWJ1ZiAmJiAhb3B0aW9ucykge1xuICAgIHJldHVybiBuYXRpdmUucmFuZG9tVVVJRCgpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpOyAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG5cbiAgcm5kc1s2XSA9IHJuZHNbNl0gJiAweDBmIHwgMHg0MDtcbiAgcm5kc1s4XSA9IHJuZHNbOF0gJiAweDNmIHwgMHg4MDsgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG5cbiAgaWYgKGJ1Zikge1xuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICByZXR1cm4gdW5zYWZlU3RyaW5naWZ5KHJuZHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2NDsiLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gXCJ1dWlkXCI7XG5cbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9hbGwvZXJyb3JzLmpzXCI7XG5cbmxldCBzZXNzaW9uSWQgPSBudWxsO1xuXG5mdW5jdGlvbiBvbkJUQUFEZXRlY3Rpb25FdmVudChldmVudCkge1xuICBpZiAoIXNlc3Npb25JZCkge1xuICAgIHNlc3Npb25JZCA9IHV1aWR2NCgpO1xuICB9XG5cbiAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgIHR5cGU6IFwiZXdlOmJsb2NrdGhyb3VnaC1hY2NlcHRhYmxlLWFkcy1kZXRlY3Rpb24tZXZlbnRcIixcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgYWI6IGV2ZW50LmRldGFpbC5hYixcbiAgICAgICAgYWNjZXB0YWJsZTogZXZlbnQuZGV0YWlsLmFjY2VwdGFibGUsXG4gICAgICAgIHNlc3Npb25JZFxuICAgICAgfVxuICAgIH0pXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdhdGNoaW5nQmxvY2t0aHJvdWdoVGFnKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkJUQUFEZXRlY3Rpb25cIiwgb25CVEFBRGV0ZWN0aW9uRXZlbnQpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9hbGwvZXJyb3JzLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFNhZmFyaUhpc3RvcnkoKSB7XG4vLyBJdCByZWNlaXZlcyBhIG1lc3NhZ2UgZnJvbSBpbmplY3RlZCBpbiBTYWZhcmkgYGhpc3RvcnkucHVzaFN0YXRlKClgXG4vLyBhbmQgZm9yd2FyZHMgaXQgdG8gd2ViIGV4dGVuc2lvbiBiYWNrZ3JvdW5kIHNjcmlwdC5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgXCJtZXNzYWdlXCIsXG4gICAgZXZlbnQgPT4ge1xuICAgICAgaWYgKCFldmVudC5pc1RydXN0ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnQgJiYgZXZlbnQuZGF0YSAmJlxuICAgICAgICBldmVudC5kYXRhLnR5cGUgPT09IFwiZXdlOnNhZmFyaS1vbmhpc3RvcnlzdGF0ZXVwZGF0ZWQtY29udGVudFwiKSB7XG4gICAgICAgIHJldHVybiBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICAgICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogXCJld2U6c2FmYXJpLW9uaGlzdG9yeXN0YXRldXBkYXRlZFwiLFxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LmRhdGEuZXZlbnRcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmFsc2VcbiAgKTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5cbmltcG9ydCB7RWxlbUhpZGVFbXVsYXRpb259XG4gIGZyb20gXCIjYWRibG9ja3BsdXNjb3JlL2xpYi9jb250ZW50L2VsZW1IaWRlRW11bGF0aW9uLmpzXCI7XG5cbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9hbGwvZXJyb3JzLmpzXCI7XG5pbXBvcnQge3N0YXJ0RWxlbWVudENvbGxhcHNpbmcsIGhpZGVFbGVtZW50LCB1bmhpZGVFbGVtZW50fVxuICBmcm9tIFwiLi9lbGVtZW50LWNvbGxhcHNpbmcuanNcIjtcbmltcG9ydCB7c3RhcnRPbmVDbGlja0FsbG93bGlzdGluZ30gZnJvbSBcIi4vYWxsb3dsaXN0aW5nLmpzXCI7XG5pbXBvcnQge0VsZW1lbnRIaWRpbmdUcmFjZXJ9IGZyb20gXCIuL2VsZW1lbnQtaGlkaW5nLXRyYWNlci5qc1wiO1xuaW1wb3J0IHtzdWJzY3JpYmVMaW5rc0VuYWJsZWQsIGhhbmRsZVN1YnNjcmliZUxpbmtzfSBmcm9tIFwiLi9zdWJzY3JpYmUtbGlua3MuanNcIjtcbmltcG9ydCB7c3RhcnROb3RpZnlBY3RpdmV9IGZyb20gXCIuL2NkcC1zZXNzaW9uLmpzXCI7XG5pbXBvcnQge3N0YXJ0V2F0Y2hpbmdCbG9ja3Rocm91Z2hUYWd9IGZyb20gXCIuL2Jsb2NrdGhyb3VnaC10YWcuanNcIjtcbmltcG9ydCB7c3RhcnRTYWZhcmlIaXN0b3J5fSBmcm9tIFwiLi9zYWZhcmktaGlzdG9yeS5qc1wiO1xuXG5sZXQgdHJhY2VyO1xubGV0IGVsZW1IaWRlRW11bGF0aW9uO1xuXG5hc3luYyBmdW5jdGlvbiBpbml0Q29udGVudEZlYXR1cmVzKCkge1xuICBpZiAoc3Vic2NyaWJlTGlua3NFbmFibGVkKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSkge1xuICAgIGhhbmRsZVN1YnNjcmliZUxpbmtzKCk7XG4gIH1cblxuICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6IFwiZXdlOmNvbnRlbnQtaGVsbG9cIn0pXG4gICk7XG5cbiAgaWYgKHJlc3BvbnNlKSB7XG4gICAgYXdhaXQgYXBwbHlDb250ZW50RmVhdHVyZXMocmVzcG9uc2UpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbW92ZUNvbnRlbnRGZWF0dXJlcygpIHtcbiAgaWYgKHRyYWNlcikge1xuICAgIHRyYWNlci5kaXNjb25uZWN0KCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDb250ZW50RmVhdHVyZXMocmVzcG9uc2UpIHtcbiAgaWYgKHJlc3BvbnNlLnRyYWNlZFNlbGVjdG9ycykge1xuICAgIHRyYWNlciA9IG5ldyBFbGVtZW50SGlkaW5nVHJhY2VyKHJlc3BvbnNlLnRyYWNlZFNlbGVjdG9ycyk7XG4gIH1cblxuICBjb25zdCBoaWRlRWxlbWVudHMgPSAoZWxlbWVudHMsIGZpbHRlcnMpID0+IHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBoaWRlRWxlbWVudChlbGVtZW50LCByZXNwb25zZS5jc3NQcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICBpZiAodHJhY2VyKSB7XG4gICAgICB0cmFjZXIubG9nKGZpbHRlcnMpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCB1bmhpZGVFbGVtZW50cyA9IGVsZW1lbnRzID0+IHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICB1bmhpZGVFbGVtZW50KGVsZW1lbnQpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZW1vdmVFbGVtZW50cyA9IChlbGVtZW50cywgZmlsdGVycykgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpZiAodHJhY2VyKSB7XG4gICAgICB0cmFjZXIubG9nKGZpbHRlcnMpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBhcHBseUlubGluZUNTUyA9IChlbGVtZW50cywgY3NzUGF0dGVybnMpID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICBjb25zdCBwYXR0ZXJuID0gY3NzUGF0dGVybnNbaV07XG5cbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhdHRlcm4uY3NzKSkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0cmFjZXIpIHtcbiAgICAgIGNvbnN0IGZpbHRlclRleHRzID0gY3NzUGF0dGVybnMubWFwKHBhdHRlcm4gPT4gcGF0dGVybi50ZXh0KTtcbiAgICAgIHRyYWNlci5sb2coZmlsdGVyVGV4dHMpO1xuICAgIH1cbiAgfTtcblxuICBpZiAocmVzcG9uc2UuZW11bGF0ZWRQYXR0ZXJucy5sZW5ndGggPiAwKSB7XG4gICAgaWYgKCFlbGVtSGlkZUVtdWxhdGlvbikge1xuICAgICAgZWxlbUhpZGVFbXVsYXRpb24gPSBuZXcgRWxlbUhpZGVFbXVsYXRpb24oaGlkZUVsZW1lbnRzLCB1bmhpZGVFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUVsZW1lbnRzLCBhcHBseUlubGluZUNTUyk7XG4gICAgfVxuICAgIGVsZW1IaWRlRW11bGF0aW9uLmFwcGx5KHJlc3BvbnNlLmVtdWxhdGVkUGF0dGVybnMpO1xuICB9XG4gIGVsc2UgaWYgKGVsZW1IaWRlRW11bGF0aW9uKSB7XG4gICAgZWxlbUhpZGVFbXVsYXRpb24uYXBwbHkocmVzcG9uc2UuZW11bGF0ZWRQYXR0ZXJucyk7XG4gIH1cblxuICBpZiAocmVzcG9uc2Uubm90aWZ5QWN0aXZlKSB7XG4gICAgc3RhcnROb3RpZnlBY3RpdmUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbk1lc3NhZ2UobWVzc2FnZSkge1xuICBpZiAodHlwZW9mIG1lc3NhZ2UgPT0gXCJvYmplY3RcIiAmJiBtZXNzYWdlICE9IG51bGwgJiZcbiAgICBtZXNzYWdlLnR5cGUgJiYgbWVzc2FnZS50eXBlID09IFwiZXdlOmFwcGx5LWNvbnRlbnQtZmVhdHVyZXNcIikge1xuICAgIHJlbW92ZUNvbnRlbnRGZWF0dXJlcygpO1xuICAgIGFwcGx5Q29udGVudEZlYXR1cmVzKG1lc3NhZ2UpO1xuICB9XG59XG5icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKG9uTWVzc2FnZSk7XG5cbnN0YXJ0U2FmYXJpSGlzdG9yeSgpO1xuc3RhcnRFbGVtZW50Q29sbGFwc2luZygpO1xuc3RhcnRPbmVDbGlja0FsbG93bGlzdGluZygpO1xuaW5pdENvbnRlbnRGZWF0dXJlcygpO1xuc3RhcnRXYXRjaGluZ0Jsb2NrdGhyb3VnaFRhZygpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9