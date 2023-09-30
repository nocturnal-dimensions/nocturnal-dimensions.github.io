var ab_shown = false;//if arbox was prepared and displayed
var ab_n = 0;//article to continue from (for async styling)
var ab_c = $('div#arbox div.article');//collection of all articles
var ab_int = false;//interval reference
var ab_int_show = false;//show interval reference
var ab_n_show=0;//iterator for show function
var ab_w = 0;//width of arbox
var ab_l = 0;//index of current element in the line
var ab_linew = 0;//remaining width in the line
var ab_linew0 = 0;//starting left margin of the line
var ab_totalh = 0;//height of arbox
var ab_n_precalc = false;//if measures for current n have been calculated
var ab_font_size_d = 16.2;
var ab_font_fam_d = ab_c.eq(0).children('.description').css('font-family');
var ab_font_style_d = ab_c.eq(0).children('.description').css('font-style')+" ";
var ab_font_size_h = 26.8;
var ab_font_fam_h = ab_c.eq(0).children('h2').css('font-family');
var ab_font_style_h = ab_c.eq(0).children('h2').css('font-weight')+" ";
var ab_font_red = 0;
var ab_font_space_d = 0;//size of the preserved space per line
var ab_font_space_h = 0;
var ab_s = {};//arrays for line precalcs
ab_s[0] = {}; ab_s[1] = {}; ab_s[2] = {};
var ab_vleft = 0;//how many lines have passed since the last vertical article on the left
var ab_vright = 0;
var ab_scroll = -1;
var ab_scroll_el = -2;//which element was in focus
var ab_scroll_int = false;//timeout for scroll
var ab_scroll_prev = window.pageYOffset;//previous scroll pos
var ab_scroll_c = 0;//scroll interval run counter
const AB_N_PER_STEP = 5;//how many to style per step (for async styling)
const AB_WAIT_PER_STEP = 16;//miliseconds between steps (for async styling)
const AB_MARGIN = 16;//margin between elements
const AB_MARGIN_VERT = 22;//vertical element margin
const AB_MARGIN_VERT_INSIDE = 4+4+2;//margin for header (2 is from img top padding, 4 - desc margin-top)
const AB_MIN_WIDTH = 500;//min width of document for tiles styling
const AB_MARGIN_MIN_WIDTH = 8;//horizontal margins in min_width mode
const AB_MAX_FONT_REDUCTION = 0.7;//font reduction of the original
const AB_FONT_REDUCTION_MULT = 1.1;//multiplication step for the font
const AB_FONT_LINE_SPACE = "      ";//how many spaces to add per line for wrapping accounting
const AB_FONT_TIME_WIDTH = 71+8+12;//the length of time mark with space
const AB_FONT_TIME_HEIGHT = 19.35+2;//the height of time mark with space
const AB_FONT_LH_D = 1.1;//line-height
const AB_FONT_LH_H = 1.1;
const AB_ARBOX_WIDTH_MIN_CHANGE = 20;//min document width change for restyling
const AB_ARBOX_MAX_WIDTH = 1000;//max width from css
const AB_LINE_HEIGHT = 120;//default line height
const AB_IMG_PADDING = 2;//image padding
const AB_TEXT_PADDING = 8;//text padding
const AB_TEXT_PADDING_VERT = 6;//text padding
const AB_VERT_MAX_WIDTH = 250;//max width for verticle article
const AB_VERT_MIN_WIDTH = 165;//min width for verticle article
const AB_MIN_WIDTH_MAX_HEIGHT = 400;//max height in min_width mode
const AB_HOR_MIN_WIDTH = 250;//min width for horizontal article
const AB_SHOW_DELAY = 0.1;//delay between show animations
const AB_SHOW_TIME = 0.4;//length of a show animation
var ab_canvas = document.createElement("canvas");
ab_canvas = ab_canvas.getContext("2d");
var ab_arbox_width_min_change = Math.max(scrollbar_size+1, AB_ARBOX_WIDTH_MIN_CHANGE)


