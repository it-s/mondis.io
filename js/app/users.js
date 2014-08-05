YUI.add('md-users', function (Y) {
  'use strict';

  Y.namespace('MONDIS.Models');

  var UserModel,
    UserList,
    CurrentUserModel,
    AdminUserModel,
    Helpers = Y.MONDIS.Helpers;

  // --------------------------- //
  // ---- Users Model
  // ----*******************---- //
  // --------------------------- //
  UserModel = Y.Base.create('user', Y.Model, [Y.ModelSync.Local], {
    root: 'mondisUsers',
    idAttribute: 'sysID',
    synchAttributes: ['sysID', 'nick', 'timezone', 'avatar', 'lastOnline'],

    toJSON: function () {
      var e = {},
          synch = this.synchAttributes;
      for( var key in this._attrs ) {
        if(synch.indexOf(key)>-1)
          e[key] = this.get(key);
      }      
      return e;
    },
    toHandlebars: function () {
        var attrs = this.getAttrs();
 
        delete attrs.clientId;
        delete attrs.destroyed;
        delete attrs.initialized;
 
        if (this.idAttribute !== 'id') {
            delete attrs.id;
        }
 
        return attrs;
    },

    //Actions

    Message: function (data) {
      //Convinience wrapper
      data.sysAuthorID = this.get('sysID');
      return Helpers.Posts().Message(data);
    },
    Alert: function (type, data) {
      //Convinience wrapper
      data.sysAuthorID = this.get('sysID');
      return Helpers.Posts().Alert(type, data);
    },

    //Testers

    isSameAs: function (user) {
      if (Y.Lang.isObject(user))
        return user.get('sysID') === this.get('sysID');
      else
        return user === this.get('sysID');
    },

    isAuthorTo: function (post) {
      if (Y.Lang.isObject(post))
        return this.get('sysID') === post.get('sysAuthorID');
      else
        return this.get('sysID') === post;
    },

    //Getters

    //Setters    
    _setAvatar: function (value) {
      //Check value to determine what it is:
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(value)) {
        //this a an e-mail. generate gravatar link
        return Helpers.Gravatar(value);
      }
      return value;
    }

  }, {
    ATTRS: {
      sysID: {
        value: Y.guid('user')
      },
      nick: {
        value: 'nick',
        validator: function (value) {
          return typeof value === 'string' && /^[a-zA-Z0-9-_/.]*$/.test(value);
        },
        setter: function (value) {
          return value.toLowerCase();
        }
      },
      timezone: {
        value: '0'
      },
      avatar: {
        value: null,
        setter: '_setAvatar'
      },
      lastOnline: {
        value: null,
        setter: function (value) {
          return Helpers.DateUTC(value).toString();
        }
      },
      //Convinience methods
      URL: {
        getter: function () {
          return Helpers.App('serverRoot') + '#/users/' + this.get('nick');
        },
        readOnly: true
      },
      link: {
        //Convinience method
        getter: function () {
          return {
            user: this.get('nick'),
            URL: this.get('URL'),
            avatar: this.get('avatar')
          };
        },
        readOnly: true
      },
    }
  });

  // --------------------------- //
  // ---- Current User Model
  // ----*******************---- //
  // --------------------------- //
  CurrentUserModel = Y.Base.create('me', UserModel, [], {
    root: 'mondisMe',
    synchAttributes: ['sysID', 'nick', 'timezone', 'avatar', 'lastOnline', 'following', 'rated', 'commented', 'isAdmin'],

    //Actions
//    rate: function (post) {
//      //convinience function
//      this.set('rate', post);
//    },
//    uprate: this.rate,
//    downrate: this.rate,

    //Testers
    isFollowing: function (post) {
      var id = Y.Lang.isObject(post) ? post.get('sysID') : post;
      return Helpers.Contains(this.get('following'), id);
    },

    isRated: function (post) {
      var id = Y.Lang.isObject(post) ? post.get('sysID') : post;
      return Helpers.Contains(this.get('rated'), id);
    },

    isCommented: function (post) {
      var id = Y.Lang.isObject(post) ? post.get('sysID') : post;
      return Helpers.Contains(this.get('commented'), id);
    },

    isAdmin: function () {
      //this always returns false
      return this.get('isAdmin');
    },

    //Getters


    //Setters  
    _setAttchment: function (value, name) {

      var src,
        arr,
        postID = Y.Lang.isObject(value) ? value.get('sysID') : value;

      function addOrRemove(where, what) {
        if (where.indexOf(what) >= 0) where.pop(what);
        else where.push(what);
        return where;
      }

      switch (name) {
        case 'follow':
          src = 'following';
          break;
        case 'rate':
          src = 'rated';
          break;
        case 'comment':
          src = 'commented';
          break;
      }

      arr = this.get(src);
      this.set(src, addOrRemove(arr, postID));
    }
  }, {
    ATTRS: {
      following: {
        value: []
      },
      follow: {
        setter: '_setAttchment'
      },
      rated: {
        value: []
      },
      rate: {
        setter: '_setAttchment'
      },
      commented: {
        value: []
      },
      comment: {
        setter: '_setAttchment'
      },
      isAdmin: {
        value: false,
        readOnly: true
      }
    }
  });

  // --------------------------- //
  // ---- Users Model list
  // ----*******************---- //
  // --------------------------- //
  UserList = Y.Base.create('users', Y.ModelList, [Y.ModelSync.Local], {
    root: 'mondisUsers',
    model: UserModel
  }, {
    ATTRS: {}
  });

  Y.MONDIS.Models.User = UserModel;
  Y.MONDIS.Models.UserList = UserList;
  Y.MONDIS.Models.CurrentUser = CurrentUserModel;
  Y.MONDIS.Models.AdminUser = AdminUserModel;

}, '0.0.1', {
  requires: ['model', 'model-list', 'gallery-model-sync-local', 'md-helpers']
});