//extra-files preloading after document is fully loaded
$(window).on("load",function(){
	//images
	$.get( "/com/about_arrow2.png");
	$.get( "/com/comacat.png");
	$.get( "/com/back_arrow.png");
	$.get( "/com/back_arrow_reverse.png");
	$.get( "/com/butt_cross.png");
	$.get( "/com/title.gif");
	
	//about-arrow show-up
	window.setTimeout(function(){ $('#headabout_arrow').fadeTo(1000, 1, 'linear'); }, 1000);
	
	//jBox
	jBox_register_all();
	
	//column arrows
	$('.col.arrow').after('<div class="col_arrow"><div></div></div>')
	
	//add comments section if they are loaded
	if($('#remark42').length&&$('#remark42').children('iframe').length)$('#remark42').before('<h5>Comments</h5>')
})

var _headabout_activated = false;
$('div#headabout_anchor').click(function(){
	if(_headabout_activated) return true;
	_headabout_activated = true;
	
	$('div#headabout_box').css('opacity', 0);
	$(this).css('cursor', 'default');
	$('div#headtitle > div.overlay').css('visibility', 'visible').css('opacity', 1);
	
	$('div#aboutbox').stop(true).slideDown({
		duration: 400,
		progress: window_resize,
		complete: function(){$('div#aboutbox').css('height', 'auto')}
	})
})
$('div.aboutarrow').click(function(){
	if(_headabout_activated==false) return true;
	_headabout_activated = false;
	
	$('div#headabout_box').css('opacity', 1);
	$('div#headabout_anchor').css('cursor', 'pointer');
	$('div#headtitle > div.overlay').css('opacity', '');
	
	$('div#aboutbox').stop(true).slideUp({
		duration: 400,
		progress: window_resize
	})
})


//detect scrollbar size
$('body').css('overflow-y', 'hidden')
var scrollbar_size = $(document).width()
$('body').css('overflow-y', 'auto')
$('div#cbox').height($(window).height()+100)
scrollbar_size -= $(document).width()
$('div#cbox').css('height', 'auto')
var mathjax_win_size = $(window).width();
function window_resize(e){
	$('div#aboutarrow_push').height('auto');
	if($('div#aboutbox').css("display")!='none' && $('div#aboutarrow_in').css("display")!='none'){
		var h = Math.max($('div#abouttext').outerHeight(true), $('div#aboutportrait').outerHeight(true)); var a = $('div#aboutarrow_in').outerHeight(true);
		$('div#aboutarrow_push').height(h-a);
		
		//fix back-forth jumps
		h = Math.max($('div#abouttext').outerHeight(true), $('div#aboutportrait').outerHeight(true))-h;
		if(h>1)$('div#aboutarrow_push').height($('div#aboutarrow_push').height()+h);
	}
	//rerender_math
	if(e!==undefined&&Math.abs($(window).width()-mathjax_win_size)>10){
		mathjax_win_size = $(window).width();
		try{MathJax.Hub.Queue(["Rerender",MathJax.Hub],register_mathjax_ref);}catch(error){}
	}
}
$(window).resize(window_resize)
window_resize();


function jBox_register_all() {
	$('.tooltip').each(function(index){//for each trigger
		var o = $(this);
		if(!o.prop("jBox_created")){
			var jb = new jBox('Tooltip', {
				attach: o,
				responsiveWidth: true,
				responsiveHeight: true,
				responsiveMinWidth: 180,
				maxWidth: 600,
				closeOnEsc: true,
				closeOnMouseleave: true,
				animation: {open: 'zoomIn', close: 'zoomOut'},
				position: {
					x: 'left',
					y: 'top'
				},
				outside: 'y',
				pointer: 'left:35',
				offset: {
					x: 20
				},
				content: o.next('ins'),
				adjustPosition:	true,
				adjustDistance: {top: 50, right: (8+scrollbar_size), bottom: 8, left: 8},
				adjustTracker: true,
				onOpen: function(){
					$(this.attachedElements[0]).addClass('active');
				},
				onClose: function(){
					$(this.attachedElements[0]).removeClass('active');
				}
			});
			if (jb){
				o.prop("jBox_created", true);
				$("body").bind("touchstart", function(e){ if(jb.isOpen){ if(!jb.wrapper.find(e.target).length&&!jb.wrapper.is(e.target)){jb.close(); }} });
				o.bind("touchend", function(e){ if(!jb.isOpen&&!jb.isClosing){jb.open({target: o})} });
			}
		}
	});
}