var _AB_V_a1 = -4*AB_IMG_PADDING*AB_TEXT_PADDING_VERT
var _AB_V_a2 = (-2*AB_LINE_HEIGHT - AB_MARGIN_VERT + AB_MARGIN_VERT_INSIDE + AB_FONT_TIME_HEIGHT)
function ab_fit_vert(i){
	//solve qubic equation for real solution
	var lhh = ab_s[i]['font_h']*AB_FONT_LH_H
	var lhd = ab_s[i]['font_d']*AB_FONT_LH_D
	var sh = ab_font_space_h*ab_s[i]['font_h']/ab_font_size_h
	var sd = ab_font_space_d*ab_s[i]['font_d']/ab_font_size_d
	var lh = ab_s[i]['lh']+sh*1.5//sh here is not needed strictly speaking, but in case of only 1-2 lines and a long word being wrapped it will likely prevent overflow
	var ld = ab_s[i]['ld']+sd//sd is extra here too - can add any other safety constant
	var padtext = 2*AB_TEXT_PADDING_VERT
	var a2p = padtext*_AB_V_a2
	var c = _AB_V_a1*padtext +
		  ab_s[i]['imgw']*((padtext)*(a2p-lhd*(padtext+AB_FONT_TIME_WIDTH)) -(padtext+sd)*lhh*lh -(padtext+sh)*lhd*ld) +
		  sh*(ab_s[i]['imgw']*(a2p-lhd*(padtext+AB_FONT_TIME_WIDTH)+lhh*padtext)+_AB_V_a1) +
		  sd*(ab_s[i]['imgw']*a2p+_AB_V_a1 + sh*(ab_s[i]['imgw']*(_AB_V_a2+lhh)-2*AB_IMG_PADDING))
	var b = -2*_AB_V_a1 + padtext*padtext +
		  ab_s[i]['imgw']*(lhd*(2*padtext+AB_FONT_TIME_WIDTH)-2*a2p+lhh*lh+lhd*ld) +
		  sh*(padtext+2*AB_IMG_PADDING-ab_s[i]['imgw']*(_AB_V_a2+lhh-lhd)) +
		  sd*(padtext+2*AB_IMG_PADDING-ab_s[i]['imgw']*_AB_V_a2 + sh)
	var a = ab_s[i]['imgw']*(_AB_V_a2-lhd) -2*(padtext+AB_IMG_PADDING)-sd-sh
	var q = (a*a-3*b)/9
	var r = (2*a*a*a - 9*a*b + 27*c)/54
	var q3 = q*q*q
	var s = q3-r*r
	if(s<0) return false;
	var phi = Math.acos(r/Math.sqrt(q3))/3
	var w = -2*Math.sqrt(q)*Math.cos(phi-2.0943951023931954923)-a/3;//2*pi/3
	var wmax = -2*Math.sqrt(q)*Math.cos(phi+2.0943951023931954923)-a/3;//2*pi/3
	
	w = Math.max(w, AB_VERT_MIN_WIDTH);
	var nd = Math.max(Math.ceil((sd-AB_FONT_TIME_WIDTH-ld)/(padtext+sd-w)),1)
	var nh = Math.max(Math.ceil((sh-lh)/(padtext+sh-w)),1)//prevent negative if lh<=sh
	var w_h=0;var w_d=0
	if(ab_s[i]['imgw']==0)wmax=AB_VERT_MAX_WIDTH
	
	//search for solution of the inequality with ceiling
	while(w <= wmax) {
		if((ab_s[i]['imgw']>0 ? (w - 2*AB_IMG_PADDING)/ab_s[i]['imgw'] : 0) + nh*lhh + (nd-1)*lhd <= -_AB_V_a2){//minimal solution found
			ab_s[i]['vw'] = Math.ceil(w);
			return true;
		}
		if(nd==1&&nh==1)return false;//after testing last combination 1&1 solution wasn't found
		
		//decrease one line
		a = Math.max(1, nh-1)//nh candidate
		b = Math.max(1, nd-1)//nd candidate
		w_h = padtext + sh + (lh - sh)/a
		w_d = padtext + sd + (ld - sd + AB_FONT_TIME_WIDTH)/b
		if((w_h < w_d && nh!=1)||nd==1){w = w_h; nh = a}
		else if((w_h > w_d && nd!=1)||nh==1){w = w_d; nd = b}
		else{w = w_h; nh = a; nd = b}//w_h==w_d
	}
	return false;
}

var _AB_H_a1 = AB_LINE_HEIGHT - AB_MARGIN_VERT_INSIDE - AB_FONT_TIME_HEIGHT
function ab_fit_hor(i){
	//solve quadratic equation for real solution
	var lhh = ab_s[i]['font_h']*AB_FONT_LH_H
	var lhd = ab_s[i]['font_d']*AB_FONT_LH_D
	var sh = ab_font_space_h*ab_s[i]['font_h']/ab_font_size_h
	var sd = ab_font_space_d*ab_s[i]['font_d']/ab_font_size_d
	var lh = ab_s[i]['lh']+sh*1.5//sh here is not needed strictly speaking, but in case of only 1-2 lines and a long word being wrapped it will likely prevent overflow
	var ld = ab_s[i]['ld']+sd
	var ai = AB_IMG_PADDING + AB_TEXT_PADDING*2 + ab_s[i]['imgw']*(AB_LINE_HEIGHT-2*AB_IMG_PADDING)
	var aH = _AB_H_a1 + lhd
	var a_d = (ld-sd+AB_FONT_TIME_WIDTH)*lhd
	var a_h = (lh-sh)*lhh
	var c = ai + 0.5*(sd + sh + (a_d+a_h)/aH)
	var d = 4*a_d*aH*(sd-sh) + Math.pow(a_d+a_h+aH*(sh-sd),2)
	var w = c;
	if(d>0) w = c+0.5*Math.sqrt(d)/aH
	
	w = Math.max(w, AB_HOR_MIN_WIDTH)
	var nd = Math.max(Math.ceil((sd-AB_FONT_TIME_WIDTH-ld)/(ai+sd-w)),1)
	var nh = Math.max(Math.ceil((sh-lh)/(ai+sh-w)),1)
	var w_h=0;var w_d=0

	//search for solution of the inequality with ceiling
	while(true) {
		if(nh*lhh + (nd-1)*lhd <= _AB_H_a1){//minimal solution found
			ab_s[i]['hw'] = Math.ceil(w);
			return true;
		}
		if(nd==1&&nh==1)return false;//after testing last combination 1&1 solution wasn't found
		
		//decrease one line
		a = Math.max(1, nh-1)//nh candidate
		b = Math.max(1, nd-1)//nd candidate
		w_h = ai + sh + (lh - sh)/a
		w_d = ai + sd + (ld - sd + AB_FONT_TIME_WIDTH)/b
		if((w_h < w_d && nh!=1)||nd==1){w = w_h; nh = a}
		else if((w_h > w_d && nd!=1)||nh==1){w = w_d; nd = b}
		else{w = w_h; nh = a; nd = b}//w_h==w_d
	}
}

