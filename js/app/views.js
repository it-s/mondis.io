YUI.add('md-views', function (Y) {
  'use strict';

  Y.namespace('MONDIS.Views');

  var titleView, 
    postView,
    messageView,
    userView,      
    Helpers = Y.MONDIS.Helpers;

  function ___test(a, b) {
    if (b == undefined) return a!=null && a!=undefined && a != 0 && a != "" && a != false;
    else return a === b
  }

  function ___testi(a, b) {
    if (b == undefined) return a===null || a===undefined || a === 0 || a === "" || a === false;
    else return a != b
  }

  Y.Handlebars.registerHelper('is', function (v1, v2, options) {
    options = options || v2;
    v2 = v2 === options ? undefined : v2;
    if (___test(v1, v2)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Y.Handlebars.registerHelper('isnt', function (v1, v2, options) {
    options = options || v2;
    v2 = v2 === options ? undefined : v2;
    if (___testi(v1, v2)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Y.Handlebars.registerHelper('isANDis', function (a, b, c, d, options) {
    options = options || d || c;
    d = d === options ? undefined : d;
    c = c === options ? undefined : c;
    if (___test(a, b) && ___test(c, d)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Y.Handlebars.registerHelper('isANDnot', function (a, b, c, d, options) {
    options = options || d || c;
    d = d === options ? undefined : d;
    c = c === options ? undefined : c;
    if (___test(a, b) && ___testi(c, d)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Y.Handlebars.registerHelper('notANDnot', function (a, b, c, d, options) {
    options = options || d || c;
    d = d === options ? undefined : d;
    c = c === options ? undefined : c;
    if (___testi(a, b) && ___testi(c, d)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  // -- Todo View -------------------
  titleView = Y.Base.create('titleView', Y.View, [], {
    containerTemplate: '<section>',
    template: Y.Handlebars.compile(Y.one('#page-header-template').getHTML()),
    initializer: function () {
      this.after('textChange', this.render, this);
    },
    render: function() {
      var container = this.get('container');
      container.setHTML(this.template(this.toJSON()));
    }
  },{
    ATTRS:{
      text: {
        value: ""
      }
    }
  });
  Y.MONDIS.Views.Title = titleView;
  
  
  // -- Post View -------------------
  postView = Y.Base.create('postView', Y.View, [], {
    containerTemplate: '<section>',
    // Compile our template using Handlebars.
    templateDiscussionHead: Y.Handlebars.compile(Y.one('#discussionHead-template').getHTML()),
    templateDiscussion: Y.Handlebars.compile(Y.one('#discussion-template').getHTML()),
    templatePost: Y.Handlebars.compile(Y.one('#post-template').getHTML()),
    templateMessage: Y.Handlebars.compile(Y.one('#message-template').getHTML()),
    templateAlert: Y.Handlebars.compile(Y.one('#alert-template').getHTML()),

    // Bind DOM events for handling changes to a specific Todo,
    // for completion and editing.
    events: {
      '.action-edit': {
        click: 'edit'
      },
      '.action-rateup': {
        click: 'rateUp'
      },
      '.action-ratedown': {
        click: 'rateDn'
      },
      '.action-follow': {
        click: 'follow'
      },
      '.action-discuss': {
        click: 'discuss'
      },
      '.action-reply': {
        click: 'reply'
      }
    },

    // Initialize this view by setting event handlers when the Model
    // is updated or destroyed.
    initializer: function () {
      var model = this.get('model');
      model.detach('change').after('change', this.update, this);
    },

    // Render this view in our <li> container, and fill it with the
    // data in our Model.
    render: function () {
      var model = this.get('model');      
      if(model.view) model.view.destroy({remove:true});      
      this.update();
      model.view = this;      
      return this;
    },
    
    update: function () {
      
      var container = this.get('container');
      var model = this.get('model');
      var template;
      
      console.log("Rendering "+model.get('sysID'));
      
      if(model.isDiscussion() && model.isOpen()) template = this.templateDiscussion;
      if(model.isDiscussion() && !model.isOpen()) template = this.templateDiscussionHead;
      if(model.isPost()) template = this.templatePost;
      if(model.isMessage()) template = this.templateMessage;

      container.setHTML(template(model.toHandlebars()));      
      
      return this;
    },

    // Turn on editing mode for the Todo by exposing the input field.
    edit: function (e) {
      if(e) e.halt();
      var container = this.get('container');
      container.addClass('editing');
      container.one('.action-save').on('click', this.save, this);
    },
    cancel: function (e) {
      if(e) e.halt();
      var container = this.get('container');
      container.one('.action-save').detach();
      container.removeClass('editing');
    },
    save: function (e) {
      this.cancel(e);
      //TODO
    },
    rateUp: function (e) {
      if(e) e.halt();
//      this.get('model').upRate();
      this.get('model').set('rate', 1);
      Helpers.Me().set('rate', this.get('model'));
      //TODO
    },
    rateDn: function (e) {
      if(e) e.halt();
//      this.get('model').downRate();
      this.get('model').set('rate', -1);
      Helpers.Me().set('rate', this.get('model'));
      //TODO
    },
    follow: function (e) {
      if(e) e.halt();
      Helpers.Me().set('follow', this.get('model'));      
      //TODO
    },
    discuss: function (e) {
      if(e) e.halt();
      //TODO
    },
    reply: function (e) {
      if(e) e.halt();
      //TODO
    },
    remove: function (e) {
      if(e) e.halt();
      //TODO
    }

  });

  // Set this View under our custom Y.TodoMVC namespace.
  Y.MONDIS.Views.Post = postView;

  messageView = Y.Base.create('messageView', Y.View, [], {
    containerTemplate: '<div>',
    // Compile our template using Handlebars.
    template: Y.Handlebars.compile(Y.one('#message-template').getHTML()),

    // Bind DOM events for handling changes to a specific Todo,
    // for completion and editing.
    events: {},

    // Initialize this view by setting event handlers when the Model
    // is updated or destroyed.
    initializer: function () {
      var model = this.get('model');
      model.after('change', this.render, this);
    },

    // Render this view in our <li> container, and fill it with the
    // data in our Model.
    render: function () {
      var container = this.get('container');
      var model = this.get('model');

      container.setHTML(this.template(model.toJSON()));

      return this;
    }

  });

  // Set this View under our custom Y.TodoMVC namespace.
  Y.MONDIS.Views.Message = messageView;

  userView = Y.Base.create('userView', Y.View, [], {
    containerTemplate: '<div>',
    // Compile our template using Handlebars.
    template: Y.Handlebars.compile(Y.one('#user-template').getHTML()),

    // Bind DOM events for handling changes to a specific Todo,
    // for completion and editing.
    events: {},

    // Initialize this view by setting event handlers when the Model
    // is updated or destroyed.
    initializer: function () {
      var model = this.get('model');
      model.after('change', this.render, this);
    },

    // Render this view in our <li> container, and fill it with the
    // data in our Model.
    render: function () {
      var container = this.get('container');
      var model = this.get('model');

      container.setHTML(this.template(model.toJSON()));

      return this;
    }

  });

  // Set this View under our custom Y.TodoMVC namespace.
  Y.MONDIS.Views.User = userView;

}, '0.0.1', {
  requires: [
    'view',
    'handlebars',
    'event-focus', 'md-helpers'
  ]
});