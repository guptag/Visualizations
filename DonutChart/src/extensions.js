(function () {

  //http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
  String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
      s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }

    return s;
  };

})();