function ab_fit_hor_height(i){
	//solve qubic equation for real solution
	var lhh = ab_s[i]['font_h']*AB_FONT_LH_H
	var lhd = ab_s[i]['font_d']*AB_FONT_LH_D
	var sh = ab_font_space_h*ab_s[i]['font_h']/ab_font_size_h
	var sd = ab_font_space_d*ab_s[i]['font_d']/ab_font_size_d
	var lh = ab_s[i]['lh']+sh*1.5
	var ld = ab_s[i]['ld']+sd
	var w = ab_w-ab_arbox_width_min_change-2*AB_TEXT_PADDING-2*AB_MARGIN_MIN_WIDTH-AB_IMG_PADDING
	var hp = AB_MARGIN_VERT_INSIDE+AB_FONT_TIME_HEIGHT-lhd
	var v1 = 2*AB_IMG_PADDING*ab_s[i]['imgw']+w
	var c = hp*(v1*(sh+sd-v1)-sh*sd) + lhh*(sh-lh)*(v1-sd) + lhd*(sd-ld-AB_FONT_TIME_WIDTH)*(v1-sh)
	c = c/Math.pow(ab_s[i]['imgw'],2)
	var b = (2*hp*ab_s[i]['imgw']+v1)*v1 + sd*sh - (sd+sh)*(ab_s[i]['imgw']*hp + v1) + ab_s[i]['imgw']*(lhh*(lh-sh)+lhd*(ld+AB_FONT_TIME_WIDTH-sd))
	b = b/Math.pow(ab_s[i]['imgw'],2)
	var a = (sd+sh - 2*v1)/ab_s[i]['imgw'] - hp
	var q = (a*a-3*b)/9
	var r = (2*a*a*a - 9*a*b + 27*c)/54
	var q3 = q*q*q
	var s = q3-r*r
	if(s<0) return false;
	var phi = Math.acos(r/Math.sqrt(q3))/3
	var h = -2*Math.sqrt(q)*Math.cos(phi)-a/3;//2*pi/3
	var hmax = -2*Math.sqrt(q)*Math.cos(phi-2.0943951023931954923)-a/3;//2*pi/3
	
	h = Math.max(h, AB_LINE_HEIGHT);
	var nd = Math.max((sd-AB_FONT_TIME_WIDTH-ld)/(ab_s[i]['imgw']*h+sd-v1),0.01)
	var nh = Math.max((sh-lh)/(ab_s[i]['imgw']*h+sh-v1),0.01)//prevent negative if lh<=sh
	var h_h=0;var h_d=0
	
	//search for solution of the inequality with ceiling
	while(h <= hmax) {
		if( Math.ceil(nh)*lhh + Math.ceil(nd)*lhd <= h-hp){//minimal solution found
			ab_s[i]['hh'] = Math.ceil(h);
			return true;
		}
		if(nh+nd>=80)return false;//protection against eternal loop
		
		//increase one line
		a = Math.floor(nh)+1//nh candidate
		b = Math.floor(nd)+1//nd candidate
		h_h = (sh-lh+a*(v1-sh))/(a*ab_s[i]['imgw'])
		h_d = (sd-ld-AB_FONT_TIME_WIDTH+b*(v1-sd))/(b*ab_s[i]['imgw'])
		if(h_h < h_d){h = h_h; nh = a; if(Math.ceil(nd)==nd)nd+=.1}
		else if(h_h > h_d){h = h_d; nd = b; if(Math.ceil(nh)==nh)nh+=.1}
		else{h = h_h; nh = a; nd = b}//h_h==h_d
	}
	return false;
}

