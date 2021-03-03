// @ts-check
"use strict";

const { dirname } = require("path");
const _resolve = require("resolve");

/**
 * @type {import('./index').resolve}
 */
function resolve(id, { base } = {}) {
  return new Promise((resolve, reject) => {
    _resolve(id, { basedir: dirname(base) }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

exports.resolve = resolve;

/**
 * @type {import('./index').requireModule}
 */
function requireModule(id) {
  return require(id);
}

exports.requireModule = requireModule;

/**
 * @type {import('./index').requireDefault}
 */
function requireDefault(id) {
  const mod = require(id);
  return mod.__esModule ? mod.default : mod;
}

exports.requireDefault = requireDefault;

/**
 * @type {import('./index').requireNamedExport}
 */
function requireNamedExport(id, name) {
  return require(id)[name];
}

exports.requireNamedExport = requireNamedExport;