var scroll_to_int = false;
var scroll_to_target = 0;
var scroll_to_prog = 0;
var scroll_to_cur = 0;
var scroll_to_back = 0;
var scroll_to_back_fin = 0;
var scroll_wheel = 0;
function scroll_to(o){
	if(o!==undefined){
		if(scroll_to_int!==false){window.clearInterval(scroll_to_int); scroll_to_int=false}
		if(typeof o == 'number'){
			scroll_to_target = o;
		} else {
			o = $(o); if(o.length==0)return false;
			scroll_to_target = Math.min(o.offset().top-parseFloat(o.css('padding-top'))-parseFloat(o.css('margin-top'))-3, $(document).height()-$(window).height())
		}
		scroll_to_back = parseInt(window.pageYOffset);
		if(Math.abs(scroll_to_back-scroll_to_target)<=10){return false;}
		if(typeof o != 'number'){
			if(scroll_to_target>scroll_to_back){$('#back_arrow').removeClass('reverse')}
			else {$('#back_arrow').addClass('reverse')}
		}
		scroll_to_back_fin = 0;
		scroll_to_prog = 0; scroll_to_cur = window.pageYOffset;
		scroll_wheel = 0;
		scroll_to_int = window.setInterval(scroll_to, 16)
		return true;
	} else {
		if(scroll_to_prog>=1||scroll_wheel!=0){window.clearInterval(scroll_to_int); scroll_to_int=false; return true}
		scroll_to_prog += 0.025//speed
		scroll_to_cur = scroll_to_back + (1-Math.pow(scroll_to_prog-1,2))*(scroll_to_target-scroll_to_back)
		window.scrollTo(window.pageXOffset, scroll_to_cur)
	}
}
//scroll cancel trigers
window.addEventListener('wheel', function(e) {scroll_wheel = e.deltaY})
document.addEventListener('touchmove', function(e) {if(scroll_wheel==0)scroll_wheel = 1})
function scroll_register(e){
	e = $(e.currentTarget); var r=false;
	if((e.hasClass('ref')&&(e=/.*?(\d{1,3})/.exec(e.html()))!==null)||(e.hasClass('MathJax_ref')&&(e="mjx-eqn-"+/.*?(\d{1,3})/.exec(e.text())[1]) )){
		if(e[0]=='m')r=scroll_to($('#'+e).parents('.MathJax'))
		else r=scroll_to($('.refblock').find('tr').eq(parseInt(e[1])-1))
	} else {
		r=scroll_to(e.attr('data-target'))
	}
	if(r&&Math.abs(scroll_to_back-scroll_to_target)>=$(window).height()*0.4){
		if($('#back_arrow').css('display')!='none')$('#back_arrow').stop(true).fadeIn(300).delay(60000).fadeOut(2000)
		else $('#back_arrow').stop(true).delay(300).fadeIn(500).delay(60000).fadeOut(2000)
	}
}
//back_arrow events register
$('#back_arrow').click(function(e){if(scroll_to_back_fin!=2){scroll_to(scroll_to_back); $(e.currentTarget).stop(true).fadeOut(300); scroll_to_back_fin=2}})
$('#back_arrow').hover(function(e){if(scroll_to_back_fin!=2){$(e.currentTarget).stop(true).fadeIn(300);scroll_to_back_fin=0}},function(e){if(!scroll_to_back_fin)$(e.currentTarget).stop(true).fadeIn(300).delay(2000).fadeOut(2000);})
window.addEventListener('scroll', function(e) {if(scroll_to_int===false&&$('#back_arrow').css('display')!='none'&&!scroll_to_back_fin&&!$('#back_arrow').is(':hover')){$('#back_arrow').stop(true).fadeOut(1500);scroll_to_back_fin=1}})
//register all scroll invoking elements
$('.ref,.scroll').click(scroll_register)

