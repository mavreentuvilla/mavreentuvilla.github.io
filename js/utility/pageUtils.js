//This namespace contains method used for page loading - to ensure a proper single page application structure
var pageUtils = {
	
	//method to get id from hash
	//NOTE: hashVal is obtained from document.location.hash that is never null. It can be empty. It is also properly trimmed
	getIdFromHash : function(hashVal) {
		if(hashVal.length <= 1) {
			return '';
		} else {
			return hashVal.substring(1);
		}
	},
	
	//method to get pageId for an id obtained from hash
	//NOTE: id is obtained indirectly from document.location.hash that is never null. It can be empty. It is also properly trimmed
	getPageIdForId : function(id) {
		//if id is empty, return defaultId
		if(id.length === 0) {
			return utils.defaultId;
		} else {
			//return results
			if(id.startsWith(utils.aboutMeId)) {
				return utils.aboutMeId;
			}
			if(id.startsWith(utils.researchId)) {
				return utils.researchId;
			}
			//if any other wrong option is passed, just return defaultId while also alerting user
			alert('Page Not found!');
			return utils.defaultId;
		}
	},
	
	//method to load a page and also scroll as needed to given id
	//NOTE: all id(s) are indirectly obtained from window.location.hash that is never null, so no need to do unnecessary checks
	loadPageToId : function(pageId, id, existPageId) {
		//if existPageId is empty, it means this is first time loading page. So load the navBar
		if(existPageId.length===0) {
			pageUtils.loadTopNavbarSync();
		}
		//set new page content if needed
		//[VERY VERY IMPORTANT] HOWEVER.. note that once page content is loaded, it is needed to move the hash. It will not be automatically done if the href link was not present earlier and is added by newly loaded page. Even more, since page loading is asynchronous, so the method to make the hash-change has to be passed as a done-callback. BUT, since the logic of href change is based on local variables, the function needs to define a "closure" and pass that.
		if(pageId!==existPageId) {
			alwaysCallback = pageUtils.getHrefChangeFunction(pageId, id);
			pageUtils.setPageContentAsync(pageId, alwaysCallback);
		}
		//no else part: If pageId and existPageId are same, then no new page is loaded. Then, in existing page, if the link existed, it would have already gone there. If it did not go - link does not exist
		//Note that there is logic needed that whenever a href is clicked, then og:meta should change. If the page is already loaded and then user clicks hrefs in it, then it is responsibility of that page to take action. But it may be that a valid hash is given by user for first time - then correct og needs to be set. To handle such scenarios - classes are made with name "hrefTarget" + "_ogChangeClass" and the click handler defined in corresponding js page. Here, just invoke it..
		if(id.startsWith(pageId) && id.length > pageId.length) {
			// trigger click on only one element of all selected. This is sufficent to change og-meta
			$('.' + utils.getOgChangeClassForHrefTarget(id)).first().trigger('click'); 
		}
	},
	
	//method returning a function iwth logic on how the window.location.has should be changed
	getHrefChangeFunction : function(pageId, id) {
		//The main logic is : If pageId is defaultId because user gave wrongId to begin with, then change hash to pageId. Else change hash to id.
		
		//BUT.. do not use the following
			/*
			if(id.startsWith(pageId)) {
				return function() {window.location.hash = '#' + id;}
			} else {
				return function() {window.location.hash = '#' + pageId;}
			}
			*/
		
		//IN ABOVE, if it is indeed required to go to #id, and not #pageId; then since the value is already given by user, window may not change. So even though new content is loaded, window scroll won't be at correct location. If you try window.location.reload(), then it triggers fresh load, creating new document - but that's what we just did and we only wanted to scroll to a hash location. Thus, an infinite lop is triggered. So, best thing - first, always load #pageId. Now the full dom is available, and then switch to #id if needed.
			if(id.startsWith(pageId)) {
				return function() {window.location.hash = '#' + pageId; window.location.hash = '#' + id;}
			} else {
				return function() {window.location.hash = '#' + pageId;}
			}
	},
	
	//method to load topNavbar
	loadTopNavbarSync : function() {
		$('#body_topNavbar').load('html/navbarContent.html');
	},
	
	//method to set content of newly loaded page
	setPageContentAsync : function(pageId, alwaysCallback) {
		//at this moment pageId cannot be null, empty or any wrong value - that is taken care by defaultId. Also pageId won't have # prefix
		//So just put logic for correct cases
		if(pageId===utils.aboutMeId) {
			aboutMe.loadPageAsync(alwaysCallback);
		}
		if(pageId===utils.researchId) {
			research.loadPageAsync(alwaysCallback);
		}
	}
}