var cu = window.app.get('currentUser');
cu.setAttrs({
      "nick": "eugene",
      "timezone": "+5",
      "avatar": "eugene.trounev@gmail.com",
      "rated": ["postyui_3_17_2_1_1404866127097_19"],
      "following": ["postyui_3_17_2_1_1404866127097_19"]
    });
cu.save();
var u = window.app.get('users');
u.create({
      "sysID": "dkfndhfde83ywery",
      "nick": "eugene",
      "timezone": "+5",
      "avatar": "eugene.trounev@gmail.com"
    });
u.create({
      "sysID": "djhfjshf8324yrh",
      "nick": "sasha",
      "timezone": "+2",
      "avatar": "/images/avatar-girl.jpg"
    });

var p = window.app.get('posts');
p.create({
      "sysParentID": null,
      "sysAuthorID": "djhfjshf8324yrh",
      "dateCreated": "Wed, 09 Jul 2014 00:35:27 GMT",
      "dateModified": null,
      "tags": [
      "mim",
      "test",
      "sys-type-discussion"
    ],
      "rate": 0,
      "slug": "new-test-discussion",
      "title": "New test discussion",
      "content": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
  });