function ab_fit_vert_height(i){
	var lhh = ab_s[i]['font_h']*AB_FONT_LH_H
	var lhd = ab_s[i]['font_d']*AB_FONT_LH_D
	var sh = ab_font_space_h*ab_s[i]['font_h']/ab_font_size_h
	var sd = ab_font_space_d*ab_s[i]['font_d']/ab_font_size_d
	var lh = ab_s[i]['lh']+sh*1.5
	var ld = ab_s[i]['ld']+sd
	var w = ab_w-ab_arbox_width_min_change-2*AB_MARGIN_MIN_WIDTH
	var nd = Math.max(Math.ceil((sd-AB_FONT_TIME_WIDTH-ld)/(2*AB_TEXT_PADDING+sd-w)),1)
	var nh = Math.max(Math.ceil((sh-lh)/(2*AB_TEXT_PADDING+sh-w)),1)//prevent negative if lh<=sh
	ab_s[i]['vh'] = Math.max(Math.ceil(AB_MARGIN_VERT_INSIDE+AB_FONT_TIME_HEIGHT + (ab_s[i]['imgw']>0 ? (w-2*AB_IMG_PADDING)/ab_s[i]['imgw'] : 0) + nh*lhh + (nd-1)*lhd), AB_LINE_HEIGHT)
	return true
}

function ab_scroll_defered(){
	ab_scroll_c++
	if(window.pageYOffset!=ab_scroll_fake||ab_scroll_c==32){
		window.scrollTo(window.pageXOffset,Math.min(ab_scroll_prev,$(document).height()-$(window).height()));
		$('html,body').stop(true).animate({'scrollTop': ab_scroll},330,'swing',ab_scroll_defered_free_el)
		window.clearInterval(ab_scroll_int);ab_scroll_int=false;
		return true;
	}
	window.scrollTo(window.pageXOffset,ab_scroll_fake);
}
function ab_scroll_defered_free_el(){ab_scroll_el=-2;}



