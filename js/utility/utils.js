//This namespace contains additional methods used commonly in code
var utils = {
	
	//DEFINING GLOBAL values under utils - since it is defined first among all JS
	//the global url to use when givng share href to different buttons. This needs to change if pages are hosted somewhere else
	serverHref : 'http://98.222.194.27:8000',
	multiPageHref : '/MULTIPAGE',
	singlePageHref : '/index.html',

	//Id for different page to load. Make the corresponding js with same name for convenience
	aboutMeId : 'aboutMe',
	researchId : 'research',
	defaultId : 'aboutMe', //this Id is returned by default for any bad cases
	
	//other constants
	textRevertAfterCopyTime : 3000, //time after which the text "Copied to clipboard" changes back to "Click to copy"
	
	//variables and constants used when triggering methods on window resize
	resizeTime : new Date(),
	windowResizeTime : 500, //play a callback method only if no resize happens within this time (in ms) since last resize
	windowResizeTimeBuffer : 20, //a buffer time
	
	//DEFINING UTILITY METHODS NOT DEPENDING ON ANY PARTICULAR PAGE BUT USED BY ALL
	//method to read file and get data
	getDataAjax : function(fileName) {
		return $.ajax({
			url: fileName,
			dataType: 'json'
		});
	},
	
	//method to add a div that does not show up itself, but causes page to scroll down by an amount after coming to a location
	getInvPageScrollDownElemWithIdAndWidth : function(id, width) {
		return '<div id="' + id + '" style="margin-top:-' + width + 'px; padding-top:' + width + 'px;"></div>'
	},
	
	//method to remove attributes from selector attached by other html
	//Usage: if only 1 input, that is the "javascript" (not jquery) selector. All attributes are removed
	//If 2nd optional input provided, the remove only those attributes
	removeAttributesFromElement : function(element, attribArr) {
		if(!attribArr) { //for case where only selector is passed
			for(var i = element.attributes.length - 1; i >= 0; i--){
				element.removeAttribute(element.attributes[i].name);
			}
		} else {
			for(var i = 0; i<attribArr.length; i++) {
				element.removeAttribute(attribArr[i]);
			}
		}
	},
	
	//method to get class name corresponding to href target. This class is attached to all elements that cause href change, and so should also change og meta
	//See pageUtils.loadPageToId for more information
	getOgChangeClassForHrefTarget : function(id) {
		return id + '_ogChangeClass';
	},
	
	//method to provide html-formatted element such that clicking it copies a data to clipboard
	copyOnClickButton : function(text) {
		return '<button type="button" class="btn btn-info copyOnClick" style="padding-left:1px;padding-right:1px" copy-target="' + text + '">COPY</button>';
	},
	
	//handler for copyOnClick class. 
	copyOnClickHandler : function() {
		$('.copyOnClick').on('click', function(event) {
			var sel = $(this);
			var textToCopy = sel.attr('copy-target');
			utils.copyToClipboard(textToCopy);
			if(utils.copyToClipboard(textToCopy)) {
				sel.html('copied'); 
				sel.removeClass('btn-info'); 
				sel.addClass('btn-success');
			} else {
				sel.html('failed'); 
				sel.removeClass('btn-info'); 
				sel.addClass('btn-danger');
			}
			window.setTimeout(function(){
				sel.html('COPY'); 
				sel.removeClass('btn-danger'); 
				sel.removeClass('btn-success'); 
				sel.addClass('btn-info'); 
			}, utils.textRevertAfterCopyTime);
		});
	},
	
	// [copyOnClickHandler helper method] method with logic to copy data. Taken from http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript   and   https://jsfiddle.net/fx6a6n6x/
	// Copies a string to the clipboard. Must be called from within an event handler such as click. May return false if it failed, but this is not always possible. Browser support for Chrome 43+, Firefox 42+, Safari 10+, Edge and IE 10+. For IE: The clipboard feature may be disabled by an administrator. By default a prompt is shown the first time the clipboard is used (per session).
	copyToClipboard : function(text) {
		if (window.clipboardData && window.clipboardData.setData) {
			// IE specific code path to prevent textarea being shown while dialog is visible.
			return clipboardData.setData("Text", text); 
		} else {
			if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
				var textarea = document.createElement("textarea");
				textarea.textContent = text;
				textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
				document.body.appendChild(textarea);
				textarea.select();
				try {
					return document.execCommand("copy");  // Security exception may be thrown by some browsers.
				} catch (ex) {
					console.warn("Copy to clipboard failed.", ex);
					return false;
				} finally {
					document.body.removeChild(textarea);
				}
			} else {
				return false;
			}
		}
	},
	
	//method to attach a given handler to be invoked on window resize
	setHandlerToWindowResize : function(data, func) {
		$(window).on('resize', null, data, function() {
			utils.resizeTime = new Date();
			window.setTimeout(function(){
				if((new Date().getTime() - utils.resizeTime.getTime()) > (utils.windowResizeTime - utils.windowResizeTimeBuffer)) {
					func(data);
				}
			}, utils.windowResizeTime);
		});
	},
}