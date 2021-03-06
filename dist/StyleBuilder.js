/**
 * StyleBuilder. Breaks apart short hand properties (padding, margin, border, etc) into their
 * sub components.
 *
 * Currently react doesn't properly handle short hand properties: http://jsfiddle.net/ox3Lcmuy/
 *
 * If you start with
 *    { border: 1px solid red }
 * then add an active state with
 *    { borderColor: green }
 * you'll correctly see
 *    { border: 1px solid green }
 * but as soon as you remove that active border state and only define { border: 1px soild red} again
 * you'll be left with a black border because of the way React handles its style diffing.
 * See a more detailed explanation here:
 *
 * By always breaking up short hand components into their smaller parts we should be able to sidestep
 * this problem.
 *
 * TODO:
 *  background
 *  font
 *  transition
 *  transform
 *  list-style
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("underscore");

var _borderStyles = ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];
var _units = ["px", "em", "pt", "%"];

var StyleBuilder = (function () {
  function StyleBuilder() {
    _classCallCheck(this, StyleBuilder);
  }

  _createClass(StyleBuilder, [{
    key: "_explodeToFour",

    /*
     * Properly converts 4 part values (like padding and margin) into an
     * array, each index matching one of the 4 sub components.
     */
    value: function _explodeToFour(value) {
      var fourPartArray = [0, 1, 2, 3];
      var valueArray = value.split(" ");
      if (valueArray.length == 1) {
        fourPartArray = fourPartArray.map(function () {
          return valueArray[0];
        });
      } else if (valueArray.length == 2) {
        fourPartArray = fourPartArray.map(function (v, i) {
          return valueArray[i % 2];
        });
      } else if (valueArray.length == 3) {
        fourPartArray = fourPartArray.map(function (v, i) {
          return valueArray[i % 3 + Math.floor(i / 3)];
        });
      } else {
        fourPartArray = valueArray;
      }
      return fourPartArray;
    }

    /*
     * Takes in an array of length 4 with a prefix and suffix and converts
     * it to an object with Top, Right, Bottom, Left
     */
  }, {
    key: "_applyFour",
    value: function _applyFour(valueArr, prefix, suffix) {
      prefix = prefix || "";
      suffix = suffix || "";
      var styles = {};
      styles[prefix + "Top" + suffix] = valueArr[0];
      styles[prefix + "Right" + suffix] = valueArr[1];
      styles[prefix + "Bottom" + suffix] = valueArr[2];
      styles[prefix + "Left" + suffix] = valueArr[3];
      return styles;
    }

    /*
     * Takes in an array of length 4 with a prefix and suffix and converts
     * it to an object with TopLeft, TopRight, BottomRight, BottomLeft
     */
  }, {
    key: "_applyFourCorner",
    value: function _applyFourCorner(valueArr, prefix, suffix) {
      prefix = prefix || "";
      suffix = suffix || "";
      var styles = {};
      styles[prefix + "TopLeft" + suffix] = valueArr[0];
      styles[prefix + "TopRight" + suffix] = valueArr[1];
      styles[prefix + "BottomRight" + suffix] = valueArr[2];
      styles[prefix + "BottomLeft" + suffix] = valueArr[3];
      return styles;
    }

    /*
     * Adds px to any numbers that do not have an extension
     */
  }, {
    key: "applyPX",
    value: function applyPX(values) {
      return values.map(function (v) {
        if (_units.filter(function (u) {
          return v.indexOf(u) > -1;
        }).length === 0) {
          return v + "px";
        }
        return v;
      });
    }
  }, {
    key: "margin",
    value: function margin(value) {
      return this._applyFour(this._explodeToFour(value), "margin");
    }
  }, {
    key: "padding",
    value: function padding(value) {
      return this._applyFour(this._explodeToFour(value), "padding");
    }
  }, {
    key: "borderRadius",
    value: function borderRadius(value) {
      var _this = this;

      var partOne = this._explodeToFour(value.split("/")[0]);
      if (value.indexOf("/") > -1) {
        (function () {
          var partTwo = _this._explodeToFour(value.split("/")[1]);
          partOne = partOne.map(function (v, index) {
            return v + " " + partTwo[index];
          });
        })();
      }
      return this._applyFourCorner(partOne, "border", "Radius");
    }
  }, {
    key: "borderStyle",
    value: function borderStyle(value) {
      return this._applyFour(this._explodeToFour(value), "border", "Style");
    }
  }, {
    key: "borderColor",
    value: function borderColor(value) {
      return this._applyFour(this._explodeToFour(value), "border", "Color");
    }
  }, {
    key: "borderWidth",
    value: function borderWidth(value) {
      return this._applyFour(this._explodeToFour(value), "border", "Width");
    }
  }, {
    key: "borderSide",
    value: function borderSide(value, side) {
      var styles = {};
      if (_borderStyles.indexOf(value) > -1) {
        styles["border" + side + "Width"] = "initial";
        styles["border" + side + "Style"] = value;
        styles["border" + side + "Color"] = "initial";
        return styles;
      }
      var values = value.split(" ");
      if (values.length == 1) {
        styles["border" + side + "Width"] = values[0];
        styles["border" + side + "Style"] = "initial";
        styles["border" + side + "Color"] = "initial";
      }
      if (values[0]) {
        styles["border" + side + "Width"] = values[0];
      }
      if (values[1]) {
        styles["border" + side + "Style"] = values[1];
      }
      if (values[2]) {
        styles["border" + side + "Color"] = values[2];
      }
      return styles;
    }
  }, {
    key: "borderLeft",
    value: function borderLeft(value) {
      return this.borderSide(value, "Left");
    }
  }, {
    key: "borderRight",
    value: function borderRight(value) {
      return this.borderSide(value, "Right");
    }
  }, {
    key: "borderTop",
    value: function borderTop(value) {
      return this.borderSide(value, "Top");
    }
  }, {
    key: "borderBottom",
    value: function borderBottom(value) {
      return this.borderSide(value, "Bottom");
    }
  }, {
    key: "border",
    value: function border(value) {
      // TODO: Properly handle { border: <style> | <style> <color> }
      return _.extend({}, this.borderSide(value, "Left"), this.borderSide(value, "Right"), this.borderSide(value, "Top"), this.borderSide(value, "Bottom"));
    }
  }, {
    key: "build",
    value: function build(styles) {
      var _this2 = this;

      var newStyles = undefined;
      if (styles.length !== undefined) {
        newStyles = [];
      } else {
        newStyles = {};
      }

      /*
       * Loop through each key in the object, if array Object.keys returns
       * indexes.
       */
      Object.keys(styles).forEach(function (key) {
        var value = styles[key];
        var type = typeof value;

        if (type == "string") {
          if (_this2[key]) {
            _.extend(newStyles, _this2[key](value));
          } else {
            newStyles[key] = value;
          }
        } else if (type == "object" && value.length !== undefined) {
          newStyles[key] = value.map(function (v) {
            return _this2.build(v);
          });
        } else if (type == "object") {
          newStyles[key] = _this2.build(value);
        } else if (type == "function") {
          newStyles[key] = function () {
            return _this2.build(value.apply(undefined, arguments));
          };
        } else {
          newStyles[key] = value;
        }
      });

      return newStyles;
    }
  }]);

  return StyleBuilder;
})();

exports["default"] = new StyleBuilder();
module.exports = exports["default"];