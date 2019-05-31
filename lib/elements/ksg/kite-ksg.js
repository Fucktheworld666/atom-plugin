'use strict';

const { CompositeDisposable, Emitter } = require('atom');

const KSGCodeBlocks = require('./kite-codeblocks');
const KSGSearch = require('./kite-searchbar');

const { 
  CODEBLOCKS_EVENT,
  CODEBLOCKS_SELECTION_EVENT,
  SEARCH_EVENT, 
  SEARCH_QUERY_EVENT,
  SEARCH_QUERY_SELECTION_EVENT, 
} = require('../../ksg/constants');

/**
 * will need to have nest custom elements...
 * how to do that?
 */
class KSG extends HTMLElement {
  constructor() {
    super();
    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();

    this.addWrapper();
  }

  addWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-inner');

    this.appendChild(this.wrapper);
  }

  connectedCallback() {
    if (!this.emitter) { this.emitter = new Emitter(); }
    if (!this.subscriptions) { this.subscriptions = new CompositeDisposable(); }
    if (!this.wrapper) { this.addWrapper(); }

    this._disposed = false;

    this.setAttribute('tabindex', -1);
    this.codeBlocksElem = new KSGCodeBlocks();
    this.searchElem = new KSGSearch();

    this.subscriptions.add(this.codeBlocksElem.onCodeblocksSelected((payload) => {
      payload.type = CODEBLOCKS_SELECTION_EVENT;
      this.emitter.emit(CODEBLOCKS_EVENT, payload);
    }));

    this.subscriptions.add(this.searchElem.onSearchQueryEvent((payload) => {
      payload.type = SEARCH_QUERY_EVENT;
      this.emitter.emit(SEARCH_EVENT, payload);
    }));

    this.subscriptions.add(this.searchElem.onSearchQuerySelection((payload) => {
      payload.type = SEARCH_QUERY_SELECTION_EVENT;
      this.emitter.emit(CODEBLOCKS_EVENT, payload);
    }));

    this.wrapper.appendChild(this.searchElem);
    this.wrapper.appendChild(this.codeBlocksElem);
  }

  disconnectedCallback() {
    this.dispose();
  }

  onCodeBlocksEvent(callback) {
    return this.emitter.on(CODEBLOCKS_EVENT, callback);
  }

  onSearchEvent(callback) {
    return this.emitter.on(SEARCH_EVENT, callback);
  }

  updateSearch(payload) {
    this.searchElem && this.searchElem.updateView(payload);
  }

  updateCodeBlocks(payload) {
    this.codeBlocksElem && this.codeBlocksElem.updateView(payload);
  }

  dispose() {
    this.codeBlocksElem && this.wrapper.removeChild(this.codeBlocksElem);
    this.searchElem && this.wrapper.removeChild(this.searchElem);

    this.wrapper && this.wrapper.parentNode && this.wrapper.parentNode.removeChild(this.wrapper);
    this.wrapper = null;

    this.subscriptions && this.subscriptions.dispose();
    this.emitter && this.emitter.dispose();
    delete this.emitter;
    delete this.subscriptions;

    this.codeBlocksElem = null;
    this.searchElem = null;
  }
}

customElements.define('kite-ksg', KSG);
module.exports = KSG;