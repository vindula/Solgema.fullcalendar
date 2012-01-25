/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var each = tinymce.each;
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('video');

	tinymce.create('tinymce.plugins.VideoPlugin', {
		init : function(ed, url) {
			var t = this;
			t.editor = ed;
			t.url = url;
			function isMediaElm(n) {
				return /^(mceItemVideoFlash)$/.test(n.className);
			};
			
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
			ed.addCommand('mceVideo', function() {
				ed.windowManager.open({
					file : url + '/dialog.htm',
					width : 520 + parseInt(ed.getLang('video.delta_width', 0)),
					height : 620 + parseInt(ed.getLang('video.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url // Plugin absolute URL
				});
			});

			// Register example button
			ed.addButton('video', {
				title : 'video.desc',
				cmd : 'mceVideo',
				image : url + '/img/video_rtmp.gif'
			});
			
			// Add a node change handler, selects the button in the UI when a image is selected
			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setActive('video', n.nodeName == 'IMG' && isMediaElm(n));
			});
			
			ed.onInit.add(function() {
				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(url + "/css/content.css");
			});
			ed.onSetContent.add(function() {
				t._spansToImgs(ed.getBody());
			});
		},
		createControl : function(n, cm) {
			return null;
		},
		getInfo : function() {
			return {
				longname : 'Video Rtmp plugin',
				author : 'Vindula',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/example',
				version : "1.0"
			};
		},
		_spansToImgs : function(p) {
			var t = this, dom = t.editor.dom, im, ci;
			
			each(dom.select('a', p), function(n) {
				// Convert object into image
				
				if (/(player)$/.test(dom.getAttrib(n, 'class'))) {
					each(dom.select('img', n), function(i){
						i.className = 'mceItemVideoFlash';
					});
					//dom.replace(t._createImg('mceItemVideoFlash', n), n);
					return;
				}
			});
		}
	});
	// Register plugin
	tinymce.PluginManager.add('video', tinymce.plugins.VideoPlugin);
})();