tinyMCEPopup.requireLangPack();

var oldWidth, oldHeight, ed, url;

function setStr(pl, p, n) {
	var f = document.forms[0], e = f.elements[(p != null ? p + "_" : '') + n];
	if (typeof(pl[n]) == "undefined")
		return;
	if (e.type == "text")
		e.value = pl[n];
	else
		selectByValue(f, (p != null ? p + "_" : '') + n, pl[n]);
}

function getStr(p, n, d) {
	var e = document.forms[0].elements[(p != null ? p + "_" : "") + n];
	var v = e.type == "text" ? e.value : e.options[e.selectedIndex].value;
	if (n == 'src')
		v = tinyMCEPopup.editor.convertURL(v, 'src', null);
	return ((n == d || v == '') ? '' : n + ":'" + jsEncode(v) + "',");
}

function jsEncode(s) {
	s = s.replace(new RegExp('\\\\', 'g'), '\\\\');
	s = s.replace(new RegExp('"', 'g'), '\\"');
	s = s.replace(new RegExp("'", 'g'), "\\'");
	return s;
}

function generatePreview(c){
	var f = document.forms[0], p = document.getElementById('prev'), h = '', wp, hp, nw, nh;

	p.innerHTML = '<!-- x --->';

	nw = parseInt(f.width.value);
	nh = parseInt(f.height.value);
	
	var url_portal = tinyMCEPopup.getWindowArg('plugin_url');
	var link = f.url.value;
	var cont = link.lastIndexOf("/"); 
	var video = link.slice(cont+1);
	var url = link.slice(0,cont);
	
	if (nw == ""){
		nw = '320px';
	}
	if (nh == ""){
		nh = '240px';
	}
		
	if (f.width.value != "" && f.height.value != "") {
		if (f.constrain.checked) {
			if (c == 'width') {
				wp = nw / oldWidth;
				nh = Math.round(wp * nh);
				f.height.value = nh;
			}else if (c == 'height') {
					hp = nh / oldHeight;
					nw = Math.round(hp * nw);
					f.width.value = nw;
				};
		};
	};

	if (f.width.value != "")
		oldWidth = nw;

	if (f.height.value != "")
		oldHeight = nh;
	
	if (url != null){
		h+='<div id="'+ video +'_wrapper" style="position: relative; width:'+nw+'px; height: '+nh+'px;">';
		h+='<object height="100%" width="100%" type="application/x-shockwave-flash"' ;
		h+='	data="player/player.swf" bgcolor="#000000" id="'+video+'"' ;
		h+='	name="'+video+'" tabindex="0"><param name="allowfullscreen" value="true">';
		h+='	<param name="allowscriptaccess" value="always">';
		h+='	<param name="seamlesstabbing" value="true">';
		h+='	<param name="wmode" value="opaque">';
		h+='	<param name="flashvars" value="netstreambasepath='+url+'&amp;id='+video+'&amp;file='+video+'&amp;streamer='+url+'&amp;controlbar.position=bottom">';
		h+='</object>';
		h+='</div>';
	};

	p.innerHTML = "<!-- x --->" + h;
	
};
function updatePreview() {
	var f = document.forms[0];
	f.width.value = f.width.value || '320';
	f.height.value = f.height.value || '240';
	generatePreview();
};

var VideoDialog = {
	init : function() {
		var f = document.forms[0];
		var pl = "", f, val = "";
		var context = tinyMCEPopup.editor.selection.getNode();
		
		// Get the selected contents as text and place it in the input
		if (context == "[object HTMLImageElement]") {
			f.url.value = context['title'];
			f.height.value = context['height'];
			f.width.value = context['width'];
			
			// Setup form
			if (pl != "") {
				pl = tinyMCEPopup.editor.plugins.media._parse(pl);
			
				setStr(pl, null, 'width');
				setStr(pl, null, 'height');
				
				if (f.width.value != "")
					pl.width = f.width.value = val;
	
				if (f.height.value != "")
					pl.height = f.height.value = val;
	
				oldWidth = pl.width ? parseInt(pl.width) : 0;
				oldHeight = pl.height ? parseInt(pl.height) : 0;
			}else{
				oldWidth = oldHeight = 0;
			};
			
			generatePreview();
		//f.width.value = tinyMCEPopup.getWindowArg('some_custom_arg');
		
		};
	},

	insert : function() {
		var f = document.forms[0];
		var link_video = f.url.value;
		var height = f.height.value;
		var width = f.width.value;
		
		var cont = link_video.lastIndexOf("/"); 
		var video = link_video.slice(cont+1);
		var url = link_video.slice(0,cont);
		
		var src = "'url':"+link_video+",'width':"+width+",'height':"+height;
		
		var id = video.replace('_','');
		id = id.replace('.flv','');
		
		var h = '<img class="mceItemVideoFlash" src="' + tinyMCEPopup.getWindowArg('plugin_url') + '/img/player.png"' ;
		h += ' title="'+link_video+'"';
		h += ' width="' + width + '"';
		h += ' height="' + height + '"';
		h += ' />';
		
		var s =' <script type="text/javascript">';
			s+=' $f("'+id+'", "/player/flowplayer-3.2.7.swf", {';
			s+='  clip: {';
   			s+=' 		url: "'+video+'",';
	  		s+='		provider: "influxis"';
			s+=' 			},';
			s+=' 			plugins: {';
			s+='				influxis: {';
			s+='					url: "/player/flowplayer.rtmp-3.2.3.swf",';
			s+='					netConnectionUrl: "'+url+'"';
			s+='				}';
			s+='			}';
			s+='		});';
			s+='	</script>';
	
		// Insert the contents from the input into the document
		a = '';
		a += "<a id='"+id+"' class='autoFlowPlayer player' style='display:block;width:'"+width+"';height:'"+height+"';cursor:pointer;'>"+h;
		a += '</a>'
		
		html =""
		html +="<div style='display:block;width:'"+width+"';height:'"+height+"';cursor:pointer;'>"+a+s+"</div>";
		
		var ctx = tinyMCEPopup.editor.selection.getContent();
		
		tinyMCEPopup.editor.execCommand('mceInsertContent', false, html);
		tinyMCEPopup.close();
	}
	
};

tinyMCEPopup.onInit.add(VideoDialog.init, VideoDialog);