function ab_resize(e){
	if(e!==undefined){
		if(ab_w-$('div#arbox').width()>=ab_arbox_width_min_change||$('div#arbox').width()>=ab_w+1){
			ab_n=0//reset current n on resize
		} else {
			return false;//exit on small resize
		}
	}
	
	var nps = 0;
	if(ab_n==0){//initial setups
		if(ab_int!==false){window.clearInterval(ab_int); ab_int=false;}
		if(AB_N_PER_STEP<=ab_c.length) ab_int = window.setInterval(ab_resize, AB_WAIT_PER_STEP);
		
		//detect current scroll element
		if(ab_scroll_int!==false){window.clearInterval(ab_scroll_int); ab_scroll_int=false}
		$('html,body').stop(true)
		if(e!==undefined){
			if(ab_scroll_el==-2){//new scroll element
				ab_scroll = $(window).scrollTop()
				while(nps < ab_c.length){
					if(ab_scroll < ab_c.eq(nps).offset().top){break}
				nps++}
				if(nps==0&&ab_c.eq(nps).offset().top-ab_scroll > 40)ab_scroll_el=-1
				else ab_scroll_el=nps
			}
			ab_scroll=-1//set to recalc scroll position later when ready
		} else ab_scroll_el=-2
		
		ab_w = Math.min($('div#arbox').width() + ($(window).height()<$(document).height() ? scrollbar_size : 0), AB_ARBOX_MAX_WIDTH);//arbox with hidden scrollbar
		if(ab_c.css('position')!='absolute')ab_c.css({'display': 'block', 'position': 'absolute'});
		if(ab_shown)ab_c.css('visibility', 'hidden')
		else ab_c.css('display', 'none')
		ab_l = 0;
		ab_canvas.font = ab_font_style_h+ab_font_size_h+"px "+ab_font_fam_h
		ab_font_space_h = ab_canvas.measureText(AB_FONT_LINE_SPACE).width
		ab_canvas.font = ab_font_style_d+ab_font_size_d+"px "+ab_font_fam_d
		ab_font_space_d = ab_canvas.measureText(AB_FONT_LINE_SPACE).width
		ab_n_precalc = false;
		ab_linew = ab_arbox_width_min_change+AB_MARGIN;
		ab_linew0 = AB_MARGIN
		ab_totalh = 0;
		ab_vleft=0; ab_vright=0;
	}
	
	nps = 0;
	while(ab_n < ab_c.length){
		var ob = ab_c.eq(ab_n)
		ab_layout_chosen = false;
		if(!ab_n_precalc){
			ab_s[ab_l]['ob'] = ob
			//calc image size
			var img = ob.children('img'); ab_s[ab_l]['img'] = img;
			ab_s[ab_l]['imgw'] = (img.length ? parseFloat(img.attr('data-ratio')) : 0)
			//calc header width
			var h = ob.children('h2'); ab_s[ab_l]['h'] = h;
			ab_s[ab_l]['font_h'] = AB_MAX_FONT_REDUCTION*ab_font_size_h;
			ab_canvas.font = ab_font_style_h+ab_s[ab_l]['font_h']+"px "+ab_font_fam_h
			ab_s[ab_l]['lh'] = ab_canvas.measureText(h.html()).width
			//calc description width
			var d = ob.children('.description'); ab_s[ab_l]['d'] = d;
			ab_s[ab_l]['font_d'] = ab_font_size_d*AB_MAX_FONT_REDUCTION;
			ab_canvas.font = ab_font_style_d+ab_s[ab_l]['font_d']+"px "+ab_font_fam_d
			ab_s[ab_l]['ld'] = (d.length ? ab_canvas.measureText(d.html()).width : 0)
			ab_s[ab_l]['hw'] = -1; ab_s[ab_l]['vw'] = -1;
			ab_s[ab_l]['adj'] = false;//fonts not adjusted
		} else {//was precalced in the previous line
			ab_n_precalc = false;
		}
		
		
		if(ab_w>AB_MIN_WIDTH){
		
		ab_s[ab_l]['lay'] = 0;//horizontal by default
		//horizontal article
		if(ab_s[ab_l]['hw']==-1){if(!ab_fit_hor(ab_l))ab_s[ab_l]['hw']=0}
		//vertical article possible
		if(((ab_vleft<=0&&ab_l==0)||(ab_vright<=0&&ab_l==2&&ab_vleft<=2&&(ab_vleft==2||ab_s[0]['lay']!=1)))&&ab_c.length-ab_n>=3){
			if(ab_s[ab_l]['vw']==-1){if(!ab_fit_vert(ab_l) || ab_s[ab_l]['vw']>AB_VERT_MAX_WIDTH)ab_s[ab_l]['vw']=0}
			//select vertical layout
			if(ab_s[ab_l]['vw']>0&&(ab_s[ab_l]['vw']<ab_s[ab_l]['hw']||ab_s[ab_l]['hw']<=0))ab_s[ab_l]['lay'] = 1;
		}
		
		//if the last element doesnt fit - translate it to the next line
		if((ab_s[ab_l]['lay']==1? ab_s[ab_l]['vw'] : ab_s[ab_l]['hw'])+AB_MARGIN+ab_linew > ab_w){ab_n_precalc=true; ab_n--;}
		else{ab_linew+=(ab_s[ab_l]['lay']==1? ab_s[ab_l]['vw'] : ab_s[ab_l]['hw'])+AB_MARGIN}
		
		
		//close line - 3 elements or couldnt fit the last one or last element or right is occupied by a vertical
		if(ab_l==2||ab_n_precalc||ab_n+1==ab_c.length||(ab_vright==2&&ab_l==1)){
			if(ab_n_precalc&&(ab_l==0||(ab_l==1&&ab_vleft==2))){//force fit if no elements per line
				ab_n_precalc = false; ab_n++;
				ab_s[ab_l]['imgw'] = 0; ab_fit_hor(ab_l)// try to fit again without picture
				ab_linew += ab_s[ab_l]['hw']+AB_MARGIN
				if(ab_s[ab_l]['lay']==1){ab_s[ab_l]['lay'] = 0;}
			}
			else if(ab_l==1&&ab_n_precalc&&ab_s[0]['lay']==1){//fallback to horizontal if only 1 element in the line
				ab_s[0]['lay'] = 0; ab_linew += ab_s[0]['hw'] - ab_s[0]['vw']
				if(ab_linew > ab_w){// try to fit again without picture
					ab_linew -= ab_s[0]['hw']
					ab_s[0]['imgw'] = 0; ab_fit_hor(0)
					ab_linew += ab_s[0]['hw']
				}
			}
			
			var _t = ab_l-ab_n_precalc+1-(ab_vleft==2 ? 1 : 0);//number of elements
			var _i = -1; var _w = 0; var _l = 0; var _fh = 0; var _fd = 0; var _adj=0;
			//iterate over elements to increase fontSize
			do {
				_i = (_i+1)%_t
				_l = _i+(ab_vleft==2 ? 1 : 0)
				if(ab_s[_l]['adj'])continue;
				_w = (ab_s[_l]['lay']==1 ? ab_s[_l]['vw'] : ab_s[_l]['hw'])
				//increase font
				_fh = ab_s[_l]['font_h'];
				ab_s[_l]['font_h'] = Math.min(Math.floor(ab_s[_l]['font_h']*AB_FONT_REDUCTION_MULT*10)*0.1, ab_font_size_h)
				ab_canvas.font = ab_font_style_h+ab_s[_l]['font_h']+"px "+ab_font_fam_h
				ab_s[_l]['lh'] = ab_canvas.measureText(ab_s[_l]['h'].html()).width
				_fd = ab_s[_l]['font_d'];
				ab_s[_l]['font_d'] = Math.min(Math.floor(ab_s[_l]['font_d']*AB_FONT_REDUCTION_MULT*10)*0.1, ab_font_size_d)
				ab_canvas.font = ab_font_style_d+ab_s[_l]['font_d']+"px "+ab_font_fam_d
				ab_s[_l]['ld'] = (ab_s[_l]['d'].length ? ab_canvas.measureText(ab_s[_l]['d'].html()).width : 0)
				//check
				if(ab_s[_l]['lay']==1){
					if(!ab_fit_vert(_l) || ab_linew+ab_s[_l]['vw']-_w>ab_w){//didnt work -> return to previous step
						ab_s[_l]['adj']=true; _adj++;
						ab_s[_l]['vw']=_w
						ab_s[_l]['font_h']=_fh; ab_s[_l]['font_d']=_fd;
					} else ab_linew+=ab_s[_l]['vw']-_w
				} else {
					if(!ab_fit_hor(_l) || ab_linew+ab_s[_l]['hw']-_w>ab_w){
						ab_s[_l]['adj']=true; _adj++;
						ab_s[_l]['hw']=_w
						ab_s[_l]['font_h']=_fh; ab_s[_l]['font_d']=_fd;
					} else ab_linew+=ab_s[_l]['hw']-_w
				}
				if(!ab_s[_l]['adj']&&ab_s[_l]['font_h']==ab_font_size_h){//max font size reached
					ab_s[_l]['adj']=true; _adj++;
				}
			} while (_adj<_t)
			//stretch horizontal containers
			_adj = Math.max(0, (ab_w - ab_linew)/(_t - ((ab_s[0]['lay']==1&&ab_vleft!=2)||ab_s[_t-1+(ab_vleft==2 ? 1 : 0)]['lay']==1 ? 1 : 0)))
			
			
			//apply changes
			for(_i=0; _i<_t; _i++){
				_l = _i+(ab_vleft==2 ? 1 : 0)
				//reset vleft vright
				if(_l==0&&ab_s[_l]['lay']==1)ab_vleft=3
				else if(_l==2&&ab_s[_l]['lay']==1)ab_vright=3
				_fh = (_l+1)/(_t+1+(ab_vleft==2||ab_vright==2 ? 1 : 0))//temp constant for smooth margins
				_fd = parseInt(ab_s[_l]['lay']==0&&ab_s[_l]['imgw']>0&&Math.round(Math.random()))//if horizontal should be right aligned
				ab_s[_l]['ob'].css({
					'width': (ab_s[_l]['lay']==1 ? ab_s[_l]['vw'] : ab_s[_l]['hw']+_adj),
					'height': (ab_s[_l]['lay']==1 ? 2*AB_LINE_HEIGHT+AB_MARGIN_VERT : AB_LINE_HEIGHT),
					'margin-top': ab_totalh,
					'margin-left': ab_linew0,
					'left': 'calc('+((ab_arbox_width_min_change-ab_w)*_fh)+'px + '+(100*_fh)+'%)'
				})
				ab_s[_l]['h'].css({'font-size': ab_s[_l]['font_h'], 'padding-right': (ab_s[_l]['lay']==1 ? AB_TEXT_PADDING_VERT : (_fd==1 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING)), 'padding-left': (ab_s[_l]['lay']==1 ? AB_TEXT_PADDING_VERT : (_fd==0 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING))});
				ab_s[_l]['d'].css({'font-size': ab_s[_l]['font_d'], 'padding-right': (ab_s[_l]['lay']==1 ? AB_TEXT_PADDING_VERT : (_fd==1 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING)), 'padding-left': (ab_s[_l]['lay']==1 ? AB_TEXT_PADDING_VERT : (_fd==0 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING))});
				if(ab_s[_l]['img'].length){
					if(ab_s[_l]['lay']==1){
						ab_s[_l]['img'].css({'margin-right': AB_IMG_PADDING, 'margin-left': AB_IMG_PADDING, 'width': ab_s[_l]['vw']-2*AB_IMG_PADDING, 'height': (ab_s[_l]['vw']-2*AB_IMG_PADDING)/ab_s[_l]['imgw'], 'float': 'none', 'display': 'block'});
					} else {
						if(ab_s[_l]['imgw']==0) ab_s[_l]['img'].css('display', 'none')
						else ab_s[_l]['img'].css({'margin-right': AB_IMG_PADDING, 'margin-left': AB_IMG_PADDING, 'width': (AB_LINE_HEIGHT-2*AB_IMG_PADDING)*ab_s[_l]['imgw'], 'height': AB_LINE_HEIGHT-2*AB_IMG_PADDING, 'float': (_fd==1 ? 'right' : 'left'), 'display': 'block'});
					}
				}
				ab_s[_l]['ob'].children('.time').css({'right': (_fd==1 ? ab_s[_l]['img'].width()+AB_IMG_PADDING+8 : 8)})
				if(ab_s[_l]['lay']==1) ab_s[_l]['ob'].addClass('alt')
				else ab_s[_l]['ob'].removeClass('alt')
				ab_linew0 += (ab_s[_l]['lay']==1 ? ab_s[_l]['vw'] : ab_s[_l]['hw']+_adj)+AB_MARGIN
				
				if(ab_shown) ab_s[_l]['ob'].css('visibility', 'visible')
			}
			
			//precalc next line width
			ab_linew = ab_arbox_width_min_change+AB_MARGIN;
			ab_linew0 = AB_MARGIN;
			var _sw = (ab_vleft==2&&ab_l==1 ? ab_linew : AB_MARGIN)//store initial left position of the line
			if(ab_vleft==3){
				ab_linew+=ab_s[0]['vw']+AB_MARGIN
				ab_linew0+=ab_s[0]['vw']+AB_MARGIN
				if(ab_n_precalc){
					_t = ab_s[1]; ab_s[1] = ab_s[ab_l]; ab_s[ab_l] = _t;
				}
				ab_l=1
			} else {
				if(ab_n_precalc){
					_t = ab_s[0]; ab_s[0] = ab_s[ab_l]; ab_s[ab_l] = _t;
				}
				ab_l=0
			}
			if(ab_vright==3)ab_linew+=ab_s[2]['vw']+AB_MARGIN
			//convert scroll element to scroll position
			if(ab_scroll_el>-1&&ab_scroll<0&&ab_scroll_el<=ab_n)ab_scroll=ab_totalh-AB_MARGIN_VERT+$('div#arbox').offset().top+parseInt($('div#arbox').css('padding-top'))
			//add height
			ab_totalh += AB_LINE_HEIGHT+AB_MARGIN_VERT
			ab_vleft--; ab_vright--
		} else {
			ab_l++;
		}
		

		
		} else {//min-width fallback
		
		//vertical article
		ab_fit_vert_height(ab_l)
		//horizontal article possible
		if(ab_s[ab_l]['imgw']>0&&ab_fit_hor_height(ab_l)&&ab_s[ab_l]['hh']<=ab_s[ab_l]['vh']&&ab_s[ab_l]['hh']<=AB_MIN_WIDTH_MAX_HEIGHT)ab_s[ab_l]['vh']=0;
		//vertical article too big - remove picture
		if(ab_s[ab_l]['vh']!=0&&ab_s[ab_l]['vh']>AB_MIN_WIDTH_MAX_HEIGHT){
			ab_s[ab_l]['imgw']=0; ab_fit_vert_height(ab_l)
		}
		
		
		//increase font
		var _w = 0; var _fh = 0; var _fd = 0;
		do {
			_w = (ab_s[ab_l]['vh']==0 ? ab_s[ab_l]['hh'] : ab_s[ab_l]['vh'])
			//increase font
			_fh = ab_s[ab_l]['font_h'];
			ab_s[ab_l]['font_h'] = Math.min(Math.floor(ab_s[ab_l]['font_h']*AB_FONT_REDUCTION_MULT*10)*0.1, ab_font_size_h)
			ab_canvas.font = ab_font_style_h+ab_s[ab_l]['font_h']+"px "+ab_font_fam_h
			ab_s[ab_l]['lh'] = ab_canvas.measureText(ab_s[ab_l]['h'].html()).width
			_fd = ab_s[ab_l]['font_d'];
			ab_s[ab_l]['font_d'] = Math.min(Math.floor(ab_s[ab_l]['font_d']*AB_FONT_REDUCTION_MULT*10)*0.1, ab_font_size_d)
			ab_canvas.font = ab_font_style_d+ab_s[ab_l]['font_d']+"px "+ab_font_fam_d
			ab_s[ab_l]['ld'] = (ab_s[ab_l]['d'].length ? ab_canvas.measureText(ab_s[ab_l]['d'].html()).width : 0)
			//check
			if(ab_s[ab_l]['vh']==0){
				if(!ab_fit_hor_height(ab_l) || ab_s[ab_l]['hh']>_w+AB_LINE_HEIGHT || ab_s[ab_l]['hh']>AB_MIN_WIDTH_MAX_HEIGHT){//didnt work -> return to previous step
					ab_s[ab_l]['adj']=true;
					ab_s[ab_l]['hh']=_w
					ab_s[ab_l]['font_h']=_fh; ab_s[ab_l]['font_d']=_fd;
				}
			} else {
				if(!ab_fit_vert_height(ab_l) || ab_s[ab_l]['vh']>_w+AB_LINE_HEIGHT || ab_s[ab_l]['vh']>AB_MIN_WIDTH_MAX_HEIGHT){
					ab_s[ab_l]['adj']=true;
					ab_s[ab_l]['vh']=_w
					ab_s[ab_l]['font_h']=_fh; ab_s[ab_l]['font_d']=_fd;
				}
			}
			if(!ab_s[ab_l]['adj']&&ab_s[ab_l]['font_h']==ab_font_size_h){//max font size reached
				ab_s[ab_l]['adj']=true;
			}
		} while(!ab_s[ab_l]['adj'])
		
		//apply changes
		_fh = 0.5//temp constant for smooth margins
		_fd = parseInt(ab_s[ab_l]['vh']==0&&Math.round(Math.random()))//if horizontal should be right aligned
		ab_s[ab_l]['ob'].css({
			'width': ab_w-ab_arbox_width_min_change-2*AB_MARGIN_MIN_WIDTH,
			'height': (ab_s[ab_l]['vh']==0 ? ab_s[ab_l]['hh'] : ab_s[ab_l]['vh']),
			'margin-top': ab_totalh,
			'margin-left': AB_MARGIN_MIN_WIDTH,
			'left': 'calc('+((ab_arbox_width_min_change-ab_w)*_fh)+'px + '+(100*_fh)+'%)'
		})
		ab_s[ab_l]['h'].css({'font-size': ab_s[ab_l]['font_h'], 'padding-right': (ab_s[ab_l]['vh']!=0 ? AB_TEXT_PADDING_VERT : (_fd==1 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING)), 'padding-left': (ab_s[ab_l]['vh']!=0 ? AB_TEXT_PADDING_VERT : (_fd==0 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING))});
		ab_s[ab_l]['d'].css({'font-size': ab_s[ab_l]['font_d'], 'padding-right': (ab_s[ab_l]['vh']!=0 ? AB_TEXT_PADDING_VERT : (_fd==1 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING)), 'padding-left': (ab_s[ab_l]['vh']!=0 ? AB_TEXT_PADDING_VERT : (_fd==0 ? AB_TEXT_PADDING-AB_IMG_PADDING : AB_TEXT_PADDING))});
		if(ab_s[ab_l]['img'].length){
			if(ab_s[ab_l]['vh']!=0){
				if(ab_s[ab_l]['imgw']==0) ab_s[ab_l]['img'].css('display', 'none')
				else ab_s[ab_l]['img'].css({'margin-right': AB_IMG_PADDING, 'margin-left': AB_IMG_PADDING, 'width': ab_s[ab_l]['ob'].width()-2*AB_IMG_PADDING, 'height': (ab_s[ab_l]['ob'].width()-2*AB_IMG_PADDING)/ab_s[ab_l]['imgw'], 'float': 'none', 'display': 'block'});
			} else {
				ab_s[ab_l]['img'].css({'margin-right': AB_IMG_PADDING, 'margin-left': AB_IMG_PADDING, 'width': (ab_s[ab_l]['hh']-2*AB_IMG_PADDING)*ab_s[ab_l]['imgw'], 'height': ab_s[ab_l]['hh']-2*AB_IMG_PADDING, 'float': (_fd==1 ? 'right' : 'left'), 'display': 'block'});
			}
		}
		ab_s[ab_l]['ob'].children('.time').css({'right': (_fd==1 ? ab_s[ab_l]['img'].width()+AB_IMG_PADDING+8 : 8)})
		ab_s[ab_l]['ob'].removeClass('alt')
		
		if(ab_shown) ab_s[ab_l]['ob'].css('visibility', 'visible')
		
		//convert scroll element to scroll position
		if(ab_scroll_el>-1&&ab_scroll<0&&ab_scroll_el<=ab_n)ab_scroll=ab_totalh-AB_MARGIN_VERT+$('div#arbox').offset().top+parseInt($('div#arbox').css('padding-top'))
		//add height
		ab_totalh += (ab_s[ab_l]['vh']==0 ? ab_s[ab_l]['hh'] : ab_s[ab_l]['vh'])+AB_MARGIN_VERT
		}
		
		nps++; ab_n++
		if(nps>=AB_N_PER_STEP&&(ab_l==0||(ab_l==1&&ab_vleft==2)))return true//defer to next step
	}
	
	//cycle finished
	if(ab_int!==false){window.clearInterval(ab_int); ab_int=false;}
	$('div#arbox').css('height', ab_totalh)
	ab_n=0;
	//scroll animation
	if(ab_scroll<0)ab_scroll=0
	if(ab_scroll_el>-2&&Math.abs(ab_scroll-window.pageYOffset)>1){
		//ios safari fix - force fake impossible scroll value until it normalizes on rotation finish
		ab_scroll_fake=(window.pageYOffset > ($(document).height()-$(window).height())*0.5 ? $(document).height()-$(window).height()+5 : -2);
		ab_scroll_prev = window.pageYOffset; ab_scroll_c=0;
		ab_scroll_int = window.setInterval(ab_scroll_defered,16)
		window.scrollTo(window.pageXOffset,ab_scroll_fake)
		ab_scroll_defered()
	} else ab_scroll_el=-2;//dont scroll and release the binded element
	
	if(!ab_shown){//start showing animation
		ab_shown=true;
		ab_c.css({'opacity': 0, 'transform': 'translateY(-60px)', 'display': 'block'}).addClass('appearing');
		ab_n_show=0;
		ab_int_show = window.setInterval(function(){
			if(ab_n_show>=ab_c.length&&ab_c.eq(-1).hasClass('shown')){window.clearInterval(ab_int_show); return true;}
			if(ab_n_show<ab_c.length)ab_c.eq(ab_n_show).css('opacity', 1).css('transform', 'translateY(0px)')
			
			var _i = ab_n_show-Math.ceil(AB_SHOW_TIME/AB_SHOW_DELAY)-2//little delay 2 for lagging animation synch
			if(_i>=0){
				ab_c.eq(_i).css('opacity', '').css('transform', '').removeClass('appearing').addClass('shown')
			}
			ab_n_show++;
		}, AB_SHOW_DELAY*1000);
	}
}
var wanh =""; var t=0
$(window).resize(ab_resize)
ab_resize()