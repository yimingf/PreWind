/*
  modified version of windy.js.
  src: https://esri.github.io/wind-js/windy.js
*/

/*  Global class for simulating the movement of particle through a 1km wind grid

  credit: All the credit for this work goes to: https://github.com/cambecc for creating the repo:
    https://github.com/cambecc/earth. The majority of this code is directly take nfrom there, since its awesome.

  This class takes a canvas element and an array of data (1km GFS from http://www.emc.ncep.noaa.gov/index.php?branch=GFS)
  and then uses a mercator (forward/reverse) projection to correctly map wind vectors in "map space".

  The "start" method takes the bounds of the map at its current extent and starts the whole gridding,
  interpolation and animation process.
*/

var Windy = function( params ){
  var VELOCITY_SCALE = 0.011;             // scale for wind velocity (completely arbitrary--this value looks nice)
  var INTENSITY_SCALE_STEP = 10;            // step size of particle intensity color scale
  var MAX_WIND_INTENSITY = 40;              // wind velocity at which particle intensity is maximum (m/s)
  var MAX_PARTICLE_AGE = 100;                // max number of frames a particle is drawn before regeneration
  var PARTICLE_LINE_WIDTH = 0.8;              // line width of a drawn particle
  var PARTICLE_MULTIPLIER = 1/30;              // particle count scalar (completely arbitrary--this values looks nice)
  var PARTICLE_REDUCTION = 0.75;            // reduce particle count to this much of normal for mobile devices
  var FRAME_RATE = 20;                      // desired milliseconds per frame
  var BOUNDARY = 0.45;

  var PARTICLE_LIFE = 1000/FRAME_RATE+5; // how long will a line live until removed

  var NULL_WIND_VECTOR = [NaN, NaN, null];  // singleton for no wind in the form: [u, v, magnitude]
  var TRANSPARENT_BLACK = [255, 0, 0, 0];

  var τ = 2 * Math.PI;
  var H = Math.pow(10, -5.2);

  // interpolation for vectors like wind (u,v,m)
  var bilinearInterpolateVector = function(x, y, g00, g10, g01, g11) {
    var rx = (1 - x);
    var ry = (1 - y);
    var a = rx * ry,  b = x * ry,  c = rx * y,  d = x * y;
    var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
    var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
    return [u, v, Math.sqrt(u * u + v * v)];
  };


  var createWindBuilder = function(uComp, vComp) {
    var uData = uComp.data, vData = vComp.data;
    return {
      header: uComp.header,
      //recipe: recipeFor("wind-" + uComp.header.surface1Value),
      data: function(i) {
        return [uData[i], vData[i]];
      },
      interpolate: bilinearInterpolateVector
    }
  };

  var createBuilder = function(data) {
    var uComp = null, vComp = null, scalar = null;

    data.forEach(function(record) {
      switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
        case "2,2": uComp = record; break;
        case "2,3": vComp = record; break;
        default:
        scalar = record;
      }
    });

    return createWindBuilder(uComp, vComp);
  };

  var buildGrid = function(data, callback) {
    var builder = createBuilder(data);

    var header = builder.header;
    var λ0 = header.lo1, φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
    var Δλ = header.dx, Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    var ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
    var date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);

    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    var grid = [], p = 0;
    var isContinuous = Math.floor(ni * Δλ) >= 360;
    for (var j = 0; j < nj; j++) {
      var row = [];
      for (var i = 0; i < ni; i++, p++) {
        row[i] = builder.data(p);
      }
      if (isContinuous) {
        // For wrapped grids, duplicate first column as last column to simplify interpolation logic
        row.push(row[0]);
      }
      grid[j] = row;
    }

    function interpolate(λ, φ) {
      var i = floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
      var j = (φ0 - φ) / Δφ;                 // calculate latitude index in direction +90 to -90

      var fi = Math.floor(i), ci = fi + 1;
      var fj = Math.floor(j), cj = fj + 1;

      var row;
      if ((row = grid[fj])) {
        var g00 = row[fi];
        var g10 = row[ci];
        if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
          var g01 = row[fi];
          var g11 = row[ci];
          if (isValue(g01) && isValue(g11)) {
            // All four points found, so interpolate the value.
            return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
          }
        }
      }
      return null;
    }
    callback( {
      date: date,
      interpolate: interpolate
    });
  };



  /**
   * @returns {Boolean} true if the specified value is not null and not undefined.
   */
  var isValue = function(x) {
    return x !== null && x !== undefined;
  }

  /**
   * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
   *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
   */
  var floorMod = function(a, n) {
    return a - n * Math.floor(a / n);
  }

  /**
   * @returns {Number} the value x clamped to the range [low, high].
   */
  var clamp = function(x, range) {
    return Math.max(range[0], Math.min(x, range[1]));
  }

  /**
   * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
   */
  var isMobile = function() {
    return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i).test(navigator.userAgent);
  }

  /**
   * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
   * vector is modified in place and returned by this function.
   */
  var distort = function(projection, λ, φ, x, y, scale, wind, windy) {
    var u = wind[0] * scale;
    var v = wind[1] * scale;
    var d = distortion(projection, λ, φ, x, y, windy);

    // Scale distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;
    return wind;
  };

  var distortion = function(projection, λ, φ, x, y, windy) {
    var τ = 2 * Math.PI;
    var H = Math.pow(10, -5.2);
    var hλ = λ < 0 ? H : -H;
    var hφ = φ < 0 ? H : -H;

    var pλ = project(φ, λ + hλ,windy);
    var pφ = project(φ + hφ, λ, windy);

    // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
    // changes depending on φ. Without this, there is a pinching effect at the poles.
    var k = Math.cos(φ / 360 * τ);
    return [
      (pλ[0] - x) / hλ / k,
      (pλ[1] - y) / hλ / k,
      (pφ[0] - x) / hφ,
      (pφ[1] - y) / hφ
    ];
  };



  var createField = function(columns, bounds, callback) {

    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
     *          is undefined at that point.
     */
    function field(x, y) {
      var column = columns[Math.round(x)];
      return column && column[Math.round(y)] || NULL_WIND_VECTOR;
    }

    // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
    // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
    field.release = function() {
      columns = [];
    };

    field.randomize = function(o) {  // UNDONE: this method is terrible
      var x, y;
      var safetyNet = 0;
      do {
        x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
        y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
      } while (field(x, y)[2] === null && safetyNet++ < 30);
      o.x = x;
      o.y = y;
      return o;
    };

    //field.overlay = mask.imageData;
    //return field;
    callback( bounds, field );
  };

  var buildBounds = function( bounds, width, height ) {
    var upperLeft = bounds[0];
    var lowerRight = bounds[1];
    var x = Math.round(upperLeft[0]); //Math.max(Math.floor(upperLeft[0], 0), 0);
    var y = Math.max(Math.floor(upperLeft[1], 0), 0);
    var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
    var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
    return {x: x, y: y, xMax: width, yMax: yMax, width: width, height: height};
  };

  var deg2rad = function( deg ){
    return (deg / 180) * Math.PI;
  };

  var rad2deg = function( ang ){
    return ang / (Math.PI/180.0);
  };

  var invert = function(x, y, windy){
    var mapLonDelta = windy.east - windy.west;
    var worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360/(2 * Math.PI);
    var mapOffsetY = ( worldMapRadius / 2 * Math.log( (1 + Math.sin(windy.south) ) / (1 - Math.sin(windy.south))  ));
    var equatorY = windy.height + mapOffsetY;
    var a = (equatorY-y)/worldMapRadius;

    var lat = 180/Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI/2);
    var lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
    return [lon, lat];
  };

  var mercY = function( lat ) {
    return Math.log( Math.tan( lat / 2 + Math.PI / 4 ) );
  };


  var project = function( lat, lon, windy) { // both in radians, use deg2rad if neccessary
    var ymin = mercY(windy.south);
    var ymax = mercY(windy.north);
    var xFactor = windy.width / ( windy.east - windy.west );
    var yFactor = windy.height / ( ymax - ymin );

    var y = mercY( deg2rad(lat) );
    var x = (deg2rad(lon) - windy.west) * xFactor;
    var y = (ymax - y) * yFactor; // y points south
    return [x, y];
  };


  var interpolateField = function( grid, bounds, extent, callback ) {
    var projection = {};
    var velocityScale = VELOCITY_SCALE;

    var columns = [];
    var x = bounds.x;

    function interpolateColumn(x) {
      var column = [];
      for (var y = bounds.y; y <= bounds.yMax; y += 2) {
          var coord = invert( x, y, extent );
          if (coord) {
            var λ = coord[0], φ = coord[1];
            if (isFinite(λ)) {
              var wind = grid.interpolate(λ, φ);
              if (wind) {
                wind = distort(projection, λ, φ, x, y, velocityScale, wind, extent);
                column[y+1] = column[y] = wind;

              }
            }
          }
      }
      columns[x+1] = columns[x] = column;
    }

    (function batchInterpolate() {
          var start = Date.now();
          while (x < bounds.width) {
            interpolateColumn(x);
            x += 2;
            if ((Date.now() - start) > 1000) { //MAX_TASK_TIME) {
              setTimeout(batchInterpolate, 25);
              return;
            }
          }
        createField(columns, bounds, callback);
    })();
  };


  var animate = function(bounds, field) {

    function windIntensityColorScale(step, maxWind) {
      result = ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"];
      result.indexFor = function(m) {  // map wind speed to a style
        return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
      };
      return result;
    }

    var colorStyles = windIntensityColorScale(INTENSITY_SCALE_STEP, MAX_WIND_INTENSITY);
    var buckets = colorStyles.map(function() { return []; });

    var particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER);
    if (isMobile()) {
      particleCount *= PARTICLE_REDUCTION;
    }

    var fadeFillStyle = "rgba(0, 0, 0, 0.97)";

    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push(field.randomize({age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0}));
    }

    function evolve() {
      buckets.forEach(function(bucket) { bucket.length = 0; });
      particles.forEach(function (particle) {
        if (particle.age > MAX_PARTICLE_AGE) {
          field.randomize(particle).age = 0;
        }
        var x = particle.x;
        var y = particle.y;
        var v = field(x, y);  // vector at current position
        var m = v[2];
        if (m === null) {
          particle.age = MAX_PARTICLE_AGE;  // particle has escaped the grid, never to return...
        } else {
          var xt = x + v[0];
          var yt = y + v[1];
          if (field(xt, yt)[2] !== null) {
            // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
            particle.xt = xt;
            particle.yt = yt;
            buckets[colorStyles.indexFor(m)].push(particle);
          }
           else {
            // Particle isn't visible, but it still moves through the field.
            particle.x = xt;
            particle.y = yt;
          }
        }
        particle.age += 1;
      });
      //console.log(buckets);
    }

    function draw() {
      // Fade existing particle trails.
      // d3 version of the drawing function.
      var prev = "lighter";
      var g = d3.select('#foo-g');

      buckets.forEach(function(bucket, i) {
        if (bucket.length > 0) {
          let color = colorStyles[i];
          // console.log(color);
          // console.log(bucket);

          g.selectAll('line')
            .data(bucket).enter()
            .append('line')
            .attr('x1', d => d.x)
            .attr('y1', d => d.y)
            .attr('x2', d => d.xt)
            .attr('y2', d => d.yt)
            .style('opacity', 0.85)
            .style('stroke', color)
            .style('stroke-width', PARTICLE_LINE_WIDTH)
            .transition()
              .style('opacity', 0)
              .duration(PARTICLE_LIFE)
            .remove();
        }
      });
    }

    (function frame() {
      try {
        windy.timer = setTimeout(function() {
          requestAnimationFrame(frame);
          evolve();
          draw();
        }, 1000 / FRAME_RATE);
      }
      catch (e) {
        console.error(e);
      }
    })();
  }

  var start = function (bounds, width, height, extent){
    var mapBounds = {
      south: deg2rad(extent[0][1]),
      north: deg2rad(extent[1][1]),
      east: deg2rad(extent[1][0]),
      west: deg2rad(extent[0][0]),
      width: width,
      height: height
    };

    stop();

    // build grid
    buildGrid( params.data, function(grid) {
      // interpolateField
      interpolateField(
        grid,
        buildBounds(bounds, width, height),
        mapBounds,
        function (bounds, field) {
        // animate the canvas with random points
          windy.field = field;
          animate( bounds, field );
      });

    });
  };

  var stop = function(){
    if (windy.field) windy.field.release();
    if (windy.timer) clearTimeout(windy.timer);
  };

  var windy = {
    params: params,
    start: start,
    stop: stop
  };

  return windy;
}



// shim layer with setTimeout fallback
window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
    window.setTimeout(callback, 1000 / 20);
    };
})();