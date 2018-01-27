var _ = require('lodash');

function GameCast(title, overview, boxfront, platfrom, publisher, developer) {
  _.extend(this, {
    title: title,
    overview: overview,
    boxFront: boxfront,
    cast: {
        platfrom: platfrom,
        publisher: publisher,
        developer: developer
      }
  });
}

module.exports = GameCast;
