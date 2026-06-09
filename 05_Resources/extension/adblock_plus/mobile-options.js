/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 3588:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5516);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1364);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_theme_ui_font_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6054);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_theme_ui_light_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4341);
// Imports




var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_theme_ui_font_css__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_theme_ui_light_css__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
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

body,
input {
  font-family: "Source Sans Pro", sans-serif;
  font-size: 14px;
}

body {
  margin: 0;
  text-align: center;
  color: #494949;
}

main,
[role="dialog"] {
  text-align: start;
}

main {
  padding: 20px 45px;
}

h1 {
  position: relative;
  font-size: 1em;
  line-height: 20px;
  color: #000;
}

h1::before {
  position: absolute;
  left: -25px;
  width: 20px;
  height: 20px;
  background-image: url(/skin/icons/logo/abp.svg);
  background-size: contain;
  background-repeat: no-repeat;
  content: "";
}

html[dir="rtl"] h1::before {
  left: auto;
  right: -25px;
}

h2 {
  font-size: 1em;
}

a:link,
a:visited {
  text-decoration: none;
  color: #099dd1;
}

[hidden] {
  display: none !important;
}

#acceptableAds-more {
  white-space: nowrap;
}

/* Lists */

ul {
  margin: 0;
  padding: 0;
}

ul > li {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-height: 46px;
  padding: 5px 10px;
  border: 1px solid #bbb;
  border-bottom: none;
  list-style: none;
}

ul > li > span {
  flex: auto;
  overflow: hidden;
  padding: 10px;
  word-wrap: break-word;
}

/* Form elements */

input[type="text"] {
  min-width: 220px;
  padding: 5px 0;
  border: 0;
  border-bottom: 1px solid #bbb;
}

input[type="text"]::placeholder {
  color: #bbb;
  opacity: 1; /* Firefox sets opacity so we need to override it */
}

input[type="text"]:focus::placeholder {
  color: transparent;
}

input[type="text"]:not(:focus):placeholder-shown ~ label,
input[type="text"]:not(:placeholder-shown) ~ .error {
  visibility: hidden;
}

.toggle-container {
  display: flex;
}

.toggle-container > span {
  flex: auto;
}

.toggle-container input {
  display: none;
}

.toggle-image {
  display: inline-block;
  flex-shrink: 0;
  width: 36px;
  height: 21px;
  background-image: url(/skin/icons/mobile/toggle.svg#off);
}

input:checked + .toggle-image {
  background-image: url(/skin/icons/mobile/toggle.svg#on);
}

button {
  width: 100%;
  border: none;
  font-weight: 700;
  text-transform: uppercase;
  color: #099dd1;
  background: none;
}

button.primary,
button.secondary {
  height: auto;
  margin: 5px 0;
  padding: 10px;
  border: 1px solid;
  border-radius: 2px;
}

button.primary {
  border-color: #099dd1;
  color: #fff;
  background-color: #099dd1;
}

button.secondary {
  border-color: #bbb;
}

button.add::before {
  content: "+ ";
}

button.remove {
  width: 36px;
  height: 36px;
  padding: 0;
  background-color: #099dd1;
  mask: url(/skin/icons/mobile/trash.svg) center/19px no-repeat;
}

ul + button {
  flex-shrink: 0;
  width: 100%;
  min-height: 46px; /* equal to min-height of list item */
  padding: 15px 20px; /* based on margin and padding of list item */
  border: 1px solid #bbb;
  text-align: start;
}

#enabled-container {
  align-items: center;
}

#enabled-container #enabled-domain {
  display: block;
  font-style: normal;
}

/* Dialogs */

#dialog {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: fixed;
  z-index: 101;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
}

[role="dialog"] {
  max-width: 25em;
  padding: 0;
  border: 1px solid #bbb;
  background-color: var(--background-color-primary);
}

[role="dialog"] h2 {
  margin: 0;
}

[role="dialog"] form {
  padding: 20px;
}

[role="dialog"] p {
  display: flex;
  flex-direction: column;
  margin: 5px 0;
}

[role="dialog"] label {
  order: 1;
  display: block;
  margin: 5px 0;
  font-size: 10px;
}

[role="dialog"] input[type="text"] {
  order: 2;
}

[role="dialog"] .error {
  order: 3;
  margin-top: 5px;
  font-size: 12px;
  color: var(--color-brand-primary);
}

#dialog-subscribe [name="title"]:placeholder-shown,
#dialog-subscribe [name="title"]:placeholder-shown ~ * {
  display: none;
}

[role="dialog"]:not([data-error]) .error,
#dialog-subscribe:not([data-error="url"]) .error[data-error="url"] {
  visibility: hidden;
}

#dialog-subscribe[data-error="url"] [name="url"]:placeholder-shown {
  border-color: var(--color-brand-primary);
}

body:not([data-dialog]) #dialog,
body:not([data-dialog="recommended"]) #dialog-recommended,
body:not([data-dialog="subscribe"]) #dialog-subscribe {
  display: none;
}

#dialog-recommended {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

#dialog-recommended ul {
  overflow-y: auto;
  width: auto;
  margin: 0;
}

#dialog-recommended ul li {
  border: none;
}

#dialog-recommended ul li.installed {
  color: #bbb;
}

#dialog-recommended ul li::before {
  flex-shrink: 0;
  width: 13px;
  height: 11px;
  margin: 10px;
  content: "";
}

#dialog-recommended ul li.installed::before {
  background-color: #bbb;
  mask: url(/skin/icons/mobile/checkmark.svg) center/cover no-repeat;
}

#dialog-recommended > button {
  border-width: 1px 0 0;
  text-align: center;
}

/* Footer */

footer {
  margin-top: 40px;
}

