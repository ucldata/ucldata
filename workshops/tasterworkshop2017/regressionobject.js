var RegressionObject = function (name, x, y, attributes) {
  /* Object handling regression.
  - name is the name of the object
  - x is the x values of the data
  - y are the outcomes of the data
  - attributes are the model attributes including type
  */

  if (!attributes) throw `
    Please add attributes for Regression Object

    {
      'type',
      'parameters': {
        'order' (for polynomial),
        'k' (for knn)
      }
    }
  `

  this.attr = attributes
  this.x = x
  this.y = y
  this.name = name
  this.varnames = {
    'x': 'x',
    'y': 'y'
  }

  if (attributes) {
    this.attr = attributes
  }
}

RegressionObject.prototype.fit = function () {
  // fits function, returning the fitted model and the variance
  var that = this

  if (this.attr.type === 'poly') {
    polynomial()
  } else if (this.attr.type === 'knn') {
    knn()
  } else if (this.attr.type === 'tree') {
    tree()
  }

  function polynomial () {
    var combined = []
    for (var i = 0; i < that.x.length; i++) {
      combined.push({'x': that.x[i], 'y': that.y[i]})
    }
    var fitted = new PolynomialRegression(combined, that.attr.parameters.order)

    that.fitted = {}
    that.fitted.model = fitted
    that.fitted.variance = 0

    that.fitted.variance = that.variance(that.predict(that.x), that.y)
  }

  function knn () {

  }

  function tree () {

  }
}

RegressionObject.prototype.predict = function (x) {
  // takes a list of values to predict, returns predictions
  var that = this
  var predictions = []

  if (this.attr.type === 'poly') {
    polynomial()
  } else if (this.attr.type === 'knn') {
    knn()
  } else if (this.attr.type === 'tree') {
    tree()
  }

  function polynomial (x) {
    x.forEach(function (datum) {
      predictions.push(that.fitted.model.predictY(that.fitted.model.getTerms(), datum))
    })
  }
  function knn (x) {

  }

  function tree (x) {

  }

  return predictions
}

RegressionObject.prototype.variance = function (ypred, ytrue) {
  var variance = 0

  if (ypred.length !== ytrue.length) {
    throw 'y predictions not same length as true y'
  }

  for (var i = 0; i < ypred.length; i++) {
    variance += Math.pow(ypred[i] - ytrue[i], 2) / ypred.length
  }
  return variance
}

RegressionObject.prototype.setVarNames = function (names) {
  // names has format {'x': xname, 'y': yname}
  this.varnames = names
}


d3.csv('housingdata.csv', function (data) {
  data = data.slice(0, 30)
  var y = []
  var x = []

  data.forEach(function (datum) {
    y.push(+datum.MEDV)
    x.push(+datum.RM)
  })

  var tempparams = {
    'type': 'knn',
    'parameters': {
      'k': 3
    }
  }

  var testreg = new RegressionObject('testreg', x, y, tempparams)
  testreg.fit()
})
