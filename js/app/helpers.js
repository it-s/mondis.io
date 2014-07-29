YUI.add('md-helpers', function (Y) {
  'use strict';
  
  Y.namespace('MONDIS');

  /* Date/Time format functions by 
  Got these from http://weblog.west-wind.com/posts/2008/Mar/18/A-simple-formatDate-function-for-JavaScript
  Need to find a better way to do this
  */
  Array.prototype.clean = function () {
    var arr = this;
    for(var i = 0; i < arr.length; i++) {
      if(arr[i] === null || arr[i] === undefined || arr[i] === "") arr.splice(i, 1);
    }
    return arr;
  }

  String.prototype.clean = function () {
    return this.replace(/[^a-zA-Z-]/g, '');
  }
  String.prototype.toRoute = function () {
    return this.split('/').clean();
  }
  String.repeat = function (chr, count) {
    var str = "";
    for (var x = 0; x < count; x++) {
      str += chr
    };
    return str;
  }
  String.prototype.padL = function (width, pad) {
    if (!width || width < 1)
      return this;

    if (!pad) pad = " ";
    var length = width - this.length
    if (length < 1) return this.substr(0, width);

    return (String.repeat(pad, length) + this).substr(0, width);
  }
  String.prototype.padR = function (width, pad) {
    if (!width || width < 1)
      return this;

    if (!pad) pad = " ";
    var length = width - this.length
    if (length < 1) this.substr(0, width);

    return (this + String.repeat(pad, length)).substr(0, width);
  }
  String.format = function (frmt, args) {
    for (var x = 0; x < arguments.length; x++) {
      frmt = frmt.replace("{" + x + "}", arguments[x + 1]);
    }
    return frmt;
  }

  Date.prototype.formatDate = function (format) {
    var date = this;
    if (!format)
      format = "MM/dd/yyyy";

    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    format = format.replace("MM", month.toString().padL(2, "0"));

    if (format.indexOf("yyyy") > -1)
      format = format.replace("yyyy", year.toString());
    else if (format.indexOf("yy") > -1)
      format = format.replace("yy", year.toString().substr(2, 2));

    format = format.replace("dd", date.getDate().toString().padL(2, "0"));

    var hours = date.getHours();
    if (format.indexOf("t") > -1) {
      if (hours > 11)
        format = format.replace("t", "pm")
      else
        format = format.replace("t", "am")
    }
    if (format.indexOf("TT") > -1) {
      if (hours > 11)
        format = format.replace("TT", "PM")
      else
        format = format.replace("TT", "AM")
    }
    if (format.indexOf("HH") > -1)
      format = format.replace("HH", hours.toString().padL(2, "0"));
    if (format.indexOf("hh") > -1) {
      if (hours > 12) hours - 12;
      if (hours == 0) hours = 12;
      format = format.replace("hh", hours.toString().padL(2, "0"));
    }
    if (format.indexOf("h") > -1)
      format = format.replace("h", hours.toString());
    if (format.indexOf("mm") > -1)
      format = format.replace("mm", date.getMinutes().toString().padL(2, "0"));
    if (format.indexOf("ss") > -1)
      format = format.replace("ss", date.getSeconds().toString().padL(2, "0"));
    return format;
  }


  //END-----------

  var Helpers = {};

  Helpers.toNumber = function (str) {
    return Y.Lang.isString(str) ? str.replace(/\D/g, '') : str;
  }

  Helpers.DateUTC = function (d) {
    var now = Y.Lang.isString(d) ? new Date(d) : (Y.Lang.isDate(d) ? d : new Date());
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  }

  Helpers.DaysBetween = function (date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)

    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY)

  }

  //Simple slugify function
  Helpers.Slugify = function (str) {
    var slug = str.replace(/[^\w\s-]/g, '').toLowerCase().trim().replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-');
    if (slug.charAt(0) === '-')
      slug = slug.substr(1);
    return slug;
  }

  Helpers.Find = function (heystack, niddle) {

  }

  Helpers.Contains = function (heystack, niddles) {
    if (!Y.Lang.isArray(heystack)) return false;
    niddles = Y.Lang.isArray(niddles) ? niddles : [niddles];
    var result = false;
    for (var i = 0; i < niddles.length; i++) {
      if (Y.Array.indexOf(heystack, niddles[i]) < 0)
        result = false;
      else
        result = true;
    }
    return result;
  }

  Helpers.Timezone = function (date, timezone) {
    if (Y.Lang.isUndefined(date) || Y.Lang.isNull(date) || date === "") return date;
    date = Y.Lang.isString(date) ? new Date(date) : date;
    if (Y.Lang.isUndefined(timezone) || Y.Lang.isNull(timezone) || timezone === "" || timezone === "0") return date;
    var offset = Helpers.toNumber(timezone) * 3600000;
    var result = date.getTime();
    if (timezone.indexOf("-") < 0)
      result += offset;
    else
      result -= offset;

    return new Date(result);
  }

  Helpers.DateToSimpleString = function (date, timezone) {
    if (Y.Lang.isUndefined(date) || Y.Lang.isNull(date) || !Y.Lang.isDate(date)) return date;
    var dict = {
      today: "h:MM TT",
      yesterday: "Yesterday at h:MM TT",
      recent: "dddd at h:MM TT",
      old: "mmmm d, yy at h:MM TT"
    };
    var today = this.Timezone(new Date(), timezone),
      days = this.DaysBetween(today, date);
    if (days === 0) return date.formatDate(dict.today);
    if (days === 1) return date.formatDate(dict.yesterday);
    if (days <= 90) return date.formatDate(dict.recent);
    if (days > 90) return date.formatDate(dict.old);
    return "";
  }

  Helpers.Gravatar = function (email) {
    var baseURL = 'http://www.gravatar.com/avatar/';
    return baseURL + Y.Crypto.MD5(email);
  }

  Helpers.Typefy = function (type, ns) {
    ns = ns || 'type';
    return 'sys-' + ns + '-' + type;
  }
  
  //System Helpers
  Helpers.App = function(name, value) {
    if(typeof(name) == "undefined" && typeof(value) === "undefined")
      return window.app;
    if(typeof(name) == "undefined")
      return window.app.get(name);
    return window.app.set(name, value);
  }
  Helpers.Template = function(name) {
    return Helpers.App.getCompiledTemplate(name);
  }
  Helpers.Sys = Helpers.App;
  Helpers.Users = function(name, value) {
    if(typeof(name) == "undefined" && typeof(value) === "undefined")
      window.app.get('users');
    if(typeof(name) == "undefined")
      return window.app.get('users').get(name);
    return window.app.get('users').set(name, value);
  }
  Helpers.Posts = function() {
    if(typeof(name) == "undefined" && typeof(value) === "undefined")
      return window.app.get('posts');
    if(typeof(name) == "undefined")
      return window.app.get('posts').get(name);
    return window.app.get('posts').set(name, value);
  }
  Helpers.Me = function(name, value) {
    if(typeof(name) == "undefined" && typeof(value) === "undefined")
      return window.app.get('currentUser');
    if(typeof(name) == "undefined")
      return window.app.get('currentUser').get(name);
    return window.app.get('currentUser').set(name, value);
  }
  Helpers.MeTzone = function() {
    return Helpers.Me('timezone');
  }
  Helpers.Post = function() {
    if(typeof(name) == "undefined" && typeof(value) === "undefined")
      return window.app.get('currentPost');
    if(typeof(name) == "undefined")
      return window.app.get('currentPost').get(name);
    return window.app.get('currentPost').set(name, value);
  } 

  // Set this Model List under our custom Y.MVC namespace.
  Y.MONDIS.Helpers = Helpers;

}, '0.0.1', {
  requires: ['gallery-crypto-md5']
});