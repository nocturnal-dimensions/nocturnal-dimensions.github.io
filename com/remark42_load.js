var remark_config = {
    host: "https://comments.briztimqwo.com:50911",
    site_id: 'eh',
    components: ['embed'],
    max_shown_comments: 25,
    theme: 'light',
    page_title: 'Nocturnal-Dimensions Comments'
};

(function(c) {
    for(var i = 0; i < c.length; i++){
      var d = document, s = d.createElement('script');
      s.src = remark_config.host + '/web/' +c[i] +'.js';
      s.defer = true;
      (d.head || d.body).appendChild(s);
    }
})(remark_config.components || ['embed']);