var api = require('./neo4jApi');

$(function () {
  renderGraph();
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
});

function showGame(title) {
  api
    .getGame(title)
    .then(game => {
      if (!game) return;
      console.log(game);
      $("#title").text(game.name);
      $("#poster").attr("src", "http://thegamesdb.net/banners/" + game.boxFront);
      var $list = $("#crew").empty();
      $list.append($("<li>" + game.overview + "</li><li>Developed by "+ game.cast.developer.properties.name+"</li><li> Published by "+ game.cast.publisher.properties.name+"</li><li>Play on "+ game.cast.platfrom.properties.name+"</li>"));
    }, "json");
}

function search() {
  var query = $("#search").find("input[name=search]").val();
  api
    .searchGames(query)
    .then(games => {
      var t = $("table#results tbody").empty();

      if (games) {
        games.forEach(game => {
          $("<tr><td class='game'>" + game.name + "</td><td>" + game.relaeseDate + "</td><td>" + game.Genres + "</td></tr>").appendTo(t)
            .click(function() {
              showGame($(this).find("td.game").text());
            })
        });

        var first = games[0];
        if (first) {
          showGame(first.name);
        }
      }
    });
}

function renderGraph() {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
