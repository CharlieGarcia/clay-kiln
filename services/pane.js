var _ = require('lodash'),
  moment = require('moment'),
  dom = require('./dom'),
  ds = require('dollar-slice'),
  state = require('./page-state'),
  paneController = require('../controllers/pane'),
  publishPaneController = require('../controllers/publish-pane');

/**
 * create pane
 * @param {string} header
 * @param {Element|DocumentFragment} innerEl
 * @returns {Element}
 */
function createPane(header, innerEl) {
  var template = dom.find('.kiln-pane-template'),
    el = document.importNode(template.content, true);

  // add header and contents
  el.querySelector('.pane-header').innerHTML = header;
  el.querySelector('.pane-inner').appendChild(innerEl);

  return el;
}

/**
 * close an open pane
 */
function close() {
  var pane  = dom.find('.kiln-toolbar-pane-background');

  if (pane) {
    dom.removeElement(pane);
  }
}

/**
 * open a pane
 * @param {string} header will display at the top of the pane, html accepted
 * @param {Element} innerEl will display inside the pane
 * @returns {Element} pane
 */
function open(header, innerEl) {
  var toolbar = dom.find('.kiln-toolbar'),
    el = createPane(header, innerEl),
    pane;

  close(); // close any other panes before opening a new one
  dom.insertBefore(toolbar, el);
  pane = toolbar.previousElementSibling; // now grab a reference to the dom
  // init controller for pane background
  ds.controller('pane', paneController);
  ds.get('pane', pane);
  // trick browser into doing a repaint, to force the animation
  setTimeout(function () { dom.find(pane, '.kiln-toolbar-pane').classList.add('on'); }, 0);
  return pane;
}

/**
 * open publish pane
 * @returns {Promise}
 */
function openPublish() {
  var header = 'Schedule Publish',
    today = moment().format('YYYY-MM-DD'),
    now = moment().format('HH:mm'),
    actions = dom.create(`<div class="actions"></div>`),
    schedule = dom.create(`<form class="schedule">
      <input class="schedule-input" type="date" min="${today}" value="${today}"></input>
      <input class="schedule-input" type="time" value="${now}"></input>
      <button class="schedule-publish">Schedule Publish</button>
    </form>`),
    unschedule = dom.create(`<button class="unschedule">Unschedule</button>`),
    publishNow = dom.create(`<button class="publish-now">Publish Now</button>`),
    unpublish = dom.create(`<button class="unpublish">Unpublish</button>`),
    el;

  return state.get().then(function (res) {
    // todo: add publish state message
    // note: this needs save date, publish date, scheduled date?

    // these buttons are added in order
    actions.appendChild(schedule); // always exists
    if (res.scheduled) {
      state.toggleScheduled(true); // just in case someone else scheduled this page
      actions.appendChild(unschedule);
    }
    actions.appendChild(publishNow);
    if (res.published) {
      actions.appendChild(unpublish);
    }

    el = open(header, actions);
    // init controller for publish pane
    ds.controller('publish-pane', publishPaneController);
    ds.get('publish-pane', el.querySelector('.actions'));
  });
}

function addPreview(preview) {
  if (preview) {
    return `<span class="error-preview">${preview}</span>`;
  } else {
    return '';
  }
}

function addErrors(errors) {
  return _.reduce(errors, function (el, error) {
    var errorEl = dom.create(`
        <div class="publish-error">
          <span class="label">${error.rule.label}:</span>
          <span class="description">${error.rule.description}</span>
          <ul class="errors"></ul>
        </div>
      `),
      list = dom.find(errorEl, 'ul');

    // add each place where the error occurs
    _.each(error.errors, function (item) {
      var itemEl = dom.create(`<li><span class="error-label">${item.label}</span>${addPreview(item.preview)}</li>`);

      list.appendChild(itemEl);
    });

    el.appendChild(errorEl);
    return el;
  }, document.createDocumentFragment());
}

/**
 * open validation error pane
 * @param {Object[]} errors
 * @param {object} errors[].rule
 * @param {string} errors[].rule.label e.g. 'Required'
 * @param {string} errors[].rule.description e.g. 'Required fields cannot be blank'
 * @param {Object[]} errors[].errors
 * @param {string} errors[].errors[].label e.g. 'Article > Header'
 * @param {string} [errors[].errors[].preview] e.g. 'text in a paragraph TK more text...'
 */
function openValidationErrors(errors) {
  var header = 'Before you can publish&hellip;',
    messageEl = dom.create(`
      <div class="error-message">This page is missing things needed to publish.<br />Address the following and try publishing again.</div>
    `),
    errorsEl = addErrors(errors),
    innerEl = document.createDocumentFragment();

  innerEl.appendChild(messageEl);
  innerEl.appendChild(errorsEl);

  open(header, innerEl);
}

module.exports.close = close;
module.exports.open = open;
module.exports.openPublish = openPublish;
module.exports.openValidationErrors = openValidationErrors;