footer > a:last-child::before {
  margin: 0 10px;
  content: "\\2022";
}
`, "",{"version":3,"sources":["webpack://./src/mobile-options/ui/mobile-options.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;;;EAeE;;AAKF;;EAEE,0CAA0C;EAC1C,eAAe;AACjB;;AAEA;EACE,SAAS;EACT,kBAAkB;EAClB,cAAc;AAChB;;AAEA;;EAEE,iBAAiB;AACnB;;AAEA;EACE,kBAAkB;AACpB;;AAEA;EACE,kBAAkB;EAClB,cAAc;EACd,iBAAiB;EACjB,WAAW;AACb;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,WAAW;EACX,YAAY;EACZ,+CAA+C;EAC/C,wBAAwB;EACxB,4BAA4B;EAC5B,WAAW;AACb;;AAEA;EACE,UAAU;EACV,YAAY;AACd;;AAEA;EACE,cAAc;AAChB;;AAEA;;EAEE,qBAAqB;EACrB,cAAc;AAChB;;AAEA;EACE,wBAAwB;AAC1B;;AAEA;EACE,mBAAmB;AACrB;;AAEA,UAAU;;AAEV;EACE,SAAS;EACT,UAAU;AACZ;;AAEA;EACE,aAAa;EACb,mBAAmB;EACnB,sBAAsB;EACtB,gBAAgB;EAChB,iBAAiB;EACjB,sBAAsB;EACtB,mBAAmB;EACnB,gBAAgB;AAClB;;AAEA;EACE,UAAU;EACV,gBAAgB;EAChB,aAAa;EACb,qBAAqB;AACvB;;AAEA,kBAAkB;;AAElB;EACE,gBAAgB;EAChB,cAAc;EACd,SAAS;EACT,6BAA6B;AAC/B;;AAEA;EACE,WAAW;EACX,UAAU,EAAE,mDAAmD;AACjE;;AAEA;EACE,kBAAkB;AACpB;;AAEA;;EAEE,kBAAkB;AACpB;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,qBAAqB;EACrB,cAAc;EACd,WAAW;EACX,YAAY;EACZ,wDAAwD;AAC1D;;AAEA;EACE,uDAAuD;AACzD;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,gBAAgB;EAChB,yBAAyB;EACzB,cAAc;EACd,gBAAgB;AAClB;;AAEA;;EAEE,YAAY;EACZ,aAAa;EACb,aAAa;EACb,iBAAiB;EACjB,kBAAkB;AACpB;;AAEA;EACE,qBAAqB;EACrB,WAAW;EACX,yBAAyB;AAC3B;;AAEA;EACE,kBAAkB;AACpB;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,UAAU;EACV,yBAAyB;EACzB,6DAA6D;AAC/D;;AAEA;EACE,cAAc;EACd,WAAW;EACX,gBAAgB,EAAE,qCAAqC;EACvD,kBAAkB,EAAE,6CAA6C;EACjE,sBAAsB;EACtB,iBAAiB;AACnB;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,cAAc;EACd,kBAAkB;AACpB;;AAEA,YAAY;;AAEZ;EACE,aAAa;EACb,uBAAuB;EACvB,uBAAuB;EACvB,eAAe;EACf,YAAY;EACZ,MAAM;EACN,QAAQ;EACR,SAAS;EACT,OAAO;EACP,aAAa;EACb,8BAA8B;AAChC;;AAEA;EACE,eAAe;EACf,UAAU;EACV,sBAAsB;EACtB,iDAAiD;AACnD;;AAEA;EACE,SAAS;AACX;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,aAAa;AACf;;AAEA;EACE,QAAQ;EACR,cAAc;EACd,aAAa;EACb,eAAe;AACjB;;AAEA;EACE,QAAQ;AACV;;AAEA;EACE,QAAQ;EACR,eAAe;EACf,eAAe;EACf,iCAAiC;AACnC;;AAEA;;EAEE,aAAa;AACf;;AAEA;;EAEE,kBAAkB;AACpB;;AAEA;EACE,wCAAwC;AAC1C;;AAEA;;;EAGE,aAAa;AACf;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,gBAAgB;AAClB;;AAEA;EACE,gBAAgB;EAChB,WAAW;EACX,SAAS;AACX;;AAEA;EACE,YAAY;AACd;;AAEA;EACE,WAAW;AACb;;AAEA;EACE,cAAc;EACd,WAAW;EACX,YAAY;EACZ,YAAY;EACZ,WAAW;AACb;;AAEA;EACE,sBAAsB;EACtB,kEAAkE;AACpE;;AAEA;EACE,qBAAqB;EACrB,kBAAkB;AACpB;;AAEA,WAAW;;AAEX;EACE,gBAAgB;AAClB;;AAEA;EACE,cAAc;EACd,gBAAgB;AAClB","sourcesContent":["/*\n * This file is part of Adblock Plus <https://adblockplus.org/>,\n * Copyright (C) 2006-present eyeo GmbH\n *\n * Adblock Plus is free software: you can redistribute it and/or modify\n * it under the terms of the GNU General Public License version 3 as\n * published by the Free Software Foundation.\n *\n * Adblock Plus is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n * GNU General Public License for more details.\n *\n * You should have received a copy of the GNU General Public License\n * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.\n */\n\n@import \"../../theme/ui/font.css\";\n@import \"../../theme/ui/light.css\";\n\nbody,\ninput {\n  font-family: \"Source Sans Pro\", sans-serif;\n  font-size: 14px;\n}\n\nbody {\n  margin: 0;\n  text-align: center;\n  color: #494949;\n}\n\nmain,\n[role=\"dialog\"] {\n  text-align: start;\n}\n\nmain {\n  padding: 20px 45px;\n}\n\nh1 {\n  position: relative;\n  font-size: 1em;\n  line-height: 20px;\n  color: #000;\n}\n\nh1::before {\n  position: absolute;\n  left: -25px;\n  width: 20px;\n  height: 20px;\n  background-image: url(/skin/icons/logo/abp.svg);\n  background-size: contain;\n  background-repeat: no-repeat;\n  content: \"\";\n}\n\nhtml[dir=\"rtl\"] h1::before {\n  left: auto;\n  right: -25px;\n}\n\nh2 {\n  font-size: 1em;\n}\n\na:link,\na:visited {\n  text-decoration: none;\n  color: #099dd1;\n}\n\n[hidden] {\n  display: none !important;\n}\n\n#acceptableAds-more {\n  white-space: nowrap;\n}\n\n/* Lists */\n\nul {\n  margin: 0;\n  padding: 0;\n}\n\nul > li {\n  display: flex;\n  align-items: center;\n  box-sizing: border-box;\n  min-height: 46px;\n  padding: 5px 10px;\n  border: 1px solid #bbb;\n  border-bottom: none;\n  list-style: none;\n}\n\nul > li > span {\n  flex: auto;\n  overflow: hidden;\n  padding: 10px;\n  word-wrap: break-word;\n}\n\n/* Form elements */\n\ninput[type=\"text\"] {\n  min-width: 220px;\n  padding: 5px 0;\n  border: 0;\n  border-bottom: 1px solid #bbb;\n}\n\ninput[type=\"text\"]::placeholder {\n  color: #bbb;\n  opacity: 1; /* Firefox sets opacity so we need to override it */\n}\n\ninput[type=\"text\"]:focus::placeholder {\n  color: transparent;\n}\n\ninput[type=\"text\"]:not(:focus):placeholder-shown ~ label,\ninput[type=\"text\"]:not(:placeholder-shown) ~ .error {\n  visibility: hidden;\n}\n\n.toggle-container {\n  display: flex;\n}\n\n.toggle-container > span {\n  flex: auto;\n}\n\n.toggle-container input {\n  display: none;\n}\n\n.toggle-image {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 36px;\n  height: 21px;\n  background-image: url(/skin/icons/mobile/toggle.svg#off);\n}\n\ninput:checked + .toggle-image {\n  background-image: url(/skin/icons/mobile/toggle.svg#on);\n}\n\nbutton {\n  width: 100%;\n  border: none;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: #099dd1;\n  background: none;\n}\n\nbutton.primary,\nbutton.secondary {\n  height: auto;\n  margin: 5px 0;\n  padding: 10px;\n  border: 1px solid;\n  border-radius: 2px;\n}\n\nbutton.primary {\n  border-color: #099dd1;\n  color: #fff;\n  background-color: #099dd1;\n}\n\nbutton.secondary {\n  border-color: #bbb;\n}\n\nbutton.add::before {\n  content: \"+ \";\n}\n\nbutton.remove {\n  width: 36px;\n  height: 36px;\n  padding: 0;\n  background-color: #099dd1;\n  mask: url(/skin/icons/mobile/trash.svg) center/19px no-repeat;\n}\n\nul + button {\n  flex-shrink: 0;\n  width: 100%;\n  min-height: 46px; /* equal to min-height of list item */\n  padding: 15px 20px; /* based on margin and padding of list item */\n  border: 1px solid #bbb;\n  text-align: start;\n}\n\n#enabled-container {\n  align-items: center;\n}\n\n#enabled-container #enabled-domain {\n  display: block;\n  font-style: normal;\n}\n\n/* Dialogs */\n\n#dialog {\n  display: flex;\n  align-items: flex-start;\n  justify-content: center;\n  position: fixed;\n  z-index: 101;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  padding: 20px;\n  background: rgba(0, 0, 0, 0.7);\n}\n\n[role=\"dialog\"] {\n  max-width: 25em;\n  padding: 0;\n  border: 1px solid #bbb;\n  background-color: var(--background-color-primary);\n}\n\n[role=\"dialog\"] h2 {\n  margin: 0;\n}\n\n[role=\"dialog\"] form {\n  padding: 20px;\n}\n\n[role=\"dialog\"] p {\n  display: flex;\n  flex-direction: column;\n  margin: 5px 0;\n}\n\n[role=\"dialog\"] label {\n  order: 1;\n  display: block;\n  margin: 5px 0;\n  font-size: 10px;\n}\n\n[role=\"dialog\"] input[type=\"text\"] {\n  order: 2;\n}\n\n[role=\"dialog\"] .error {\n  order: 3;\n  margin-top: 5px;\n  font-size: 12px;\n  color: var(--color-brand-primary);\n}\n\n#dialog-subscribe [name=\"title\"]:placeholder-shown,\n#dialog-subscribe [name=\"title\"]:placeholder-shown ~ * {\n  display: none;\n}\n\n[role=\"dialog\"]:not([data-error]) .error,\n#dialog-subscribe:not([data-error=\"url\"]) .error[data-error=\"url\"] {\n  visibility: hidden;\n}\n\n#dialog-subscribe[data-error=\"url\"] [name=\"url\"]:placeholder-shown {\n  border-color: var(--color-brand-primary);\n}\n\nbody:not([data-dialog]) #dialog,\nbody:not([data-dialog=\"recommended\"]) #dialog-recommended,\nbody:not([data-dialog=\"subscribe\"]) #dialog-subscribe {\n  display: none;\n}\n\n#dialog-recommended {\n  display: flex;\n  flex-direction: column;\n  max-height: 100%;\n}\n\n#dialog-recommended ul {\n  overflow-y: auto;\n  width: auto;\n  margin: 0;\n}\n\n#dialog-recommended ul li {\n  border: none;\n}\n\n#dialog-recommended ul li.installed {\n  color: #bbb;\n}\n\n#dialog-recommended ul li::before {\n  flex-shrink: 0;\n  width: 13px;\n  height: 11px;\n  margin: 10px;\n  content: \"\";\n}\n\n#dialog-recommended ul li.installed::before {\n  background-color: #bbb;\n  mask: url(/skin/icons/mobile/checkmark.svg) center/cover no-repeat;\n}\n\n#dialog-recommended > button {\n  border-width: 1px 0 0;\n  text-align: center;\n}\n\n/* Footer */\n\nfooter {\n  margin-top: 40px;\n}\n\nfooter > a:last-child::before {\n  margin: 0 10px;\n  content: \"\\2022\";\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 6054:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5516);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1364);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
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

@font-face {
  font-family: "Source Sans Pro";
  font-style: normal;
  font-weight: 300;
  src:
    local("Source Sans Pro Light"),
    local("SourceSansPro-Light"),
    url(/skin/fonts/source-sans-pro-300.woff2) format("woff2");
}

@font-face {
  font-family: "Source Sans Pro";
  font-style: normal;
  font-weight: 400;
  src:
    local("Source Sans Pro Regular"),
    local("SourceSansPro-Regular"),
    url(/skin/fonts/source-sans-pro-400.woff2) format("woff2");
}

@font-face {
  font-family: "Source Sans Pro";
  font-style: normal;
  font-weight: 700;
  src:
    local("Source Sans Pro Bold"),
    local("SourceSansPro-Bold"),
    url(/skin/fonts/source-sans-pro-700.woff2) format("woff2");
}

body {
  font-family: "Source Sans Pro", sans-serif;
  font-size: inherit;
}
`, "",{"version":3,"sources":["webpack://./src/theme/ui/font.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;;;EAeE;;AAEF;EACE,8BAA8B;EAC9B,kBAAkB;EAClB,gBAAgB;EAChB;;;8DAG4D;AAC9D;;AAEA;EACE,8BAA8B;EAC9B,kBAAkB;EAClB,gBAAgB;EAChB;;;8DAG4D;AAC9D;;AAEA;EACE,8BAA8B;EAC9B,kBAAkB;EAClB,gBAAgB;EAChB;;;8DAG4D;AAC9D;;AAEA;EACE,0CAA0C;EAC1C,kBAAkB;AACpB","sourcesContent":["/*\n * This file is part of Adblock Plus <https://adblockplus.org/>,\n * Copyright (C) 2006-present eyeo GmbH\n *\n * Adblock Plus is free software: you can redistribute it and/or modify\n * it under the terms of the GNU General Public License version 3 as\n * published by the Free Software Foundation.\n *\n * Adblock Plus is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n * GNU General Public License for more details.\n *\n * You should have received a copy of the GNU General Public License\n * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.\n */\n\n@font-face {\n  font-family: \"Source Sans Pro\";\n  font-style: normal;\n  font-weight: 300;\n  src:\n    local(\"Source Sans Pro Light\"),\n    local(\"SourceSansPro-Light\"),\n    url(/skin/fonts/source-sans-pro-300.woff2) format(\"woff2\");\n}\n\n@font-face {\n  font-family: \"Source Sans Pro\";\n  font-style: normal;\n  font-weight: 400;\n  src:\n    local(\"Source Sans Pro Regular\"),\n    local(\"SourceSansPro-Regular\"),\n    url(/skin/fonts/source-sans-pro-400.woff2) format(\"woff2\");\n}\n\n@font-face {\n  font-family: \"Source Sans Pro\";\n  font-style: normal;\n  font-weight: 700;\n  src:\n    local(\"Source Sans Pro Bold\"),\n    local(\"SourceSansPro-Bold\"),\n    url(/skin/fonts/source-sans-pro-700.woff2) format(\"woff2\");\n}\n\nbody {\n  font-family: \"Source Sans Pro\", sans-serif;\n  font-size: inherit;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 4341:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5516);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1364);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
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

:root {
  --background-color-cta-primary: #0797e1;
  --background-color-cta-primary-hover: #0797e1ee;
  --background-color-cta-secondary: #fff;
  --background-color-cta-secondary-hover: #0001;
  --background-color-error: #f7dde1;
  --background-color-info: #0797e1;
  --background-color-secondary: #f7f7f7;
  --background-color-primary: #fff;
  --background-color-ternary: #edf9ff;
  --border-color-cta-primary: var(--background-color-cta-primary);
  --border-color-cta-secondary: var(--color-primary);
  --border-color-secondary: #d2d2d2;
  --border-color-primary: #cdcdcd;
  --border-color-ternary: #c0e6f9;
  --border-color-outline: #acacac;
  --border-radius: 4px;
  --border-radius-primary: 6px;
  --border-style-primary: solid;
  --border-width-thick: 4px;
  --border-width-thin: 1px;
  --box-shadow-primary: 0 2px 4px 0 hsla(0, 0%, 84%, 0.5);
  --color-brand-primary: #ed1e45;
  --color-cta-primary: #fff;
  --color-cta-secondary: #666;
  --color-primary: #585858;
  --color-secondary: #000;
  --color-dimmed: #4a4a4a;
  --color-critical: var(--color-brand-primary);
  --color-default: #ff8f00;
  --color-error: var(--color-brand-primary);
  --color-link: #0797e1;
  --color-info: #0797e1;
  --color-premium: #eda51e;
  --color-premium-hover: #eb9b05;
  --font-size-heavy: 20px;
  --font-size-big: 17px;
  --font-size-medium: 16px;
  --font-size-primary: 13px;
  --font-size-small: 12px;
  --margin-primary: 16px;
  --margin-secondary: calc(var(--margin-primary) / 2);
  --padding-primary: 16px;
  --padding-secondary: calc(var(--padding-primary) / 2);
  --primary-outline: var(--border-color-outline) dotted 1px;
}
`, "",{"version":3,"sources":["webpack://./src/theme/ui/light.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;;;EAeE;;AAEF;EACE,uCAAuC;EACvC,+CAA+C;EAC/C,sCAAsC;EACtC,6CAA6C;EAC7C,iCAAiC;EACjC,gCAAgC;EAChC,qCAAqC;EACrC,gCAAgC;EAChC,mCAAmC;EACnC,+DAA+D;EAC/D,kDAAkD;EAClD,iCAAiC;EACjC,+BAA+B;EAC/B,+BAA+B;EAC/B,+BAA+B;EAC/B,oBAAoB;EACpB,4BAA4B;EAC5B,6BAA6B;EAC7B,yBAAyB;EACzB,wBAAwB;EACxB,uDAAuD;EACvD,8BAA8B;EAC9B,yBAAyB;EACzB,2BAA2B;EAC3B,wBAAwB;EACxB,uBAAuB;EACvB,uBAAuB;EACvB,4CAA4C;EAC5C,wBAAwB;EACxB,yCAAyC;EACzC,qBAAqB;EACrB,qBAAqB;EACrB,wBAAwB;EACxB,8BAA8B;EAC9B,uBAAuB;EACvB,qBAAqB;EACrB,wBAAwB;EACxB,yBAAyB;EACzB,uBAAuB;EACvB,sBAAsB;EACtB,mDAAmD;EACnD,uBAAuB;EACvB,qDAAqD;EACrD,yDAAyD;AAC3D","sourcesContent":["/*\n * This file is part of Adblock Plus <https://adblockplus.org/>,\n * Copyright (C) 2006-present eyeo GmbH\n *\n * Adblock Plus is free software: you can redistribute it and/or modify\n * it under the terms of the GNU General Public License version 3 as\n * published by the Free Software Foundation.\n *\n * Adblock Plus is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n * GNU General Public License for more details.\n *\n * You should have received a copy of the GNU General Public License\n * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.\n */\n\n:root {\n  --background-color-cta-primary: #0797e1;\n  --background-color-cta-primary-hover: #0797e1ee;\n  --background-color-cta-secondary: #fff;\n  --background-color-cta-secondary-hover: #0001;\n  --background-color-error: #f7dde1;\n  --background-color-info: #0797e1;\n  --background-color-secondary: #f7f7f7;\n  --background-color-primary: #fff;\n  --background-color-ternary: #edf9ff;\n  --border-color-cta-primary: var(--background-color-cta-primary);\n  --border-color-cta-secondary: var(--color-primary);\n  --border-color-secondary: #d2d2d2;\n  --border-color-primary: #cdcdcd;\n  --border-color-ternary: #c0e6f9;\n  --border-color-outline: #acacac;\n  --border-radius: 4px;\n  --border-radius-primary: 6px;\n  --border-style-primary: solid;\n  --border-width-thick: 4px;\n  --border-width-thin: 1px;\n  --box-shadow-primary: 0 2px 4px 0 hsla(0, 0%, 84%, 0.5);\n  --color-brand-primary: #ed1e45;\n  --color-cta-primary: #fff;\n  --color-cta-secondary: #666;\n  --color-primary: #585858;\n  --color-secondary: #000;\n  --color-dimmed: #4a4a4a;\n  --color-critical: var(--color-brand-primary);\n  --color-default: #ff8f00;\n  --color-error: var(--color-brand-primary);\n  --color-link: #0797e1;\n  --color-info: #0797e1;\n  --color-premium: #eda51e;\n  --color-premium-hover: #eb9b05;\n  --font-size-heavy: 20px;\n  --font-size-big: 17px;\n  --font-size-medium: 16px;\n  --font-size-primary: 13px;\n  --font-size-small: 12px;\n  --margin-primary: 16px;\n  --margin-secondary: calc(var(--margin-primary) / 2);\n  --padding-primary: 16px;\n  --padding-secondary: calc(var(--padding-primary) / 2);\n  --primary-outline: var(--border-color-outline) dotted 1px;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 1364:
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 5516:
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ 3465:
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 5814:
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 2389:
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 9337:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 6622:
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ 8722:
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ 2558:
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
    const apiMetadata = __webpack_require__(2058);

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

/***/ 2058:
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
/******/ 			id: moduleId,
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

;// ./src/core/messaging/shared/emitter.ts
class MessageEmitter {
    constructor() {
        this.listeners = new Set();
    }
    addListener(listener) {
        this.listeners.add(listener);
    }
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    dispatch(message, sender) {
        const results = [];
        for (const listener of this.listeners) {
            results.push(listener(message, sender));
        }
        return results;
    }
}

;// ./src/core/messaging/shared/messaging.ts
function getMessageResponse(responses) {
    for (const response of responses) {
        if (typeof response !== "undefined") {
            return response;
        }
    }
}
function isEventMessage(candidate) {
    return isMessage(candidate) && "action" in candidate && "args" in candidate;
}
function isMessage(candidate) {
    return (candidate !== null && typeof candidate === "object" && "type" in candidate);
}
function isListenMessage(candidate) {
    return isMessage(candidate) && "filter" in candidate;
}
function isPremiumActivateOptions(candidate) {
    return (candidate !== null && typeof candidate === "object" && "userId" in candidate);
}
function isPremiumSubscriptionsAddRemoveOptions(candidate) {
    return (candidate !== null &&
        typeof candidate === "object" &&
        "subscriptionType" in candidate);
}

;// ./src/core/messaging/front/messaging.ts

let port;
const connectListeners = new Set();
const disconnectListeners = new Set();
const messageListeners = new Set();
const messageEmitter = new MessageEmitter();
function addConnectListener(listener) {
    connectListeners.add(listener);
    listener();
}
function addDisconnectListener(listener) {
    disconnectListeners.add(listener);
}
function addMessageListener(listener) {
    messageListeners.add(listener);
}
const connect = () => {
    if (port) {
        return port;
    }
    try {
        port = browser.runtime.connect({ name: "ui" });
    }
    catch (ex) {
        port = null;
        disconnectListeners.forEach((listener) => {
            listener();
        });
        return port;
    }
    port.onMessage.addListener((message) => {
        if (!isMessage(message)) {
            return;
        }
        onMessage(message);
    });
    port.onDisconnect.addListener(onDisconnect);
    connectListeners.forEach((listener) => {
        listener();
    });
    return port;
};
function listen({ type, filter, ...options }) {
    addConnectListener(() => {
        if (port) {
            port.postMessage({
                type: `${type}.listen`,
                filter,
                ...options
            });
        }
    });
}
function onDisconnect() {
    port = null;
    setTimeout(() => connect(), 100);
}
function onMessage(message) {
    if (!message.type.endsWith(".respond")) {
        return;
    }
    messageListeners.forEach((listener) => {
        listener(message);
    });
}
function removeDisconnectListener(listener) {
    disconnectListeners.delete(listener);
}
function start() {
    connect();
    if (typeof browser.devtools === "undefined") {
        browser.runtime.onMessage.addListener((message, sender) => {
            if (!isMessage(message)) {
                return;
            }
            const responses = messageEmitter.dispatch(message, sender);
            const response = getMessageResponse(responses);
            if (typeof response === "undefined") {
                return;
            }
            return Promise.resolve(response);
        });
    }
}
start();

;// ./src/core/messaging/front/utils.ts
async function utils_send(sendType, options = {}) {
    const args = {
        ...options,
        type: sendType
    };
    return await browser.runtime.sendMessage(args);
}

;// ./src/core/messaging/front/category-app.ts


const platformToStore = new Map([
    ["chromium", "chrome"],
    ["edgehtml", "edge"],
    ["gecko", "firefox"]
]);
async function get(what) {
    const options = { what };
    return await utils_send("app.get", options);
}
async function getInfo() {
    var _a;
    const [application, platform] = await Promise.all([
        get("application"),
        get("platform")
    ]);
    let store;
    if (application !== "edge" && application !== "opera") {
        store = (_a = platformToStore.get(platform)) !== null && _a !== void 0 ? _a : "chrome";
    }
    else {
        store = application;
    }
    return {
        application,
        manifestVersion: browser.runtime.getManifest().manifest_version,
        platform,
        store
    };
}
function category_app_listen(filter) {
    listen({ type: "app", filter });
}
async function category_app_open(what, parameters = {}) {
    const options = { what, ...parameters };
    await utils_send("app.open", options);
}

;// ./src/core/messaging/front/category-filters.ts


async function category_filters_get() {
    return await utils_send("filters.get");
}
function category_filters_listen(filter) {
    listen({ type: "filters", filter });
}

;// ./src/core/messaging/front/category-prefs.ts


async function category_prefs_get(key) {
    const options = { key };
    return await send("prefs.get", options);
}
function category_prefs_listen(filter) {
    messaging.listen({ type: "prefs", filter });
}

;// ./src/core/messaging/front/category-premium.ts


async function activate(userId) {
    const options = { userId };
    return await send("premium.activate", options);
}
async function add(subscriptionType) {
    const options = { subscriptionType };
    await send("premium.subscriptions.add", options);
}
async function category_premium_get() {
    return await send("premium.get");
}
async function getPremiumSubscriptionsState() {
    return await send("premium.subscriptions.getState");
}
function category_premium_listen(filter) {
    messaging.listen({ type: "premium", filter });
}
async function remove(subscriptionType) {
    const options = { subscriptionType };
    await send("premium.subscriptions.remove", options);
}

;// ./src/core/messaging/front/category-requests.ts

function category_requests_listen(filter, tabId) {
    messaging.listen({ type: "requests", filter, tabId });
}

;// ./src/core/messaging/front/category-stats.ts


async function getBlockedPerPage(tab) {
    const options = { tab };
    return await send("stats.getBlockedPerPage", options);
}
async function getBlockedTotal() {
    return await send("stats.getBlockedTotal");
}
function category_stats_listen(filter) {
    messaging.listen({ type: "stats", filter });
}

;// ./src/core/messaging/front/category-subscriptions.ts


async function category_subscriptions_add(url) {
    const options = { url };
    return await utils_send("subscriptions.add", options);
}
async function category_subscriptions_get(options) {
    return await utils_send("subscriptions.get", options !== null && options !== void 0 ? options : {});
}
async function getInitIssues() {
    return await utils_send("subscriptions.getInitIssues");
}
async function getRecommendations() {
    return await utils_send("subscriptions.getRecommendations");
}
function category_subscriptions_listen(filter) {
    listen({ type: "subscriptions", filter });
}
async function category_subscriptions_remove(url) {
    const options = { url };
    await utils_send("subscriptions.remove", options);
}

;// ./src/core/messaging/front/index.ts




















;// ./src/filters/shared/filter.types.ts
var FilterOrigin;
(function (FilterOrigin) {
    FilterOrigin["popup"] = "popup";
    FilterOrigin["web"] = "web";
    FilterOrigin["devtools"] = "devtools";
    FilterOrigin["composer"] = "composer";
    FilterOrigin["optionsAllowlistedWebsites"] = "options-allowlisted-websites";
    FilterOrigin["optionsMobile"] = "options-mobile";
    FilterOrigin["optionsAdvanced"] = "options-advanced";
})(FilterOrigin || (FilterOrigin = {}));

;// ./src/filters/shared/index.ts


;// ./js/common.mjs
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

function convertDoclinks() {
  const links = document.querySelectorAll("a[data-doclink]");
  for (const link of links) {
    getDoclink(link.dataset.doclink).then((url) => {
      link.target = link.target || "_blank";
      link.href = url;
    });
  }
}

function getDoclink(link) {
  return browser.runtime.sendMessage({
    type: "app.get",
    what: "doclink",
    link
  });
}

function getErrorMessage(error) {
  let message = null;
  if (error) {
    let messageId = error.reason || error.type;
    let placeholders = [];
    if (error.reason === "filter_unknown_option") {
      if (error.option) placeholders = [error.option];
      else messageId = "filter_invalid_option";
    }

    message = browser.i18n.getMessage(messageId, placeholders);
  }

  // Use a generic error message if we don't have one available yet
  if (!message) {
    message = browser.i18n.getMessage("filter_action_failed");
  }

  if (!error || typeof error.lineno !== "number") return message;

  return browser.i18n.getMessage("line", [
    error.lineno.toLocaleString(),
    message
  ]);
}

function getSourceAttribute(element) {
  const sourceContainer = element.closest("[data-source]");

  if (!sourceContainer) return null;

  return sourceContainer.dataset.source;
}

// EXTERNAL MODULE: ../../node_modules/webextension-polyfill/src/browser-polyfill.js
var browser_polyfill = __webpack_require__(2558);
var browser_polyfill_default = /*#__PURE__*/__webpack_require__.n(browser_polyfill);
;// ./src/i18n/ui/i18n.ts

const i18nAttributes = ["alt", "placeholder", "title", "value"];
function assignAction(elements, action) {
    for (const element of elements) {
        switch (typeof action) {
            case "string":
                element.href = action;
                element.target = "_blank";
                break;
            case "function":
                element.href = "#";
                element.addEventListener("click", (ev) => {
                    ev.preventDefault();
                    action();
                });
                break;
        }
    }
}
function* getRemainingLinks(parent) {
    const links = parent.querySelectorAll("a:not([data-i18n-index])");
    for (const link of links) {
        yield link;
    }
}
function setElementLinks(idOrElement, ...actions) {
    var _a;
    const element = typeof idOrElement === "string"
        ? document.getElementById(idOrElement)
        : idOrElement;
    if (element === null) {
        return;
    }
    const remainingLinks = getRemainingLinks(element);
    for (let i = 0; i < actions.length; i++) {
        const links = element.querySelectorAll(`a[data-i18n-index='${i}']`);
        if (links.length > 0) {
            assignAction(links, actions[i]);
            continue;
        }
        const link = remainingLinks.next();
        if ((_a = link.done) !== null && _a !== void 0 ? _a : false)
            continue;
        assignAction([link.value], actions[i]);
    }
}
function stripTagsUnsafe(text) {
    return text.replace(/<\/?[^>]+>/g, "");
}
function setElementText(element, stringName, args, children = []) {
    function processString(str, currentElement) {
        const match = /^(.*?)<(a|em|slot|strong)(\d)?>(.*?)<\/\2\3>(.*)$/.exec(str);
        if (match !== null) {
            const [, before, name, index, innerText, after] = match;
            processString(before, currentElement);
            if (name === "slot") {
                const e = children[Number(index)];
                if (e !== undefined) {
                    currentElement.appendChild(e);
                }
            }
            else {
                const e = document.createElement(name);
                if (typeof index !== "undefined") {
                    e.dataset.i18nIndex = index;
                }
                processString(innerText, e);
                currentElement.appendChild(e);
            }
            processString(after, currentElement);
        }
        else
            currentElement.appendChild(document.createTextNode(str));
    }
    while (element.lastChild !== null) {
        element.removeChild(element.lastChild);
    }
    processString(browser_polyfill_default().i18n.getMessage(stringName, args !== null && args !== void 0 ? args : undefined), element);
}
function loadI18nStrings() {
    function resolveStringNames(container) {
        var _a, _b;
        if (container === null || container === undefined) {
            return;
        }
        {
            const elements = container.querySelectorAll("[data-i18n]");
            for (const element of elements) {
                const children = Array.from(element.children);
                setElementText(element, (_a = element.dataset.i18n) !== null && _a !== void 0 ? _a : "", null, children);
            }
        }
        for (const attr of i18nAttributes) {
            const elements = container.querySelectorAll(`[data-i18n-${attr}]`);
            for (const element of elements) {
                const stringName = (_b = element.getAttribute(`data-i18n-${attr}`)) !== null && _b !== void 0 ? _b : "";
                element.setAttribute(attr, browser_polyfill_default().i18n.getMessage(stringName));
            }
        }
    }
    resolveStringNames(document);
    for (const template of document.querySelectorAll("template")) {
        resolveStringNames(template.content);
    }
}
function isLocaleInfo(candidate) {
    return (candidate !== null &&
        typeof candidate === "object" &&
        "bidiDir" in candidate &&
        "locale" in candidate);
}
async function setLanguageAttributes() {
    const localeInfo = await browser_polyfill_default().runtime.sendMessage({
        type: "app.get",
        what: "localeInfo"
    });
    if (!isLocaleInfo(localeInfo)) {
        return;
    }
    document.documentElement.lang = localeInfo.locale;
    document.documentElement.dir = localeInfo.bidiDir;
}
function initI18n() {
    void setLanguageAttributes();
    loadI18nStrings();
}

;// ./src/i18n/ui/index.ts


// EXTERNAL MODULE: ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(3465);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ../../node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(6622);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ../../node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(5814);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(9337);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ../../node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(2389);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ../../node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(8722);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!./src/mobile-options/ui/mobile-options.css
var mobile_options = __webpack_require__(3588);
;// ./src/mobile-options/ui/mobile-options.css

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());

      options.insert = insertBySelector_default().bind(null, "head");
    
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(mobile_options/* default */.A, options);




       /* harmony default export */ const ui_mobile_options = (mobile_options/* default */.A && mobile_options/* default */.A.locals ? mobile_options/* default */.A.locals : undefined);

;// ./js/pages/mobile-options.mjs
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








{
  const dialogSubscribe = "subscribe";
  const idAcceptableAds = "acceptableAds";
  const idRecommended = "subscriptions-recommended";
  const promisedAcceptableAdsUrl = getAcceptableAdsUrl();
  let allowlistFilter = null;

  /* Utility functions */

  function get(selector, origin) {
    return (origin || document).querySelector(selector);
  }

  function getAll(selector, origin) {
    return (origin || document).querySelectorAll(selector);
  }

  function create(parent, tagName, content, attributes, onclick) {
    const element = document.createElement(tagName);

    if (typeof content == "string") {
      element.textContent = content;
    }

    if (attributes) {
      for (const name in attributes) {
        element.setAttribute(name, attributes[name]);
      }
    }

    if (onclick) {
      element.addEventListener("click", (ev) => {
        onclick(ev);
        ev.stopPropagation();
      });
    }

    parent.appendChild(element);
    return element;
  }

  /* Extension interactions */

  function getInstalled() {
    return browser.runtime.sendMessage({ type: "subscriptions.get" });
  }

  function getAcceptableAdsUrl() {
    return browser.runtime.sendMessage({
      type: "app.get",
      what: "acceptableAdsUrl"
    });
  }

  function getRecommendedAds() {
    return browser.runtime
      .sendMessage({
        type: "app.get",
        what: "recommendations"
      })
      .then((recommendations) => {
        return recommendations
          .filter((recommendation) => recommendation.type == "ads")
          .map((recommendation) => {
            return {
              title: recommendation.title,
              url: recommendation.url
            };
          });
      });
  }

  function installSubscription(url, title) {
    browser.runtime.sendMessage({ type: "subscriptions.add", url, title });
  }

  function uninstallSubscription(url) {
    browser.runtime.sendMessage({ type: "subscriptions.remove", url });
  }

  /* Actions */

  function setFilter({ disabled, text }, action) {
    if (!allowlistFilter || text != allowlistFilter) return;

    get("#enabled").checked = action == "remove" || disabled;
  }

  function setSubscription(subscription, action) {
    const { disabled, filters, title, url } = subscription;
    if (disabled) {
      action = "remove";
    }

    // Handle custom subscription
    if (/^~user/.test(url)) {
      for (const filter of filters) {
        setFilter(filter, action);
      }
      return;
    }

    promisedAcceptableAdsUrl.then((acceptableAdsUrl) => {
      // Update Acceptable Ads
      if (url == acceptableAdsUrl) {
        get(`#${idAcceptableAds}`).checked = action != "remove";
        return;
      }

      const listInstalled = get("#subscriptions-installed");
      const installed = get(`[data-url="${url}"]`, listInstalled);

      // Remove subscription
      if (action == "remove") {
        if (installed) {
          installed.parentNode.removeChild(installed);
        }

        const recommended = get(`#${idRecommended} [data-url="${url}"]`);
        if (recommended) {
          recommended.classList.remove("installed");
        }
      }
      // Update subscription
      else if (installed) {
        const titleElement = get("span", installed);
        titleElement.textContent = title || url;
      }
      // Add subscription
      else if (action == "add") {
        const element = create(listInstalled, "li", null, { "data-url": url });
        create(element, "span", title || url);
        create(element, "button", null, { class: "remove" }, () =>
          uninstallSubscription(url)
        );

        const recommended = get(`#${idRecommended} [data-url="${url}"]`);
        if (recommended) {
          recommended.classList.add("installed");
        }
      }
    });
  }

  function setDialog(id, options) {
    if (!id) {
      delete document.body.dataset.dialog;
      return;
    }

    const fields = getAll(`#dialog-${id} input`);
    for (const field of fields) {
      const { name } = field;
      field.value = options && name in options ? options[name] : "";
    }
    setError(id, null);

    document.body.dataset.dialog = id;
  }

  function setError(dialogId, fieldName) {
    const dialog = get(`#dialog-${dialogId}`);
    if (fieldName) {
      dialog.dataset.error = fieldName;
    } else {
      delete dialog.dataset.error;
    }
  }

  function populateLists() {
    Promise.all([getInstalled(), getRecommendedAds()])
      .then(([installed, recommended]) => {
        const listRecommended = get(`#${idRecommended}`);
        for (const { title, url } of recommended) {
          create(listRecommended, "li", title, { "data-url": url }, (ev) => {
            if (ev.target.classList.contains("installed")) return;

            setDialog(dialogSubscribe, { title, url });
          });
        }

        for (const subscription of installed) {
          if (subscription.disabled) continue;

          setSubscription(subscription, "add");
        }
      })
      .catch((err) => console.error(err));
  }

  /* Listeners */

  function onChange(ev) {
    if (ev.target.id != idAcceptableAds) return;

    promisedAcceptableAdsUrl.then((acceptableAdsUrl) => {
      if (ev.target.checked) {
        installSubscription(acceptableAdsUrl, null);
      } else {
        uninstallSubscription(acceptableAdsUrl);
      }
    });
  }
  document.addEventListener("change", onChange);

  function toggleAllowlistFilter(toggle) {
    if (allowlistFilter) {
      browser.runtime
        .sendMessage({
          type: toggle.checked ? "filters.remove" : "filters.add",
          text: allowlistFilter,
          origin: FilterOrigin.optionsMobile
        })
        .then((errors) => {
          if (errors.length < 1) return;

          console.error(getErrorMessage(errors[0]));
          toggle.checked = !toggle.checked;
        });
    } else {
      console.error("Allowlist filter hasn't been initialized yet");
    }
  }

  function onClick(ev) {
    switch (ev.target.dataset.action) {
      case "close-dialog":
        setDialog(null);
        break;
      case "open-dialog":
        setDialog(ev.target.dataset.dialog);
        break;
      case "toggle-enabled":
        toggleAllowlistFilter(ev.target);
        ev.preventDefault();
        break;
    }
  }
  document.addEventListener("click", onClick);

  function onSubmit(ev) {
    const fields = ev.target.elements;
    const title = fields.title.value;
    const url = fields.url.value;

    if (!url) {
      setError(dialogSubscribe, "url");
    } else {
      installSubscription(url, title);
      setDialog(null);
    }

    ev.preventDefault();
  }
  document.addEventListener("submit", onSubmit);

  function onMessage(msg) {
    switch (msg.type) {
      case "app.respond": {
        switch (msg.action) {
          case "addSubscription":
            const [subscription] = msg.args;

            let { title, url } = subscription;
            if (!title || title == url) {
              title = "";
            }

            setDialog(dialogSubscribe, { title, url });
            break;
          case "showPageOptions":
            const [{ host, allowlisted }] = msg.args;
            allowlistFilter = `@@||${host}^$document`;
            get("#enabled-domain").textContent = host;
            const toggle = get("#enabled");
            toggle.checked = !allowlisted;

            get("#enabled-container").hidden = false;
            break;
        }
        break;
      }
      case "filters.respond": {
        const action = msg.action == "added" ? "add" : "remove";
        setFilter(msg.args[0], action);
        break;
      }
      case "subscriptions.respond": {
        const [subscription, property] = msg.args;
        switch (msg.action) {
          case "added":
            setSubscription(subscription, "add");
            break;
          case "changed":
            setSubscription(
              subscription,
              // We're also receiving these messages for subscriptions that are
              // not installed so we shouldn't add those by accident
              property === "enabled" ? "add" : "update"
            );
            break;
          case "removed":
            setSubscription(subscription, "remove");
            break;
        }
        break;
      }
    }
  }

  addMessageListener(onMessage);

  category_app_listen(["addSubscription", "showPageOptions"]);
  category_filters_listen(["added", "removed"]);
  category_subscriptions_listen(["added", "changed", "removed"]);

  /* Initialization */

  convertDoclinks();
  initI18n();
  populateLists();

  getDoclink("privacy").then((url) => {
    get("#privacy-policy").href = url;
  });
  getDoclink("imprint").then((url) => {
    get("#imprint").href = url;
  });

  document.body.hidden = false;
}

/******/ })()
;
//# sourceMappingURL=mobile-options.js.map