function __(_, __) {
  if (arguments.length == 2) {
    window.location = './' + _ + '.html?wf=wp' + __;
  } else {
    window.location = './'+ _ +'.html';
  }
};

(function () {

  function clicked (d) {
    var x, y, k;
    if (d && centered !== d) {
      let foo = 0;
      var mouse = d3.mouse(svg.node()).map(function (d) {
        return parseInt(d);
      });

      x = mouse[0], y = mouse[1], k = 4;
      centered = d;
    } else {
      x = width / 2, y = height / 2, k = 1;
      centered = null;
    }
    g.selectAll('path')
      .classed('active', centered && function(d) {
        return d === centered;
    });
    g.transition()
      .duration(750)
      .attr('transform',
        'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
      .style('stroke-width', 1.5 / k + 'px');
  };

  var width = 100, // percentage
    height = 0.8*$(window).height(), // 90% of screen height
    centered,
    wind_flag = false,
    farm_data;

  var projection = d3.geoMercator()
    .scale(1090)
    .center([10.0, 61.50]);
  var path = d3.geoPath()
    .projection(projection);

  var svg = d3.select('#mapView').append('svg')
    .attr('id', 'foo')
    .attr('width', width+'%')
    .attr('height', height);
  svg.append('rect')
    .attr('id', 'foo-rect')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .attr('width', width+'%')
    .attr('height', height)
    .on('click', clicked);
  var g = svg.append('g')
    .attr('id', 'foo-g');

  width = document.getElementById('foo-rect').getBBox().width;

  d3.json('https://yimingf.github.io/windmind-2017/data/world.json', function (error, data) {
    var tooltip = d3.select('body').append('div')
      .attr('class', 'hidden tooltip');
    countries = data.features;

    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', zoomed);
    projection
      .scale(1090)
      .center([10.0, 61.50]);
    g.append('g')
      .attr('id', 'countries')
      .selectAll('path')
      .data(countries).enter()
      .append('path')
      .attr('class', 'feature')
      .attr('d', path)
      .on('click', clicked)
      .call(zoom);

    var buttonImage = g.append('image')
      .attr('xlink:href', './lib/assets/img/wind-sign-stop.png')
      .attr('x', 30)
      .attr('y', 30)
      .attr('height', 50)
      .attr('width', 50)
      .on('click', function() {
        if (wind_flag) {
          g.selectAll('line')
            .style('stroke', 'blue');
          d3.select(this)
            .attr('xlink:href', './lib/assets/img/wind-sign-stop.png');
        } else {
          g.selectAll('line')
            .style('stroke', 'none');
          d3.select(this)
            .attr('xlink:href', './lib/assets/img/wind-sign.png');
        }
        wind_flag = !wind_flag;
      });

    function zoomed() {
      g.attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')scale(' + d3.event.transform.k + ')');
    }

    d3.json('https://yimingf.github.io/windmind-2017/data/farms.json', function (error, data) {
      farm_data = data;
      var len = 30;

      g.selectAll('image')
        .data(data.objects).enter()
        .append('image')
        .attr('xlink:href', './lib/assets/img/wind-windy.gif')
        .attr('x', function (d) {
          return (projection(d.location)[0]-len/2);
        })
        .attr('y', function (d) {
          return (projection(d.location)[1]-len);
        })
        .attr('height', len + 'px')
        .attr('width', len + 'px')
        .on('mousemove', function (d) {
          var mouse = d3.mouse(svg.node()).map(d => parseInt(d));
          tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 15) +
              'px; top:' + (mouse[1] - 35) + 'px')
            .html(function () {
              return 'Name: ' + d.name +'<br>Owner: ' + d.owner + (" <img src= " + d.countryImage + " height='16'>") +  '<br>Numberplate capacity: ' + d.capacity + '<br>Number of turbines: ' + d.turbines + '<br>Turbine capacity: ' + d.turbineCapacity + '<br>Status: ' + d.status;
            });
        })
        .on('mouseout', function () {
          tooltip.classed('hidden', true);
        })
        .on('click', function (d) {
          __('dashboard', d.farmOrder); // redirect to the dashboard.
      });
    });

    d3.json('https://yimingf.github.io/windmind-2017/data/gfs.json', function (error, data) {
      var _b = function (_, b) {
        let lo = _%360,
          la = 90-Math.floor(_/360);
        if ((lo<=b.e || lo>=b.w) && la<=b.n && la>=b.s) {
          return true;
        } else {
          return false;
        }
      };

      let ulb = projection.invert([0, 0]); // upper left bounc
      let brb = projection.invert([width, height]); // bottom right bound
      let b = {
        'w': Math.floor(ulb[0])+360, // allows negative number
        'n': Math.floor(ulb[1]),
        'e': Math.floor(brb[0]),
        's': Math.floor(brb[1])
      };
      console.log(b);

      let d_ = [], d__  = [];
      data[0].data.forEach(function (_, __) {
        if (_b(__, b)) {
          d_.push(_);
        }
      });
      console.log(d_);
      data[1].data.forEach(function (_, __) {
        if (_b(__, b)) {
          d__.push(_);
        }
      });
      console.log(d__);

      let ___ = 361+b.e-b.w;
      let lo = (_, __) => __%(___);
      let la = (_, __) => Math.floor(__/___);
      let _a = d3.scaleLinear()
        .domain([0, b.n-b.s]) // those latitudes
        .range([b.n, b.s]); // the latitude range

      var c = d_.map((_, __) => [_, d__[__]]); // extract data from gfs.json
      // use extractedData.
      var p_ = [
        d_.map(lo)
          .map(function (_) {
            if (_ <= b.e) {
              return _;
            } else {
              return b.w+_-b.e-1; // consider the boundary from west to east
            }
          }),
        d__.map(la)
          .map(_a)
        ];// map index to longitude and latitude

      p_ = p_[0].map((_, i) => [_, p_[1][i]]);
      p_ = p_.map(_ => projection(_));
      p_.forEach(function (_, __) {
        p_.push([
          _[0]+10,
          _[1]-10
        ]);
        c.push(c[__]);
        // p_.push([
        //   _[0]-10,
        //   _[1]+10
        // ]);
        // c.push(c[__]); // 3 bai ice-cream!! may be slow
      });

      np = c.map((_, __) => [
        6*_[0]+p_[__][0],
        6*_[1]+p_[__][1]
      ]);
      p_.forEach(function (_, __) {
        _.push(
          np[__][0],
          np[__][1]
        );
      });
      console.log(p_);

      var lines = g.selectAll('line')
        .data(p_).enter()
        .append('line');
      d3.interval(function () {
        lines.call(function animate (selection) {
          selection
            .attr('x1', _ => _[0])
            .attr('x2', _ => _[0])
            .attr('y1', _ => _[1])
            .attr('y2', _ => _[1])
            .style('opacity', 0.6)
            .style('stroke-width', '3') // initial width
            .transition()
              .ease(d3.easeLinear)
              .duration(4000)
              .attr('x2', _ => _[2])
              .attr('y2', _ => _[3])
              .style('stroke-width', '0.5') // 1st transformed width
              .style('opacity', 0.3)
            .transition()
              .ease(d3.easeLinear)
              .duration(2000)
              .attr('x1', _ => _[2])
              .attr('y1', _ => _[3])
              .style('opacity', 0) // 2nd transformed width
        });
      }, 6200);
    })
    
  });
})();