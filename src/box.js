var createBox = function() {
  var divBox = document.createElement('div');
  divBox.className = 'box';

  var divMain = document.createElement('div');
  divMain.className = 'main';

  var divBar = document.createElement('div');
  divBar.className = 'bar';
  divBar.innerHTML = 'drag there';

  var canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 100;
  canvas.style = "border:1px solid #000000;"

  divBox.appendChild(divMain);
  divMain.appendChild(divBar);
  divMain.appendChild(canvas);

  document.getElementById('root').appendChild(divBox);
  startDrag(divBar, divBox);
};

var deleteBox = function() {
  var root = document.getElementById('root');
  if (root.hasChildNodes()) {
    root.removeChild(root.childNodes[0]);
  }
};