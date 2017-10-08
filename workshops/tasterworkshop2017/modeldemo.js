/* Plotting code */
/* ############################################################## */

var ClickScatterPlot = function (diagramName) {
  this.attr = {
    'width': 600,
    'height': 600
  }
  this.dotAttr = {
    'radius': 3
  }
  this.color = 'blue'

  this.attr.marginLeft = 0.1
  this.attr.marginRight = 0.1
  this.attr.marginBottom = 0.1
  this.attr.marginTop = 0.02

  this.vars = {
    'x': 'x',
    'y': 'y'
  }

  this.data = []
  this.dataArrays = []

  this.setVars(this.vars)

  this.classifiers = []
}

ClickScatterPlot.prototype.setAttr = function (attr) {
  'Takes object in format {attr:lsjkd, value:lskdfj}'
  this.attr[attr['attr']] = attr['value']
}

ClickScatterPlot.prototype.setVars = function (vars) {
  'Set the variable names of the data'
  this.vars.x = vars.x
  this.vars.y = vars.y
}

ClickScatterPlot.prototype.setCanvas = function (canvasName) {
  this.canvas = d3.select(`#${canvasName}`)
  this.canvas.html('')
  this.canvasID = `#${canvasName}`
}

ClickScatterPlot.prototype.createSVG = function () {
  var that = this;
  this.svg = this.canvas
    .append('svg')
      .attr('width', this.attr.width)
      .attr('height', this.attr.height)
      .attr('display', 'block')
      .attr('margin', 'auto')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .on('click', function () {
        var datum = {'x': d3.mouse(this)[0], 'y': d3.mouse(this)[1], 'class': that.color}
        that.drawPoint(datum)
        that.addData(datum)
      })
    .append('g')
      .attr('transform', `translate(${this.attr.marginLeft * this.attr.width},${this.attr.marginTop * this.attr.height})`)
}

ClickScatterPlot.prototype.setData = function (data) {
  'Takes array of points to plot on the graph'
  this.data = data
}

ClickScatterPlot.prototype.addData = function (data) {
  'adds a single data point'
  this.data.push(data)
  this.dataArrays.push([data.x, data.y])
}

