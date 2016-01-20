'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;

var _App = require('./App');

var _State = require('./State');

var _State2 = _interopRequireDefault(_State);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var componentWithState = function componentWithState(component, state) {
  return Object.assign({}, component, {
    init: function init() {
      return state.toObject();
    }
  });
};

var componentToString = function componentToString(component) {
  var node = (0, _App.start)(component);

  if (node.outerHTML) {
    return node.outerHTML;
  } else {
    return node.toString();
  }
};

function render(component, update) {
  if (typeof update === 'function') {
    return new Promise(function (resolve) {
      var initialState = new _State2.default(component.init());

      update(initialState, function (newState) {
        var newComponent = componentWithState(component, newState);

        resolve(componentToString(newComponent));
      });
    });
  } else {
    return componentToString(component);
  }
}