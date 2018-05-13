//this name contains methods used to load the research page
var research = {

	//file containing research information
	researchFile : 'data/research.json',
	pageOgPicFile : 'image/MT.jpg', //the file containing image linked by og metadata
	//variable guiding carousel time (in ms)
	carouselTime : 3000,
	//variable guiding if accordion containing subResearch information should be set to have same height. Change as needed
	setSameHeightInSubResearchAccordion : true,
	//custom window width attribute added to accordion to help in resizing
	windowWidthAtReloadId : 'windowWidthAtReload',
	//custom accordion height attribute added to accordion to help in resizing
	accordionHtByCalcId : 'accordionHtByCalcId',
	
	//method performing loading of webpage. If needed, do a ajax file read and set them as callback methods
	loadPageAsync : function(extAlwaysCallback) {
		//set <head> elements
		research.setHeadDescription();
		research.setHeadKeywords();
		research.setHeadTitle();
		research.setHeadPageId();
		research.setOg();
		//set <body> elements
		research.setBodyJumbotron();
		//carousel is set later because it is based of research data
		research.setBodyBreadcrumb();
		//set primary content within <body>
		utils.getDataAjax(research.researchFile)
			.done( function(data) {
				research.setBodyCarousel(data);
				research.setBodyContent(data);
			}) 
			.fail(function(data) { 
				//container class is put so that error sign fits in page layout
				$('#body_content').html('<div class="container"><div class="alert alert-danger" role="alert">Details unavailable. Please try later.</div></div>');
			})
			.always(function() {
				extAlwaysCallback();
			});
	},
	
	//method to set head_description
	setHeadDescription : function() {
		$('#head_description').attr('content','Mavreen\'s research');
	},
	
	//method to set head_keywords
	setHeadKeywords : function() {
		$('#head_keywords').attr('content','Mavreen, Tuvilla, Research');
	},
	
	//method to set head_title
	setHeadTitle : function() {
		$('#head_title').html('Mavreen\'s Research');
	},
	
	//method to set head_pageId
	setHeadPageId : function() {
		$('#head_pageId').attr('content',utils.researchId);
	},
	
	//method to set og meta in head
	setOg: function() {
		$('#head_og_title').attr('content','Mavreen\'s Research');
		$('#head_og_url').attr('content',utils.serverHref + utils.multiPageHref + '/' + utils.researchId);
		$('#head_og_image').attr('content',utils.serverHref + '/' + research.pageOgPicFile);
	},
	
	//method to set body_jumbotron
	setBodyJumbotron : function() {
		$('#body_jumbotron').html(''); //remove any previously set values
	},
	
	//method to set body_breadcrumb
	setBodyBreadcrumb : function() {
		$('#body_breadcrumb').html('Home / Research')
			.attr('style','margin-top: 30px; margin-bottom: 30px;'); //no need of large top-margin as in "About Me" because it comes after carousel
	},
	
	//method to set body_carousel
	setBodyCarousel : function(researchList) {
		//make carousel content using research data
		var carouselSlide = research.getCarouselSlide(researchList);
		var carouselInner = research.getCarouselInner(researchList);
		var carouselContent = research.getCarouselContentUsingSlideAndInner(carouselSlide, carouselInner);
		//set carousel content
		$('#body_carousel').html(carouselContent);
		//it is seen that carousel does not immediately start after loading. So, it is triggered by javascript
		$('.carousel').carousel({
             interval: research.carouselTime
         });
	},
	
	// [START OF] carousel helper methods -------------------------------------------------------------------------------
	//[carousel helper method] method to get carousel id. This is not id of <div> with #body_carousel, but of carousel put inside it
	getCarouselId : function() {
		return researchUtils.getResearchPageIdForGiven('carousel');
	},
	
	//[carousel helper method] method to get carousel slide
	//string.format options to reduce overhead are not used, since data can be complex and printf can break formatting
	getCarouselSlide : function(researchList) {
		var str = '';
		for(var i = 0, size = researchList.length; i < size ; i++){
			if(i===0) {
				str = str + '<li data-target="#' + research.getCarouselId() + '" data-slide-to="' + i + '" class="active"></li>';
			} else {
				str = str + '<li data-target="#' + research.getCarouselId() + '" data-slide-to="' + i + '"></li>';
			}
		}
		return str;
	},
	
	//[carousel helper method] method to get carousel inner
	//string.format options to reduce overhead are not used, since data can be complex and printf can break formatting
	getCarouselInner : function(researchList) {
		var str = '';
		//when preparing "carousel-inner" html, don't make <a href> across the image. 
		//That triggers click from image to corresponding target, but then it becomes very difficult for user to click the carousel-dots just to move it
		for(var i = 0, size = researchList.length; i < size ; i++){
			if(i===0) {
				str = str + '<div class="item active">' //class active for one item
						+ '<img src="' + researchUtils.getResearchUnitImage(researchList[i]) + '" alt="' + researchUtils.getResearchUnitTitle(researchList[i]) + '">' //add image for single carousel slide
						+ '<div class="carousel-caption">' //div enclosing carousel-caption, itself comprised on header and small description
						+ '<h4><a href="#' + research.getIdForHrefToResearchTitleOnClick(researchList[i]) + '" class="' + utils.getOgChangeClassForHrefTarget(research.getIdForHrefToResearchTitleOnClick(researchList[i])) + '">' + researchUtils.getResearchUnitTitle(researchList[i]) + '</a></h4>' //header caption in carousel
						+ '<p>(' + researchUtils.getResearchUnitStartDate(researchList[i]) + " to " + researchUtils.getResearchUnitEndDate(researchList[i]) + ') ' + researchUtils.getResearchUnitOneLineDescription(researchList[i]) + '</p>' //brief description in carousel 
						+ '</div>' //closing div containing image caption
						+ '</div>'; //closing div of item
			} else {
				str = str + '<div class="item">' //class active not set for others
						+ '<img src="' + researchUtils.getResearchUnitImage(researchList[i]) + '" alt="' + researchUtils.getResearchUnitTitle(researchList[i]) + '">' //add image for single carousel slide
						+ '<div class="carousel-caption">' //div enclosing carousel-caption, itself comprised on header and small description
						+ '<h4><a href="#' + research.getIdForHrefToResearchTitleOnClick(researchList[i]) + '" class="' + utils.getOgChangeClassForHrefTarget(research.getIdForHrefToResearchTitleOnClick(researchList[i])) + '">' + researchUtils.getResearchUnitTitle(researchList[i]) + '</a></h4>' //header caption in carousel
						+ '<p>(' + researchUtils.getResearchUnitStartDate(researchList[i]) + " to " + researchUtils.getResearchUnitEndDate(researchList[i]) + ') ' + researchUtils.getResearchUnitOneLineDescription(researchList[i]) + '</p>' //brief description in carousel 
						+ '</div>' //closing div containing image caption
						+ '</div>'; //closing div of item
			}
		}
		return str;
	},
	
	//[carousel helper method] method to get carousel content
	//string.format options to reduce overhead are not used, since data can be complex and printf can break formatting
	getCarouselContentUsingSlideAndInner : function(slide, inner) {
		return '<div id="' + research.getCarouselId() + '" class="carousel slide" data-ride="carousel">' 
				+ '<!-- Indicators --><ol class="carousel-indicators">' + slide + '</ol>'
				+ '<!-- Wrapper for slides --><div class="carousel-inner" role="listbox">' + inner + '</div>' 
				+ '<!-- Controls --><a class="left carousel-control" href="#' + research.getCarouselId() + '" role="button" data-slide="prev"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span><span class="sr-only">Previous</span></a>'
				+ '<a class="right carousel-control" href="#' + research.getCarouselId() + '" role="button" data-slide="next"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span><span class="sr-only">Next</span></a></div>';
	},
	// [END OF] carousel helper methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	//method to set content in body
	setBodyContent : function(researchList) {
		utils.removeAttributesFromElement(document.body); //remove attributes from <body> added by research page
		var researchContent = research.getResearchContent(researchList); //get research content
		var sidebarContent = research.getSidebarContent(researchList); //get sidebar content
		//set new html
		$('#body_content').html('<div class="container"><div class="row">' //main container
							+ '<div class="col-sm-12 col-md-10">' + researchContent + '</div>' //research content
							+ '<nav class="col-md-2 visible-md visible-lg hidden-print bs-docs-sidebar" id="' + research.getScrollSpyIdForSideNav() + '" role="complementary">' + sidebarContent + '</nav>'
							+ '</div></div>'); //closing main containers
		
		//ONLY AFTER COMMITTING DOM CHANGES - call the javascript to trigger the functionalities
		research.activateScrollSpy(); //activate scrollspy and affix
		research.activateAccordion(researchList); //enable collapsible accordion on all subResearch elements added. 
		//If the flag is set -- Identify max height for an accordion and set all with same height. Also register the handler so it is called on window resizing
		if(research.setSameHeightInSubResearchAccordion) {
			research.setSameHeightOnAccordion(researchList);
			utils.setHandlerToWindowResize(researchList, research.setSameHeightOnAccordion);
		}
		research.openAccordionOnSideNavClick(researchList); //JS to enable functionality that when sidebar clicked, then accordion also opens
		research.activateOgChangeOnClick(researchList); //JS to enable that when certain class clicked, the corresponding og meta changes
		utils.copyOnClickHandler(); //activate the click-to-copy handler
	},
	
	// [START OF] content helper methods -------------------------------------------------------------------------------
	//[content helper method] method to get scrollspy id
	getScrollSpyIdForSideNav : function() {
		researchUtils.getResearchPageIdForGiven('scrollSpy');
	},
	
	//[content helper method] method to get id of element which is "href"'d to when clicking research title
	getIdForHrefToResearchTitleOnClick : function(researchUnit) {
		return researchUtils.getResearchUnitId(researchUnit) + '_titleHrefDest';
	},

	//[content helper method] method to get share buttons provided with header
	getShareButtons : function(id, title, description, image) {
		var multiPageUrl = utils.serverHref + utils.multiPageHref + '/' + id + '.html';
		var singlePageUrl = utils.serverHref + utils.singlePageHref + '#' + id;
		var url_encoded = encodeURI(multiPageUrl);
		var title_encoded = encodeURI(title);
		var desc_encoded = encodeURI(description);
		var img_encoded = encodeURI(utils.serverHref + '/' + image);

		//For some of the link url(s) used, see: http://www.sharelinkgenerator.com/
		//copy url
		var urlCopy_button = '<div class="btn-group aboutMe_social"><button type="button" class="btn btn-social-icon btn-primary"><i class="fa fa-clipboard"></i></button>' + utils.copyOnClickButton(singlePageUrl) + '</div>'; 
		//facebook
		var fb_button = '<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-facebook" '
			+ 'href="//www.facebook.com/share.php?u=' + url_encoded + '&amp;t=' + title_encoded
			+ '" target="_blank"><i class="fa fa-facebook"></i></a></div>'; //ok but not so good
		//google-plus
		var goog_button = '<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-google" '
			+ 'href="//plus.google.com/share?url=' + url_encoded
			+ '" target="_blank"><i class="fa fa-google-plus"></i></a></div>'; //ok but not so good, better than fb
		//linkedin
		var li_button = '<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-linkedin" '
			+ 'href="//www.linkedin.com/shareArticle?mini=true&url=' + url_encoded + '&amp;title=' + title_encoded + '&amp;summary=' + desc_encoded
			+ '" target="_blank"><i class="fa fa-linkedin"></i></a></div>'; //ok, but not so good, like google
		//twitter
		var twt_button = '<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-twitter" '
			+ 'href="//twitter.com/intent/tweet?url=' + url_encoded + '&amp;source=tweetButton&amp;text=' + title_encoded
			+ '" target="_blank"><i class="fa fa-twitter"></i></a></div>';  //ok actually, can append "@" after title text since it show like "[text] [url]"
		
		/* NO NEED FOR THESE...
		//pinterest
		var pin_button='<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-pinterest" '
			+ 'href="//pinterest.com/pin/create/button/?url=' + url_encoded + '&amp;media=' + img_encoded + '&amp;description=' + title_encoded 
			+ '" target="_blank"><i class="fa fa-pinterest"></i></a></div>'; //not working, says url is invalid
		//redditt
		var rd_button = '<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-reddit" '
			+ 'href="//www.reddit.com/submit?url=' + url_encoded + '&amp;title=' + title_encoded
			+ '" target="_blank"><i class="fa fa-reddit"></i></a></div>';
		//stumbleupon -- using btn-google because btn-stumbleupon is not there
		var su_button = '<div class="btn-group aboutMe_social"><a type="button" class="btn btn-social-icon btn-google" '
			+ 'href="//www.stumbleupon.com/badge?url=' + url_encoded
			+ '" target="_blank"><i class="fa fa-stumbleupon"></i></a></div>'; //submit form comes but then does not work
		*/

		return '<div class="btn-toolbar" aria-label="share options">' + urlCopy_button + fb_button + goog_button + li_button + twt_button + '</div>';
		
	},
	
	//[content helper method] method to bind handlers to change og-meta
	activateOgChangeOnClick : function(researchList){
		for(var i=0, size=researchList.length; i<size; i++) {
			$('.' + utils.getOgChangeClassForHrefTarget(research.getIdForHrefToResearchTitleOnClick(researchList[i])))
				.on('click', null, researchList[i], function(event){
					$('#head_og_title').attr('content', researchUtils.getResearchUnitTitle(event.data) + ' [' + researchUtils.getResearchUnitOneLineDescription(event.data) + ']');
					$('#head_og_url').attr('content',utils.serverHref + utils.multiPageHref + '/' + research.getIdForHrefToResearchTitleOnClick(event.data));
					$('#head_og_image').attr('content',utils.serverHref + '/' + researchUtils.getResearchUnitImage(event.data));
				});
		}
	},
	
	//[content helper method] method to get research content
	getResearchContent : function(researchList) {
		var researchContent = '';
		for(var i = 0, size = researchList.length; i < size ; i++){
			researchContent = researchContent 
						+ '<div class="' + utils.getOgChangeClassForHrefTarget(research.getIdForHrefToResearchTitleOnClick(researchList[i])) + '">' //class wrapping entire research content to enable setting click handler to change og:meta
						+ '<div class="row"><div class="col-xs-12">' //use a new row and full spanning column in row to contain data
						+ utils.getInvPageScrollDownElemWithIdAndWidth(research.getIdForHrefToResearchTitleOnClick(researchList[i]), 70) //add an element which is href'd to when clicking on any link that want to scroll to research title
						+ '<div class="parallaxScroll" style="background-image: url('+researchUtils.getResearchUnitImage(researchList[i])+');"></div>' //adding research image with parallax scroll
						+ '<div class="researchUnitHeadWithShare">' //adding an enclosing div so as to get title and share buttons on same line
						+ '<h2 class="header">' + researchUtils.getResearchUnitTitle(researchList[i]) + '</h2>' //adding title
						+ '<div class="non-header">' 
							+ research.getShareButtons(research.getIdForHrefToResearchTitleOnClick(researchList[i]), researchUtils.getResearchUnitTitle(researchList[i]), researchUtils.getResearchUnitOneLineDescription(researchList[i]), researchUtils.getResearchUnitImage(researchList[i]))
						+ '</div>' //closing div containing the share buttons html
						+ '</div>' //end of researchHead div containing header and share buttons
						+ '<h4>' + researchUtils.getResearchUnitStartDate(researchList[i]) + " to " + researchUtils.getResearchUnitEndDate(researchList[i]) + '</h4>' //adding date
						+ researchUtils.getResearchUnitBootstrapFullDescription(researchList[i]) //adding primary research details
						+ '</div></div>' //closing col and row div
						+ researchUtils.getResearchUnitBootstrapSubResearch(researchList[i]) //adding content for subResearch - it should be properly formatted html, so is left in separate row class
						+ '<div class="row"><div class="col-xs-12"><p class="visible-xs visible-sm hidden-print" style="margin-top:10px;"><a href="' + research.getCarouselId() + '">Back To Top</a></p></div></div>' // Provide a "Back To Top" link only for small devices in a separate row 
						+ '</div>'; //end of entire research content wrapper div
			if (i!== (size-1)) {
				researchContent = researchContent + '<hr class="featurette-divider">';
			}
		}
		return researchContent;
	},
	
	//[content helper method] helper method to get id of subResearch buttons in sideNavbar 
	getIdForSubResearchInSideNav : function(subResearchUnit) {
		return researchUtils.getResearchPageIdForGiven(subResearchUnit.id) + '_sideNav';
	},
	
	//[content helper method] method to get sidebar content
	getSidebarContent : function(researchList) {
		var sidebar = '';
		sidebar = sidebar + '<ul class="nav nav-pills nav-stacked">';
		for(var i = 0, size = researchList.length; i < size ; i++){
			//add button for research title
			sidebar = sidebar + '<li><a href="#' + research.getIdForHrefToResearchTitleOnClick(researchList[i]) + '" class="' + utils.getOgChangeClassForHrefTarget(research.getIdForHrefToResearchTitleOnClick(researchList[i])) + '">' + researchUtils.getResearchUnitTitle(researchList[i]) + '</a>';
			//if there is subResearch data,  add dropdown
			if(typeof(researchList[i].subResearch)!=="undefined" && researchList[i].subResearch.length!==0) {
				sidebar = sidebar + '<ul class="nav nav-stacked">';
				for(var j = 0, size2 = researchList[i].subResearch.length; j < size2 ; j++){
					//NOTE - 2 things regarding subresearch buttons on sidebar:
					//1) Even if we add a js to prevent default action on click on sideNavbar button, we need it to point to correct href - else scrollspy will not work! See openAccordionOnSideNavClick() where indeed the final href is different from that in scrollSpy
					//2) Each subresearch button has an id on which js can be written to bind specific functions
					sidebar = sidebar + '<li><a href="#' + researchUtils.getIdForHrefToSubResAccordOnClick(researchList[i].subResearch[j]) + '" id="' + research.getIdForSubResearchInSideNav(researchList[i].subResearch[j]) + '">' + researchUtils.getTitleForAccordionUnit(researchList[i].subResearch[j]) + '</a></li>'; 
				}
				sidebar = sidebar + '</ul>'; //close the <ul> element for subresearch
			}
			sidebar = sidebar + '</li>'; //close single sidebar button
		}
		sidebar = sidebar + '</ul>';
		return sidebar;
	},
	
	//[content helper method] method to activate scrollspy and affix for sideNavbar
	activateScrollSpy : function() {
		$('#' + research.getScrollSpyIdForSideNav() + '>ul').affix({
			offset: {
				top: 500
			}
		});
		//add attributes to <body> to enable scrollSpy
		//add offset if needed. Here we're be adding invisible gaps (utils.getInvPageScrollDownElemWithIdAndWidth), so no need for it
		$('body').scrollspy({ target: '#' + research.getScrollSpyIdForSideNav(), offset:0 }) 
		//since dom elements are aded, trigger scrollspy with refresh
		$('[data-spy="scroll"]').each(function () {
			$(this).scrollspy('refresh');
		});
		//If from within the pannel-group, the events are triggered due to opening/closing of accordion, then scroll-spy is refreshed
		$('.panel-group').on('shown.bs.collapse hidden.bs.collapse', function () {
			$('body').scrollspy('refresh');
		});
	},
	
	//[content helper method] method to enable collapsible accordion on all subResearch elements added.
	activateAccordion : function(researchList) {
		for(var i = 0, size = researchList.length; i < size ; i++) {
			if(typeof(researchList[i].subResearch)!=="undefined" && researchList[i].subResearch.length!==0) {
				for(var j = 0, size2 = researchList[i].subResearch.length; j < size2 ; j++){
					//trigger collapse selector
					$('#' + researchUtils.getIdForAccordionUnitTitleClick(researchList[i].subResearch[j])).collapse({
						toggle: false,
						parent: $('#' + researchUtils.getIdForAccordionPanelGroup(researchList[i]))
					});
				}
			}
		}
	},
	
	//[content helper method] method enabling all entries of accordion to have same height. When fixing height, also add a custom element giving width of current window. This helps in identifying if the accordion max-height or min-height should be set on scaling
	setSameHeightOnAccordion : function(researchList) {
		for(var i = 0, size = researchList.length; i < size ; i++) {
			var maxHeight = 0;
			if(typeof(researchList[i].subResearch)!=="undefined" && researchList[i].subResearch.length!==0) {
				//clear any previously set value before new are set. This is kept in separate loop else it was found that window.setTimeout() used in the next loop required higher values. See comments in next loop for details
				for(var j = 0, size2 = researchList[i].subResearch.length; j < size2 ; j++){
					
				}
				//identify new value to be set
				for(var j = 0, size2 = researchList[i].subResearch.length; j < size2 ; j++){
					var inSel = $('#' + researchUtils.getIdForAccordionUnitBody(researchList[i].subResearch[j])); // selector for panel-body where "in" class is attached which makes it hide.
					var hasIn = inSel.hasClass('in'); //get a flag if class is present - will need to reset it when done
					var inSelStyle = inSel.attr('style'); //it is found that removal of "in" sets a style="height:0px" on this element. This is identified so it can be removed
					inSel.removeAttr('style');
					inSel.addClass('in'); //add 'in' flag to enable showing panel-body so that we can get its height
					inSel.children('div.panel-body').css("min-height",""); 
					var htStr = inSel.css("height"); //get string containing height information
					if(!hasIn) {
						inSel.removeClass('in'); //remove 'in' class if it was previously absent
					}
					if(inSelStyle) {
						inSel.attr('style',inSelStyle);
					}
					maxHeight = Math.max(maxHeight, parseInt(htStr.substring(0,htStr.length - 2))); //because last 2 entries in heightString is "px"
					// --used for debugging-- console.log(i+","+j+","+htStr+","+maxHeight);
				}
				//set new values
				for(var j = 0, size2 = researchList[i].subResearch.length; j < size2 ; j++){
					$('#' + researchUtils.getIdForAccordionUnitBody(researchList[i].subResearch[j]) + '>div.panel-body').css("min-height",(maxHeight + "px")); //apply min-height to panel-body class of div element immediately inside, not to getIdForAccordionUnitBody()
				}
				// --used for debugging-- console.log("-------------");
			}
		}
		//IMPORTANT - there don't seem to be a need to refresh scroll-spy after height change; So not done!
		// --used for debugging-- console.log("xxxxxxxxxxxxxxx");
	},
	
	//[content helper method] method to enable property where clicking on sidebar's subresearch also opens the corresponding panel in addition to simply shifting page to the panel
	openAccordionOnSideNavClick : function(researchList) {
		for(var i = 0, size = researchList.length; i < size ; i++) {
			if(typeof(researchList[i].subResearch)!=="undefined" && researchList[i].subResearch.length!==0) {
				for(var j = 0, size2 = researchList[i].subResearch.length; j < size2 ; j++){
					$('#' + research.getIdForSubResearchInSideNav(researchList[i].subResearch[j]))
						.on('click', null, {subResearch:researchList[i].subResearch[j], researchId:researchList[i].id}, function(event) {
							//use preventDefault to prevent webpage from shifting location. We want to first open accordion and then move
							event.preventDefault();
							//opening accordion - if not already
							if(!$('#' + researchUtils.getIdForAccordionUnitBody(event.data.subResearch)).hasClass('in')) {
								$('#' + researchUtils.getIdForAccordionUnitTitleClick(event.data.subResearch)).trigger('click');
							}
							//NOTE that opening accordion is async, but we need a fixed target we can immediately go to while accordion opens
							//Else href will go to accordion-title location before it was opening. Bad UserExperience. Also it is not good to have user wait while accordion is opening. So we just go to top of accordion panelGroup
							window.location.hash = '#' + researchUtils.getIdForAccordionPanelGroup({id:event.data.researchId});
					});
				}
			}
		}
	}
	// [END OF] content helper methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
}