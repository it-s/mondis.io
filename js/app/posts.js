YUI.add('md-posts', function (Y) {
  'use strict';

  Y.namespace('MONDIS.Models');

  var BaseModelList,
    PostModel,
    PostList,
    Helpers = Y.MONDIS.Helpers;

  // --------------------------- //
  // ---- Post Model
  // ----*******************---- //
  // --------------------------- //

  PostModel = Y.Base.create('post', Y.Model, [], {
    idAttribute: 'sysID',

    //Actions

    upRate: function () {
      this.set('rate', 1);
      Helpers.Me().uprate(this);
    },

    downRate: function () {
      this.set('rate', -1);
      Helpers.Me().downrate(this);
    },

    open: function () {
      Helpers.App('currentPost', this);
    },

    close: function () {
      Helpers.App('currentPost', null);
    },

    //Testers
    isSameAs: function (post) {
      if (Y.Lang.isObject(post))
        return post.get('sysID') === this.get('sysID');
      else
        return post === this.get('sysID');
    },
    isTagged: function (tags) {
      return Helpers.Contains(this.get('tags'), tags);
    },
    isDiscussion: function () {
      return this.isTagged('sys-type-discussion');
    },
    isPost: function () {
      return this.isTagged('sys-type-post');
    },
    isMessage: function () {
      return this.isTagged('sys-type-message');
    },
    isPM: function () {
      return this.isTagged(['sys-type-message', 'sys-msg-pm']);
    },
    isAlert: function () {
      return this.isTagged(['sys-type-message', 'sys-msg-alert']);
    },
    isOwnedBy: function (user) {
      if (Y.Lang.isObject(user))
        return user.isAuthorTo(this);
      else
        return user === this.get('sysAuthorID');
    },
    isRatedBy: function (user) {
      if (Y.Lang.isObject(user))
        return user.isRated(this);
      else
        return false;
    },
    isOpen: function () {
      return this.isSameAs(Helpers.Post());
    },

    //Getters

    _getRelatedUsers: function () {
      //TODO Max users to see should be custom
      var maxTags = 9,
        sysTags = this.get('sysTags'),
        users = Helpers.Users(),
        relatedUsers = [];
      //      for(var i = sysTags.length-1; i>=0; i--){
      //        var tag = sysTags[i];
      //        if(tag.indexOf('sys-rate-') === 0){
      //          var user = tag.substr(9, user.length);
      //          relatedUsers.push(users.getById(user).get('link'));
      //        }
      //        if(relatedUsers.length === maxTags-1) break;
      //      }
      return relatedUsers;
    },

    _getTagLinks: function () {
      var sysConfig = Helpers.Sys(),
        tags = this.get('userTags'),
        links = [];

      return Y.Array.map(tags, function (tag) {
        return {
          tag: tag,
          URL: Helpers.Sys().serverRoot + '#/tagged/' + tag
        }
      });

    },

    //Setters
    _setTag: function (value, name) {
      var tags = this.get('tags');
      if (!Helpers.Contains(tags, value)) {
        tags.push(value);
        this.set('tags', tag);
      }
    },

    _setSysTag: function (value, name) {
      this._setTag(Helpers.Typefy(value));
    },

    _setDate: function (value, name) {
      if (value && Y.Lang.isDate(value))
        return Helpers.DateUTC(value).toString();
      else
        return value;
    },

    _setParent: function (value, name) {
      if (Y.Lang.isObject(value)) {
        this.set('sysParentID', value.get('sysID'));
      } else if (Y.Lang.isString(value)) {
        this.set('sysParentID', value);
      }
    },

    _setAuthor: function (value, name) {
      if (Y.Lang.isObject(value)) {
        this.set('sysAuthorID', value.get('sysID'));
      } else if (Y.Lang.isString(value)) {
        this.set('sysAuthorID', value);
      }
    }

  }, {
    ATTRS: {
      //Real ATTRS:
      sysID: {
        value: Y.guid('post')
      },
      sysParentID: {
        value: null
      },
      sysAuthorID: {
        value: 'admin'
      },
      dateCreated: {
        value: Helpers.DateUTC().toString(),
        setter: '_setDate'
      },
      dateModified: {
        value: null,
        setter: '_setDate'
      },
      tags: {
        value: []
      },
      rate: {
        value: 0,
        setter: function (value, name) {
          return this.get('rate') + Helpers.toNumber(value);
        }
      },
      slug: {
        value: null
      },
      title: {
        value: null
      },
      content: {
        value: null
      },
      //Convinience methods:
      parent: {
        //Convinience method
        getter: function () {
          var id = this.get('sysParentID');
          return Y.Lang.isNull(id) ? null : Helpers.App().get('posts').getById(id);
        },
        setter: '_setParent'
      },
      parentLink: {
        //Convinience method
        getter: function () {
          var parent = this.get('parent');
          return Y.Lang.isNull(parent) ? null : parent.get('link');
        },
        readOnly: true
      },
      author: {
        //Convinience method
        getter: function () {
          var id = this.get('sysAuthorID');
          return Y.Lang.isNull(id) ? null : Helpers.Users().getById(id);
        },
        setter: '_setAuthor'
      },
      authorLink: {
        //Convinience method
        getter: function () {
          var user = this.get('author');
          return Y.Lang.isNull(user) ? null : user.get('link');
        },
        readOnly: true
      },
      dateTime: {
        //Convinience method
        getter: function () {
          //TODO refactor
          var date = this.get('dateModified') || this.get('dateCreated');
          return Helpers.DateToSimpleString(date, Helpers.Me('timezone'));
        },
        readOnly: true
      },
      type: {
        //Convinience method
        getter: function () {
          if (this.isPost()) return 'post';
          if (this.isDiscussion()) return 'discussion';
          if (this.isAlert()) return 'alert';
          if (this.isMessage()) return 'message';
          return '';
        },
        setter: '_setSysTag'
      },
      tag: {
        //Convinience method
        setter: '_setTag'
      },
      tagLinks: {
        //Convinience method
        getter: '_getTagLinks',
        readOnly: true
      },
      userTags: {
        //Convinience method
        getter: function () {
          return Y.Array.filter(this.get('tags'), function (tag) {
            return tag.indexOf('sys') < 0;
          });
        },
        readOnly: true
      },
      sysTags: {
        //Convinience method
        getter: function () {
          return Y.Array.filter(this.get('tags'), function (tag) {
            return tag.indexOf('sys') >= 0;
          });
        },
        readOnly: true
      },
      relatedUsers: {
        //Convinience method
        getter: '_getRelatedUsers',
        readOnly: true
      },
      replyCount: {
        //Convinience method
        getter: function () {
          //TODO
          return 0;
        },
        readOnly: true
      },
      URL: {
        //Convinience method
        getter: function () {
          //TODO we need to somehow make place specific URLs customizable and defined in config
          return Helpers.Sys().serverRoot + '#/posts/' + this.get('slug');
        },
        readOnly: true
      },
      link: {
        //Convinience method
        getter: function () {
          var title = this.get('title') || this.get('sysID'),
            url = this.get('URL');
          return {
            title: title,
            URL: url
          };
        },
        readOnly: true
      },
      path: {
        //Convinience method
        getter: '_getPath',
        readOnly: true
      },
      isOpen: {
        //Convinience method
        getter: 'isOpen',
        readOnly: true
      },
      isOwn: {
        //Convinience method
        getter: function () {
          return Helpers.Me().isAuthorTo(this);
        },
        readOnly: true
      },
      isFavorite: {
        //Convinience method
        getter: function () {
          return Helpers.Me().isFollowing(this.get('sysID'));
        },
        readOnly: true
      },
      canEdit: {
        //Convinience method
        getter: function () {
          return Helpers.Me().isAdmin() || this._isOwn();
        },
        readOnly: true
      }
    }
  });

  // --------------------------- //
  // ---- Posts List Model
  // ----*******************---- //
  // --------------------------- //
  PostList = Y.Base.create('posts', Y.ModelList, [], {
    // The related Model for our Model List.
    model: PostModel,

    initializer: function() {
      this.after('add', this._AlertUser ,this);
    },

    getBySlug: function (slug) {
      var model = null;

      for (var i = 0; i < this.size(); i++) {
        var item = this.item(i);
        if (item.get('slug') === slug) {
          model = item;
          break;
        }
      }

      return model
    },
    
    _AlertUser: function(e) {
      var post = e.model,
          parent = post.get('parent');
      if (post.isMessage())       return; //Thiw is already a message. No need to alert.
      if (Y.Lang.isNull(parent))  return; //No one to alert.
      parent.get('author').Alert((post.isPost()? 'reply' : 'discuss'),{title: post.get('sysID')});
    },
    
    _CreateSlug: function (title) {
      var slug = Helpers.Slugify(title),
          count = 0;
      
      for (var i = 0; i < this.size(); i++) {
        if (this.item(i).get('slug').indexOf(slug)>=0) count++;
      }
      return slug + (count > 0 ? count : '');
    },

    _PrepareTags: function (tags, add) {
      tags = tags || [];
      return Y.merge(tags, add);
    },

    _New: function (data) {
      if (Y.Lang.isNudefined(data)) return false;
      if (Y.lang.isUndefined(data.sysID)){
        data.slug = this._CreateSlug(data.slug);
        this.add(data);
      } else {
        data.dateModified = Helpers.DateUTC().toString();
        this.getById(data.sysID).setAttrs(data);
      };
    },

    Post: function (data) {
      if (Y.Lang.isUndefined(data)) return false;
      if(!data.content) return false;
      data.sysAuthorID = data.sysAuthorID  || Helpers.Me('sysID');
      data.sysParentID = data.sysParentID  || Helpers.Post('sysID');
      data.title = data.title || "RE: " + Helpers.Post('title');
      data.tags = this._PrepareTags(data.tags, [Helpers.Typefy('post')]);
      data.slug = data.title;
      this._New(data);
    },

    Discussion: function (options) {
      if (Y.Lang.isNudefined(options)) return false;
      if(!data.title) return false;
      data.sysAuthorID = data.sysAuthorID || Helpers.Me('sysID');
      data.tags = this._PrepareTags(data.tags, [Helpers.Typefy('discussion')]);
      data.slug = data.title;
      this._New(data);
    },

    Message: function (options) {
      if (Y.Lang.isNudefined(options)) return false;
      if(!data.sysAuthorID) return false;
      if(!data.content) return false;
      data.sysParentID = data.sysParentID || Helpers.Me('sysID'); //Not a mistake when sending a message current user is usually an originator (parent)
      data.tags = this._PrepareTags(data.tags, [Helpers.Typefy('message'), Helpers.Typefy('pm', 'msg')]);
      data.slug = "from_" + this.getById(data.sysParentID).get('nick');
      this._New(data);
    },

    Alert: function (type, options) {
      if (Y.Lang.isNudefined(options)) return false;
      if(!data.sysAuthorID) return false;
      if(!data.title) return false; //When sending an allert title is related post sysID
      data.sysParentID = data.sysParentID  || Helpers.Me('sysID'); //Not a mistake when sending a message current user is usually an originator (parent)
      data.tags = this._PrepareTags(data.tags, [Helpers.Typefy('message'), Helpers.Typefy('alert', 'msg'), Helpers.Typefy('type', 'alert')]);
      data.slug = "by_" + this.getById(data.sysParentID).get('nick');
      this._New(data);
    },

    sortByTypeComparator: function (post) {
      return post.get('type');
    },

    sortByAlphabetComparator: function (post) {
      return post.get('title') || "";
    },
    sortByRatingComparator: function (post) {
      return post.get('rate');
    },
    sortByDateComparator: function (post) {
      return post.get('dateTime');
    },

    messages: function () {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isPost();
      });
    },

    alerts: function () {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isAlert();
      });
    },

    pms: function () {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isPM();
      });
    },

    tags: function (tags) {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isTagged(tags);
      });
    },

    discussions: function () {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isDiscussion();
      });
    },

    posts: function () {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isPost();
      });
    },

    feed: function () {
      return this.filter({
        asList: true
      }, function (post) {
        return post.isDiscussion() || post.isPost();
      });
    },

    getFilteredList: function (filter) {
      var defaults = {
        type: 'feed',
        tags: null,
        author: null,
        sort: 'date',
        sortDirection: 'asc',
        limit: 10,
        page: 1,
        hierarchy: true,
        ordered: true
      },
        open = this.get('currentPost'),
        opts = Y.Lang.isObject(filter) ? Y.merge(defaults, filter) : defaults,
        list = null;

      //Get the post type we need
      switch (opts.type) {
        case 'discussion':
          list = this.discussions();
          break;
        case 'post':
          list = this.posts();
          break;
        case 'message':
          list = this.messages();
          break;
        case 'alert':
          list = this.alerts();
          break;
        case 'pm':
          list = this.pms();
          break;
        default:
          list = this.feed();
      }

      //Filter by currently open
      if ((opts.type === 'feed' || opts.type === 'post' || opts.type === 'discussion') && opts.hierarchy)
        list = list.filter({
          asList: true
        }, function (post) {
          if (open)
            return post.get('sysParentID') === open.get('sysID');
          else
            return post.get('sysParentID') === null;
        });

      //Filter the relevant tags if any
      if (opts.tags)
        list = list.filter({
          asList: true
        }, function (post) {
          return post.isTagged(opts.tags);
        });

      //Filter by user ID if any
      if (opts.user)
        list = list.filter({
          asList: true
        }, function (post) {
          return post.isOwnedBy(opts.user);
        });

      //Sort
      switch (opts.sort) {
        case 'alpha':
          list.comparator = this.sortByAlphabetComparator;
          break;
        case 'rate':
          list.comparator = this.sortByRatingComparator;
          break;
        default:
          list.comparator = this.sortByDateComparator;
      }
      if (opts.sortDirection === "asc") list.sort();
      else
        list.sort({
          descending: true
        });

      //Paginate
      var listStart = 0,
        listEnd = opts.page * opts.limit,
        listTitalItems = list.size(),
        listShowinItems = opts.limit,
        listHiddenItems = listTitalItems - listShowinItems,
        listPages = Math.floor(listTitalItems / opts.limit);

      list = list.filter({
        asList: true
      }, function (post, index) {
        return index >= listStart && index < listEnd;
      });

      list.set('stats', {
        totalPages: listPages,
        currentPage: opts.page,
        totalItems: listTitalItems,
        shownItems: listShowinItems,
        hiddenItems: listHiddenItems
      });

      //Normalize (for feeds only)
      if (opts.type === 'feed' && opts.ordered) {
        list.comparator = this.sortByTypeComparator;
        list.sort({
          descending: false
        });
      }

      return list;
    },

    getModelAttrs: function () {
      var i,
        response = [];
      for (i = 0; i < this.size(); i++) {
        var model = this.item(i);
        response.push(model.getAttrs());
      }
      return response;
    }

  }, {
    ATTRS: {
      currentPost: {
        value: null
      }
    }
  });

  Y.MONDIS.Models.Post = PostModel;
  Y.MONDIS.Models.PostList = PostList;

}, '0.0.1', {
  requires: ['model', 'model-list', 'md-helpers']
});