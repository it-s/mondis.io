YUI.add('md-views', function (Y) {
  'use strict';

  Y.namespace('MONDIS.Views');

  var postView,
    messageView,
    userView;

  // -- Todo View -------------------
  postView = Y.Base.create('postView', Y.View, [], {
    containerTemplate: '<div>',
    // Compile our template using Handlebars.
    template: Y.Handlebars.compile(Y.one('#post-template').getHTML()),

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
      model.after('change', this.render, this);
    },

    // Render this view in our <li> container, and fill it with the
    // data in our Model.
    render: function () {
      var container = this.get('container');
      var model = this.get('model');

      container.setHTML(this.template(model.toHandlebars())).addClass('p-one').addClass('pure-g');

      return this;
    },

    // Turn on editing mode for the Todo by exposing the input field.
    edit: function () {
      var container = this.get('container');
      container.addClass('editing');
      container.one('.action-save').on('click', this.save, this);
    },
    cancel: function () {
      var container = this.get('container');
      container.one('.action-save').detach();
      container.removeClass('editing');
    },
    save: function () {
      this.cancel();
      //TODO
    },
    rateUp: function () {
      //TODO
    },
    rateDn: function () {
      //TODO
    },
    follow: function () {
      //TODO
    },
    discuss: function () {
      //TODO
    },
    reply: function () {
      //TODO
    },
    destroy: function () {
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
    'event-focus'
  ]
});