//register images overlay
$('div.img > pre').click(function(e){
	if(Math.max($(e.currentTarget).parent().width()/$(window).width(),$(e.currentTarget).parent().children('div').innerHeight()/$(window).height())<0.8){
		var o = $(e.currentTarget).parent();
		var t = $('div#img_overlay').css('opacity', 0).css('display', 'block');
		var h = 0; var p; var i; var hh;
		if((p = o.children('p')).length){
			t.children('p').html(p.html())
			h = t.children('p').outerHeight(true)
		} else t.children('p').html("")
		if(!(i = o.find('object,img')).length)return false;
		i = (i.length==2&&i.eq(1).width()>0 ? i.eq(1) : i.eq(0))//if fallback to img only
		var d = t.children('div'); d.empty();
		h = $(window).height() - h - d.outerHeight(true) + d.height()
		if((hh = h - d.width()*(i.height()>0 ? i.height()/i.width() : i.parent().innerHeight()/i.parent().width())) >= 0){
			hh = hh*0.5+parseFloat(d.css('margin-top'));
			i.clone().css('width', '100%').css('margin-top', hh).appendTo(d)
			d.append('<div style="padding-bottom: '+(i.height()>0 ? i.height()/i.width() : i.parent().innerHeight()/i.parent().width())*100+'%; margin-top: '+(hh)+'px;"></div>')
		} else {
			hh = h/(i.height()>0 ? i.height()/i.width() : i.parent().innerHeight()/i.parent().width())
			i.clone().height(h).width(hh).appendTo(d)
			d.append('<div style="height: '+h+'px; width: '+hh+'px; margin-top:-'+h+'px; position: relative"></div>')
		}
		
		t.stop(true).animate({opacity: 1}, 500)
	}	
})
$(window).resize(function(e){
	var t = $('div#img_overlay');
	if(t.css('display')=='block'){
		var h = 0; var hh;
		if(t.children('p').length){
			h = t.children('p').outerHeight(true)
		}
		var i = t.find('object,img')
		var d = t.children('div');
		h = $(window).height() - h - d.outerHeight(true) + d.height()
		if((hh = h - d.width()*i.height()/i.width()) >= 0){
			hh = hh*0.5+parseFloat(d.css('margin-top'));
			i.attr('style', '').css('width', '100%').css('margin-top', hh)
			i.next().attr('style', '').css('padding-bottom', i.height()/i.width()*100+'%').css('margin-top', hh)
		} else {
			hh = h/(i.height()/i.width())
			i.attr('style', '').height(h).width(hh)
			i.next().attr('style', '').css('height', h).css('width', hh).css('margin-top', -h).css('position', 'relative')
		}
	}
})
$('div#img_overlay > pre').click(function(e){
	var t = $('div#img_overlay');
	if(t.css('display')=='block'){
		t.stop(true).fadeOut(400)
	}
})
$('div.img').hover(function(e){if(Math.max($(e.currentTarget).width()/$(window).width(),$(e.currentTarget).children('div').innerHeight()/$(window).height())<0.8)$(e.currentTarget).children('pre').addClass('shown')},function(e){$(e.currentTarget).children('pre').removeClass('shown')})

	
function fold_toggle(e){
	var o = $(e.currentTarget)
	if(o.parent().parent().hasClass('shown')){//hide
		o = o.parent().parent();
		o.children('div').eq(1).stop(true).slideUp(300);
		o.removeClass('shown');
		e.stopPropagation();
	}
	else if(!o.hasClass('shown')&&o.hasClass('fold')) {//show
		o.children('div').eq(1).stop(true).slideDown(300);
		o.addClass('shown')
		if(o.prop('win_size')===undefined||Math.abs(o.prop('win_size')-mathjax_win_size)>10){
			o.prop('win_size', mathjax_win_size)
			try{MathJax.Hub.Queue(["Rerender",MathJax.Hub,o[0]],[register_mathjax_ref,o]);}catch(error){}
		}
	}
}	
$('div.fold').click(fold_toggle);
$('div.fold pre').click(fold_toggle);

//column arrows
var _col_i=0;
var _col_o;
var _col_o0, _col_o1, _col_x;
window.addEventListener('scroll', function(e) {
	e=$('div#cbox div.col_arrow > div');
	if(e.css('display')=='none'){return true;}
	_col_o0 = parseInt(window.pageYOffset);
	_col_o1 = _col_o0+$(window).height()*0.9;
	for(_col_i=0; _col_i<e.length; _col_i++){
		_col_o = e.eq(_col_i)
		_col_x = parseInt(_col_o.offset().top);
		_col_o.parent().css('opacity', Math.max(0, 3/Math.pow(_col_o1-_col_o0,2)*(-Math.pow(_col_x, 2)+(_col_o1+_col_o0)*_col_x-_col_o1*_col_o0) ))
	}
})