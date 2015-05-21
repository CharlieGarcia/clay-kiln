'use strict';
var _ = require('lodash'),
  references = require('./references'),
  edit = require('./edit'),
  label = require('./label'),
  dom = require('./dom'),
  getExpandedBehaviors = require('./behaviors').getExpandedBehaviors;

/**
 * get placeholder text
 * if placeholder has a string, use it
 * else call the label service
 * @param  {string} name     
 * @param  {{}} partials 
 * @return {string}          
 */
function getPlaceholderText(name, partials) {
  var fieldSchema = partials.schema,
    possiblePlaceholderText = fieldSchema[references.placeholderProperty];

  if (typeof possiblePlaceholderText === 'string' && possiblePlaceholderText !== 'true') {
    return possiblePlaceholderText;
  } else {
    return label(name, fieldSchema);
  }
}

/**
 * get placeholder height based on the behaviors in a field
 * @param  {string} behaviors
 * @return {string}
 */
function getPlaceholderHeight(behaviors) {
  // expand the behaviors into an array of objects
  var expanded = getExpandedBehaviors(behaviors);

  return _.reduce(expanded, function (height, behavior) {
    if (height === 'auto') {
      switch (behavior[references.behaviorKey]) {
        case 'vertical-list': return '600px';
        case 'component': return '300px';
        default: return 'auto';
      }
    } else {
      return height;
    }
  }, 'auto');
}

function isFieldEmpty(data) {
  // note: 0, false, etc are valid bits of data for numbers, booleans, etc so they shouldn't be masked
  return data === undefined || data === null || data === '' || (Array.isArray(data) && !data.length);
}

/**
 * create dom element for the placeholder, add it to the specified node
 * @param {NodeElement} node
 * @param {{ height: string, text: string }} obj
 */
function addPlaceholderDom(node, obj) {
  var placeholder = dom.create(`
    <div class="editor-placeholder" style="height: ${obj.height};">
      <span class="placeholder-label">${obj.text}</span>
    </div>
  `);
  node.appendChild(placeholder);
  return node;
}

/**
 * generate and add placeholder, if configured
 * placeholder should be shown if:
 * - name is a field and field is blank
 * @param {string} ref
 * @param {NodeElement} node
 */
function addPlaceholder(ref, node) {
  var name = node.getAttribute('name');

  return edit.getSchemaAndData(ref, name).then(function (partials) {
    var hasPlaceholder = partials.schema[references.placeholderProperty],
      isField = partials.schema[references.fieldProperty];

    if (hasPlaceholder && isField && isFieldEmpty(partials.data)) {
      return addPlaceholderDom(node, {
        text: getPlaceholderText(name, partials),
        height: getPlaceholderHeight(partials.schema[references.fieldProperty])
      });
    } else {
      return node;
    }
  });
}

module.exports = addPlaceholder;

// exported for testing
module.exports.getPlaceholderText = getPlaceholderText;
module.exports.getPlaceholderHeight = getPlaceholderHeight;
module.exports.isFieldEmpty = isFieldEmpty;