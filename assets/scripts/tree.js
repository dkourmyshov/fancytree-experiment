$(document).ready(function () {
  var initial_source = [
    {title: 'Animalia', key: '1', expanded: true, children: [
      {title: 'Chordata', key: '2', expanded: true, children: [
        {title: 'Primates', key: '3', expanded: true, children: [
          {title: 'Homo sapiens', key: '4'}
        ]},
        {title: 'Carnivora', key: '5', expanded: true, children: [
          {title: 'Felis catus', key: '6'}
        ]}
      ]},
      {title: 'Arthropoda', key: '7', expanded: true, children: [
        {title: 'Araneae', key: '8', expanded: true, children: [
          {title: 'Cheiracanthium punctorium', key: '9'}
        ]}
      ]}
    ]},            
    {title: 'Fungi', key: '10', expanded: true, children: [
      {title: 'Basidiomycota', key: '11', expanded: true, children: [
        {title: 'Agaricales', key: '12', expanded: true, children: [
          {title: 'Amanita muscaria', key: '13'}
        ]}
      ]}
    ]},
    {title: 'Plantae', key: '14', expanded: true, children: [
      {title: 'Eudicots', key: '15', expanded: true, children: [
        {title: 'Fagales', key: '16', expanded: true, children: [
          {title: 'Quercus alba', key: '17'}
        ]}
      ]}
    ]}
  ];
  var local_storage_supported = 'localStorage' in window && window['localStorage'] !== null;
  var admin_mode = false;
  var drag_n_drop_in_progress = false;
  $('#admin_mode').prop('disabled', false);
  $('#admin_mode').prop('checked', false);
  var dropdown_shown = false;

  var guid = function () {
    var s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  var save_tree = function (tree) {
    if (local_storage_supported) {
      localStorage.setItem('fancytree', JSON.stringify(tree.toDict()));
    }
  }


// In real project, I'd probably use some template engine,
// but here it would be overkill.
  var dropdown_template = '' + 
'    <div id="selector">' +
'      <div id="search_container" class="search-container-light"><input id="search" name="search" type="text"></div>' +
'      <div id="create_element"><span>+ Create new element</span></div>' +
'      <div id="tree"></div>' +
'    </div>';

  var render_dropdown = function () {
    var source;
    if (!local_storage_supported || (source = localStorage.getItem('fancytree')) === null) {
      source = initial_source;
    } else {
      source = JSON.parse(source);
    }

    var rebind_hover = function () {
      $('#tree span.fancytree-node').hover(function (event) {
        $(this).addClass(drag_n_drop_in_progress ? 'fancytree-drop-target' : 'fancytree-hover');
      }, function (event) {
        $(this).removeClass('fancytree-drop-target');
        $(this).removeClass('fancytree-hover');
      });
    }

    $('body').append(dropdown_template);
    $('#create_element')[admin_mode ? 'show' : 'hide']();
    $('#tree').css('height', admin_mode ? '284px' : '326px');
    $('#tree').fancytree({
      extensions: admin_mode ? ['dnd', 'filter'] : ['filter'],
      quicksearch: true, 
      source: source,
      dnd: admin_mode ? {

        preventVoidMoves: true,
        preventRecursiveMoves: true,

        dragStart: function (node, data) {
          drag_n_drop_in_progress = true;
          return true;

        },
        dragEnter: function (node, data) {
          return true;
        },
        dragDrop: function (node, data) {
          data.otherNode.moveTo(node, data.hitMode);
          if (data.hitMode === 'over') {
            node.setExpanded(true);
          }
          data.otherNode.getParent().sortChildren();
          drag_n_drop_in_progress = false;
          rebind_hover();
          save_tree(data.otherNode.tree);
        }
      } : null,
      filter: {
        autoApply: true,
        mode: 'hide'
      },
      renderNode: function (event, data) {
        var node = data.node;
        if (admin_mode) {
          $(node.span).find('> img').remove();
          $(node.span).append('<img src="assets/images/icons/Drag-affordance.svg" class="affordance"><img src="assets/images/icons/Settings.svg" class="settings">');
        }
      },
      collapse: function (event, data) {
        data.node.setExpanded(true);
      },
      click: function (event, data) {
        $('#dropdown_field').attr('data-value', data.node.key);
        $('#dropdown_field').text(data.node.title);
        if (!admin_mode) {
          remove_dropdown();
        }
      }
    });


    rebind_hover();

    var tree = $('#tree').fancytree('getTree');
    var key;
    if ((key = $('#dropdown_field').attr('data-value')) !== '') {
      tree.activateKey(key);
    }

    $('#search').keyup(function (event) {
      var $this = $(this);
      var value = $this.val.bind($this);
      var match = value();

      if (event.which === $.ui.keyCode.ESCAPE || $.trim(match) === '') {
        value('');
        tree.clearFilter();
      } else {
        tree.filterNodes(match, {autoExpand: true});
      }
    }).focus(function () {
      $(this).parent().addClass('search-container-dark').removeClass('search-container-light');
    }).blur(function () {
      $(this).parent().addClass('search-container-light').removeClass('search-container-dark');
    });

    $('#create_element').click(function () {
      tree.getRootNode().addChildren([{title: guid()}]);
      save_tree(tree);
    });

    $('#admin_mode').prop('disabled', true);
    $('#dropdown_field').addClass('dropdown-field-dark').removeClass('dropdown-field-light');
    $('#selector').fadeIn();
    dropdown_shown = true;
  };

  remove_dropdown = function () {
    save_tree($('#tree').fancytree('getTree'));
    $('#selector').fadeOut(400, function () {
      $('#selector').remove();
      $('#dropdown_field').addClass('dropdown-field-light').removeClass('dropdown-field-dark');
    }); // promise?
    $('#admin_mode').prop('disabled', false);
    dropdown_shown = false;
  };

  $('#admin_mode').click(function () {
    admin_mode = $(this).prop('checked');
  });

  $('#dropdown_field').click(function () {
    if (dropdown_shown) {
      remove_dropdown();
    } else {
      render_dropdown();
    }
  })
});
