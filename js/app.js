YUI.add('md-app', function (Y) {
  'use strict';

  Y.namespace('MONDIS');

  var App,
    Helpers = Y.MONDIS.Helpers,
    Users = Y.MONDIS.Models.UserList,
    Posts = Y.MONDIS.Models.PostList,
    PostView = Y.MONDIS.Views.Post,
    MessageView = Y.MONDIS.Views.Message,
    UserView = Y.MONDIS.Views.User;

  App = Y.Base.create('App', Y.App, [], {
    serverRouting: false,
    initializer: function () {
      
      //Set default filter values
      this.set('filter', {});
      //We render view every time filter is updated
      this.after("filterChange", this.render, this);
      
      //Init users and posts
      this.set('users', new Users());
      this.set('posts', new Posts());
      
      var users = this.get('users'),
          posts = this.get('posts');
      
      users.load();
      
      posts.after(['add', 'remove', 'reset'], this.render, this);
      posts.load();
      
      this.once('ready', function () {
        if (this.hasRoute(this.getPath())) {
          this.dispatch();
        }
      });
      
      return this;
    },
    render: function () {
        var filter = this.get('filter');
      //<<Select right menu item
        var header = this.get('headerContainer'),
            route = filter.path.toRoute()[0],
            selection = (header.one('a[href*=' + route + ']')) || (header.one('li>a'));
        header.all('li').removeClass('pure-menu-selected');
        //Get current route to place the right highlight
        if (selection) selection.get('parentNode').addClass('pure-menu-selected');
      //Selected>>
      //Render current page content
        var content = this.get('pageContainer'),
            posts;
        content.empty();
      
      switch(route) {
          case '':
          case 'posts':
            posts = this.get('posts').getFilteredList(filter);
            if(posts.size()){
              posts.each(function(post){
                var postView = new PostView({model:post});
                content.append(postView.get('container'));
              }, this);
            }else
              content.setHTML('<h2 class="content-head">No discussions or posts</h2><p>No discussions or posts have been found. You should create one.</p>');
          break;
          case 'feed':
          
          break;
          case 'messages':
          
          break;
          case 'users':
          
          break;
          default:
            //We could not find the page we were looking for
            //Show 404
            content.setHTML('<h2 class="content-head">System can not find the page you are looking for - 404</h2><p>If you think there is a mistake please contact the system administrator.</p>');
      }
        
      return this;
    },
    
    ruotePosts: function(req, res) {
      console.log("At posts");
      this.set('filter', Y.merge({path: req.path}, req.query, req.params));
    },
    
    routeMessages: function(req, res){
      console.log("At messages");
      this.set('filter', Y.merge({path: req.path},req.query, req.params));
    },
    
    routeUsers: function(req, res){
      console.log("At users");
      this.set('filter', {path: req.path});
    },
    
    routeUnknown: function(){
      console.log("At unknown");
      this.set('filter', {path: req.path});
    }

  }, {
    ATTRS: {

      //Application settings
      filter: {
        value: false,
        setter: function(query, name) {
          return Y.merge({
              path: '/',
              slug: false,
              sort: 'date',
              dion: 'asc',
              tags: false,
              keyword: false
            }, query);
        }
//        type: 'feed',
//        tags: null,
//        author: null,
//        sort: 'date',
//        sortDirection: 'asc',
//        limit: 10,
//        page: 1,
//        hierarchy: true,
//        ordered: true
      },
      //Application data
      users: {
        value: null
      },
      posts: {
        value: null
      },

      //Application views
      headerContainer: {
        valueFn: function () {
          return Y.one('.header');
        }
      },
      pageContainer: {
        valueFn: function () {
          return Y.one('.content-wrapper>.content');
        }
      },
      footerContainer: {
        valueFn: function () {
          return Y.one('.footer');
        }
      },

      //Convinience methods

      currentUser: {
        getter: function () {
            return this.get('users').get('currentUser');
          },
        setter: function (user, name) {
          //We do not want this to happen
          return;
        }
      },

      currentPost: {
        getter:  function () {
          return this.get('posts').get('currentPost');
        },
        setter: function (post, name) {
          this.get('posts').set('currentPost', post);
        }
      },

      //Application routing
      serverRouting: {
        value: false
      },
      
      routes: {
        value: [
          {
            path: '/',
            callback: 'ruotePosts'            
          },
          {
            path: '/posts',
            callback: 'ruotePosts'            
          },
          {
            path: '/posts/:slug',
            callback: 'ruotePosts'            
          },
          {
            path: '/feed',
            callback: 'ruotePosts'            
          },
          {
            path: '/messages',
            callback: 'routeMessages'            
          },
          {
            path: '/users',
            callback: 'routeUsers'            
          },
          {
            path: '/users/:slug',
            callback: 'routeUsers'            
          },
          {
            path: '*',
            callback: 'routeUnknown'
          }
        ]
      }
    }
  });

  Y.MONDIS.App = App;

}, '0.0.1', {
  requires: ['app-base', 'node', 'io', 'md-helpers', 'md-users', 'md-posts', 'md-views']
});



//      YUI_config = {
//filter: 'debug',
//useConsoleOutput: true
//};
YUI({
  groups: {
    'MONDIS': {
      base: './js/',
      modules: {
        'gallery-crypto-md5': {
          path: 'vendor/gallery-crypto-md5-min.js'
        },
        'md-helpers': {
          path: 'app/helpers.js',
          requires: ['gallery-crypto-md5']
        },
        'md-users': {
          path: 'app/users.js',
          requires: ['model', 'model-list', 'md-helpers']
        },
        'md-posts': {
          path: 'app/posts.js',
          requires: ['model', 'model-list', 'md-helpers']
        },
        'md-views': {
          path: 'app/views.js',
          requires: ['node', 'io', 'view', 'panel', 'handlebars']
        },
        'md-app': {
          path: 'app.js',
          requires: ['app', 'node', 'io', 'md-helpers', 'md-users', 'md-posts', 'md-views']
        }
      }
    }
  }
}).use('md-app', function (Y) {
  window.app = new Y.MONDIS.App();
});