ClickScatterPlot.prototype.plotAxis = function () {
  this.svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${this.attr.height * (1 - this.attr.marginTop - this.attr.marginBottom)})`)
    .call(this.xAxis)
  .append('text')
      .attr('class', 'label')
      .attr('x', this.attr.width * (1 - this.attr.marginTop - this.attr.marginBottom))
      .attr('y', -6)
      .style('text-anchor', 'end')
      .text(this.vars.x)

  this.svg.append('g')
    .attr('class', 'y axis')
    .call(this.yAxis)
  .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text(this.vars.y)
}

ClickScatterPlot.prototype.render = function () {
  var that = this

  this.xScale = d3.scale.linear().range([0, (1 - that.attr.marginLeft - that.attr.marginRight) * that.attr.width])
  this.xAxis = d3.svg.axis().scale(that.xScale).orient('bottom').tickFormat(d3.format('d'))

  this.yScale = d3.scale.linear().range([0, (1 - that.attr.marginBottom - that.attr.marginTop) * that.attr.height])
  this.yAxis = d3.svg.axis().scale(that.yScale).orient('left').tickFormat(d3.format('d'))

  this.plotAxis()
}

ClickScatterPlot.prototype.changeColor = function (color) {
  this.color = color
}

ClickScatterPlot.prototype.drawPoint = function (point) {
  var that = this
  this.svg
    .append('circle')
    .attr('class', 'dot')
    .attr('fill', that.color)
    .attr('r', that.dotAttr.radius)
    .attr('cx', point.x - this.attr.width * this.attr.marginRight)
    .attr('cy', point.y - this.attr.height * this.attr.marginTop)
}

ClickScatterPlot.prototype.drawKNNFit = function (k, name) {
  console.log("plot")
  var that = this

  this.classification = new KNN(this.data, order, classCount)

  // console.log('class', this.classification)
  //
  // function locationInSquare (depth, xcount, ycount) {
  //   var x = that.attr.width / Math.pow(2, depth) * (xcount + 0.5)
  //   var y = that.attr.width / Math.pow(2, depth) * (ycount + 0.5)
  //
  //   return {'x': x, 'y': y}
  // }
  //
  // //    x1 x2
  // // y1  a  b ==> [[a,b],[c,d]]
  // // y2  c  d
  //
  // // [[a,b],[c,d]][[a,b],[c,d]]
  // var depthlimit = 3
  // function colorRec (topLeft, depth, array) {
  //
  // }
  var xstep = 5
  var ystep = 100

  $('.shading').remove()

  for (var xloc = 0; xloc < this.attr.width * (1 - this.attr.marginLeft - this.attr.marginRight) / xstep; xloc++) {
    for (var yloc = 0; yloc < this.attr.height * (1 - this.attr.marginTop - this.attr.marginBottom)/ ystep; yloc++) {
      this.svg.append('rect')
        .attr('class', 'shading')
        .attr('x', xloc * xstep)
        .attr('y', yloc * ystep)
        .attr('width', xstep)
        .attr('height', ystep)
        .attr('fill', this.classification.predict({'x': xloc * xstep, 'y': yloc * ystep}))
        .attr('opacity', 0.2)
    }
  }
}

var KNN = function (data, k, classes) {
  this.data = data
  this.k = k
  this.classes = classes

  function l2_distance(p1, p2) {
    var dx = p1.x - p2.x
    var dy = p1.y - p2.y

    return Math.sqrt(dx * dx + dy * dy)
  }

  this._findNeighbors = function (point) {
    // finds the nearest k neighbors of the point
    var distances = []
    this.data.forEach(function (datum) {
      distances.push({'point': datum, 'distance': l2_distance(point, datum)})
    })
    distances.sort(function (a, b) { return a.distance - b.distance })
    var neighbors = []
    for (var i = 0; i < k && i < distances.length; i++) {
      neighbors.push(distances[i].point)
    }
    return neighbors
  }

  this._majorityVote = function (points) {
    var votes = {}
    points.forEach(function (point) {
      if (!votes[point.class]) {
        votes[point.class] = 1
      } else {
        votes[point.class]++
      }
    })

    var maxVotes = 0
    var winner = null
    for (var property in votes) {
      if (votes.hasOwnProperty(property)) {
        if (votes[property] === maxVotes) {
          winner = null
        } else if (votes[property] > maxVotes) {
          maxVotes = votes[property]
          winner = property
        }
      }
    }
    return winner
  }
}

KNN.prototype.predict = function (val) {
  var neighbors = this._findNeighbors(val)
  return this._majorityVote(neighbors)
}

var dataNames = {'x': 'Weight', 'y': 'Price'}

var canvasWidth = $('#canvas').width()
var canvasHeight = $(window).height()*0.8

if (canvasHeight > canvasWidth) {
  canvasHeight = canvasWidth
}

var myplot = new ClickScatterPlot('myplot')
myplot.setAttr({'attr': 'width', 'value': canvasWidth})
myplot.setAttr({'attr': 'height', 'value': canvasHeight})
myplot.setCanvas('canvas')
myplot.createSVG()
myplot.setVars(dataNames)
myplot.render()

var order = 3
var classCount = 0
var classes = []

$('#increaseorder').on('click', function () {
  order++
  $('#orderdisplay').html(order)
})
$('#decreaseorder').on('click', function () {
  order--
  $('#orderdisplay').html(order)
})

$('#plotbestfit').on('click', function () {
  myplot.drawKNNFit(order, `lbf${order}${myplot.color}`)
})

$('.color').on('click', function () {
  classCount++
  $('.color').removeClass('active')
  $(this).addClass('active')
  myplot.changeColor($(this).attr('data-color'))

  if (classes.indexOf($(this).attr('data-color')) === -1) {
    classCount++
    classes.push($(this).attr('data-color'))
  }
})


// Patrick Leask 2017
