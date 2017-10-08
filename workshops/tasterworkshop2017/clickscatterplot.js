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

  this.regressions = []
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
  var that = this
  this.svg = this.canvas
    .append('svg')
      .attr('width', this.attr.width)
      .attr('height', this.attr.height)
      .attr('display', 'block')
      .attr('margin', 'auto')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .on('click', function () {
        var datum = {'x': d3.mouse(this)[0], 'y': d3.mouse(this)[1]}
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

  if (this.regressions.length > 0) {
    that.regressions.forEach(function (reginfo) {
      var ss = 0
      that.data.forEach(function (datum) {
        ss += Math.pow(datum.y - reginfo.reg.predictY(reginfo.reg.getTerms(), datum.x), 2)
      })
      $(`#currss${reginfo.name}`).html(ss / that.data.length)
    })
  }
}

// ClickScatterPlot.prototype.drawPolynomialFit = function (order, name) {
//   if ($(`#line${name}`).length > 0) {
//     return
//   }
//
//   var that = this
//
//   var newreg = new PolynomialRegression(this.data, order)
//   this.regressions.push({'name': name, 'reg': newreg})
//
//   // calculate some points for the line to be plotted
//   var linepoints = []
//   var lineGran = 100
//   var xstep = (this.attr.width * (1 - this.attr.marginLeft - this.attr.marginRight)) / lineGran
//   for (var i = 1; i < lineGran; i++) {
//     var x = xstep * i
//     var y = newreg.predictY(newreg.getTerms(), x + this.attr.marginLeft * this.attr.width) - this.attr.marginTop * this.attr.height
//
//     linepoints.push({'x': x, 'y': y})
//   }
//
//   var ss = 0
//   this.data.forEach(function (datum) {
//     ss += Math.pow(datum.y - newreg.predictY(newreg.getTerms(), datum.x), 2)
//   })
//
//   if (this.data.length > 0) {
//     $('#sslist').append(
//       `<tr id="row${name}">
//         <td>${this.color}</td>
//         <td>${order}</td>
//         <td>${ss / this.data.length}</td>
//         <td id="currss${name}">${ss / this.data.length}</td>
//         <td><button id="delete${name}" target-id="${name}" class="delete btn btn-primary">Delete</button></td>
//       <tr>`
//     )
//   }
//
//   $(`#delete${name}`).on('click', function () {
//     $(`#row${$(this).attr('target-id')}`).remove()
//     $(`#line${$(this).attr('target-id')}`).remove()
//   })
//
//   var line = d3.svg.line()
//     .interpolate('basis')
//     .x(function (d) { return d.x })
//     .y(function (d) { return d.y })
//
//   this.svg.append('path')
//     .datum(linepoints)
//     .attr('id', 'line' + name)
//     .attr('class', 'bestfit')
//     .attr('d', line)
//     .attr('color', that.color)
//     .attr('stroke', that.color)
// }
//
// ClickScatterPlot.prototype.drawKNNFit = function (order, name) {
//
// }
