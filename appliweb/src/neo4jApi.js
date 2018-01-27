require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Game = require('./models/Game');
var GameCast = require('./models/GameCast');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://52.47.75.66", neo4j.auth.basic("neo4j", "toto"));

function searchGames(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (n:Game) \
      WHERE n.name =~ {title} \
      RETURN n',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Game(record.get('n'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGame(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (n:Game {name:{title}})-[:PLAY_ON]->(p:Platform),\
      (n:Game)-[:PUBLISHED_BY]->(q:Publisher),\
      (n:Game)-[:DEVELOPED_BY]->(r:Developer)\
      RETURN n.name AS title, n.Overview as overview, n.BoxFront as boxfront, p AS platform,q as publisher,r as developer", {title})
    .then(result => {
      session.close();

      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0];
      return new GameCast(record.get('title'), record.get('overview'), record.get('boxfront'), record.get('platform'), record.get('publisher'), record.get('developer'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGraph() {
  var session = driver.session();
  return session.run(
    'MATCH (n:Game)-[:PLAY_ON]->(p:Platform) \
    RETURN n.name AS game, collect(p.name) AS cast \
    LIMIT {limit}', {limit: 1000})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('game'), label: 'game'});
        var target = i;
        i++;

        res.get('cast').forEach(name => {
          var actor = {title: name, label: 'game'};
          var source = _.findIndex(nodes, actor);
          if (source == -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

exports.searchGames = searchGames;
exports.getGame = getGame;
exports.getGraph = getGraph;

