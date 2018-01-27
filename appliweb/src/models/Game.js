var _ = require('lodash');

function Game(_node) {
  _.extend(this, _node.properties);
}

module.exports = Game;
