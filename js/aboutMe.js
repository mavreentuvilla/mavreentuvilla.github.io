//this name contains methods used to load the about-me page
var aboutMe = {

	//file containing aboutMe information
	aboutMeFile : 'data/aboutMe.json',
	experienceFile : 'data/experience.json',
	pageOgPicFile : 'image/MT.jpg', //the file containing image linked by og metadata
	//variable guiding if all tables in experience-description should have same height
	setSameHeightInExpTableDescp : true,
	
	//method performing loading of webpage. If needed, do a ajax file read and set them as callback methods
	loadPageAsync : function(extAlwaysCallback) {
		//set <head> elements
		aboutMe.setHeadDescription();
		aboutMe.setHeadKeywords();
		aboutMe.setHeadTitle();
		aboutMe.setHeadPageId();
		aboutMe.setOg();
		//set <body> elements
		aboutMe.setBodyJumbotron();
		aboutMe.setBodyCarousel();
		aboutMe.setBodyBreadcrumb();
		//set primary content within <body>
		aboutMe.setBodyContent(extAlwaysCallback);
	},
	
	//method to set head_description
	setHeadDescription : function() {
		$('#head_description').attr('content','About Mavreen Tuvilla');
	},
	
	//method to set head_keywords
	setHeadKeywords : function() {
		$('#head_keywords').attr('content','Mavreen, Tuvilla, About, Description, Experience, Skills');
	},
	
	//method to set head_title
	setHeadTitle : function() {
		$('#head_title').html('Mavreen - About Me');
	},
	
	//method to set head_pageId
	setHeadPageId : function() {
		$('#head_pageId').attr('content',utils.aboutMeId);
	},
	
	//method to set og meta in head
	setOg: function() {
		$('#head_og_title').attr('content','About Mavreen Tuvilla');
		$('#head_og_url').attr('content',utils.serverHref + utils.multiPageHref + '/' + utils.aboutMeId);
		$('#head_og_image').attr('content',utils.serverHref + '/' + aboutMe.pageOgPicFile);
	},
	
	//method to set body_jumbotron
	setBodyJumbotron : function() {
		$('#body_jumbotron').html(''); //remove any previously set values
	},
	
	//method to set body_carousel
	setBodyCarousel : function() {
		$('#body_carousel').html(''); //remove any previously set values
	},
	
	//method to set body_breadcrumb
	setBodyBreadcrumb : function() {
		$('#body_breadcrumb').html('Home / About Me')
			.attr('style','margin-top: 80px; margin-bottom: 30px;'); // large top-margin else it gets hidden by navbar
			//NOTE: for its simplicity, gap is created by simply adding height rather than using utilities.getInvPageScrollDownElemWithIdAndWidth() trick
	},
	
	//method to set content in body
	setBodyContent : function(extAlwaysCallback) {
		//remove attributes from <body> added by research page
		utils.removeAttributesFromElement(document.body);
		//clear existing data and set a new container wherein data will be put container
		$('#body_content').html('<div class="container"></div>');
		//add personal content - it contains logic to trigger the method to set skills after the computation is done
		aboutMe.setPersonalContentAsync(extAlwaysCallback);
	},
	
	//[setBodyContent helper method] method to set personal content
	setPersonalContentAsync : function(extAlwaysCallback) {
		//first read and set "self-description"
		utils.getDataAjax(aboutMe.aboutMeFile)
			.done(function(data) { 
				$('#body_content>.container').append(aboutMe.setPersonalContentAsyncHelper(data));
				//self-details can have popover in contact buttons, so enable it
				//IMPORTANT: use container:body to increase size, else it will be limited to button group
				$('.aboutMe_popover').popover({'trigger':'hover focus', 'placement':'bottom', 'html':'true', 'container':'body'});
				utils.copyOnClickHandler(); //activate the click-to-copy handler
			}) 
			.fail(function(data) { 
				$('#body_content>.container').append('<div class="alert alert-danger" role="alert">Details unavailable. Please try later.</div>');
			})
			.always(function() {
				//add a divider to separate it from next section. make addition in callback, else order may get wrong
				$('#body_content>.container').append('<hr class="featurette-divider">');
				//add skills - after "self-description has been put"
				aboutMe.setExperienceSkillContentAsync(extAlwaysCallback);
			});
	},
	
	// [START OF] setPersonalContentAsync helper methods; which is itself helper to setBodyContent --------------------------------------------
	//[setPersonalContentAsync helper method] method to return the section on "Self Description"
	setPersonalContentAsyncHelper : function(aboutMeData) {
		return '<div class="flex-row row">' 
				+ '<div class="col-md-3">' //this div contains image
				+ '<img src="' + aboutMeUtils.getImage(aboutMeData) + '" class="self-image img-rounded" alt="' + aboutMeUtils.getName(aboutMeData) + '" height="100%">' //add image
				+ '</div>' //end of col-md-4 div
				+ '<div class="col-md-8 col-md-push-1">' //this div conatins details
				+ '<h2>' + aboutMeUtils.getName(aboutMeData) + '</h2>' //set Name
				+ '<h4>' + aboutMeUtils.getDesignation(aboutMeData) + '</h4>' //set Designation
				+ aboutMe.getContactButtons(aboutMeData)
				+ '<div class="add-top-margin">' + aboutMeUtils.getBootstrapFullDescription(aboutMeData) + '</div>' //set Full-description, combining data from all paragraphs
				+ aboutMe.selfDescriptionQuote(aboutMeData) //set blockquote
				+ '</div>' //end of col-md-8 div
				+ '</div>' //end of row-div
	},
	
	//[setPersonalContentAsync helper method] method to get contact button bar from aboutMeData
	getContactButtons : function(aboutMeData) {
		var buttonStr = aboutMeUtils.getBootstrapButtons(aboutMeData);
		if(buttonStr.length!=0) {
			return '<div class="add-top-margin">' + buttonStr + '</div>';
		} else {
			return buttonStr;
		};
	},
	
	//[setPersonalContentAsync helper method] method to get description quote from aboutMeData
	selfDescriptionQuote : function(aboutMeData) {
		var quote = aboutMeUtils.getBootstrapQuote(aboutMeData);
		if(quote.length!=0) {
			return '<div class="add-top-margin add-border">' + quote + '</div>';
		} else {
			return quote;
		}
	},
	// [END OF] setPersonalContentAsync helper methods; which is itself helper to setBodyContent ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	//[setBodyContent helper method] method to add data on experience and skill
	setExperienceSkillContentAsync : function(extAlwaysCallback) {
		utils.getDataAjax(aboutMe.experienceFile)
			.done(function(data) { //success method for reading 'data/experience.json'
				$('#body_content>.container').append(aboutMe.setExperienceSkillContentAsyncHelper(data));
			})
			.fail(function(data) { //error method for reading 'data/experience.json'
				$('#body_content>.container').append('<div class="row"><div class="col-xs-12"><h4>Experience</h4><div class="alert alert-danger" role="alert">Details unavailable. Please try later.</div><h4>Skills</h4><div class="alert alert-danger" role="alert">Details unavailable. Please try later.</div></div></div>');
			})
			.always(function() {
				extAlwaysCallback();
			});
	},
	
	// [START OF] setExperienceSkillContentAsync helper methods; which is itself helper to setBodyContent --------------------------------------
	//[setExperienceSkillContentAsync helper method] method to return the id of div containing table with description of experience data
	getExpTableDescpId : function() {
		return aboutMeUtils.getAboutMePageIdForGiven('expTableDescp');
	},
	
	//[setExperienceSkillContentAsync helper method] method to return the id of div with svg experience data
	getExpSvgId : function() {
		return aboutMeUtils.getAboutMePageIdForGiven('expSvg');
	},
	
	//[setExperienceSkillContentAsync helper method] method to return the id of div with svg skill data
	getSkillSvgId : function() {
		return aboutMeUtils.getAboutMePageIdForGiven('skillSvg');
	},
	
	//[setExperienceSkillContentAsync helper method] method to return the section on experience and skills
	setExperienceSkillContentAsyncHelper : function(expSkillData) {
		//creating basic framework that will contain plots and tables
		$('#body_content>.container').append('<div class="row"><div class="col-xs-12"><h4>Experience</h4><div id="' + aboutMe.getExpTableDescpId() + '" style="padding-bottom:5px"></div><div id="' + aboutMe.getExpSvgId() + '"></div><h4>Skills</h4><div id="' + aboutMe.getSkillSvgId() + '"></div></div></div>');
		//put prompt for user to click
		$('#' + aboutMe.getExpTableDescpId()).html('<table class="table table-bordered table-responsive"><tbody><tr><th>Click on experience bubble to get description</th></tr></tbody></table>');
		//get new formatted data
		var newExpSkillData = expUtils.transformExpSkillData(expSkillData);
		//set height to getExpTableDescpId() div containing description tables
		aboutMe.setHeightOnExpTableDescp(newExpSkillData.experiences);
		//make plots
		var expCssParams = aboutMe.getExpPlotCssParamsInDiv(aboutMe.getExpSvgId());
		expUtils.drawExpD3InIdDim(newExpSkillData.experiences, aboutMe.getExpSvgId(), expCssParams, aboutMe.expD3Callback);
		var skillCssParams = aboutMe.getSkillPlotCssParamsInDiv(aboutMe.getSkillSvgId(), newExpSkillData.skills.length);
		expUtils.drawSkillD3InIdDim(newExpSkillData.skills, aboutMe.getSkillSvgId(), skillCssParams, aboutMe.skillSubUnitD3Callback);
		//activate handler to redraw image on resizing
		aboutMe.activateResizeHandler(newExpSkillData);
	},
	
	//[setExperienceSkillContentAsync helper method]  method to ensure all exp-description table are of same height
	setHeightOnExpTableDescp : function(newExpList) {
		if (aboutMe.setSameHeightInExpTableDescp) {
			var sel = $('#' + aboutMe.getExpTableDescpId());
			var existDescp = sel.html(); //get the existing value, so it can be later set
			sel.css('height','auto'); //before starting calculation, set height as auto so it can pick correct height based on table
			var maxHt = 0;
			for(var i=0, size=newExpList.length; i<size; i++) {
				$('#' + aboutMe.getExpTableDescpId()).html(newExpList[i].description);
				var newHt = sel.css('height');
				maxHt = Math.max(parseInt(newHt.substring(0,newHt.length-2)),maxHt);
			}
			//set back old description
			sel.css('height',maxHt + 'px');
			sel.html(existDescp);
		}
	},
	
	//[setExperienceSkillContentAsync helper method] method to get the css-params used in making experience d3 plots. To get width estimate, the containing id is needed as parameter
	getExpPlotCssParamsInDiv : function(id) {
		var cssParams = {};
		//border - to make ticks, and to restrict plots that can be viewed
		//currently these values are independent of screen size. But the tick-sizes change. If needed, make the margin dependent on screen size too
		//large right/left border to accommodate tooltip
		cssParams.margin = {top: 10, right: 25, bottom: 25, left: 25}; 
		cssParams.fillOpacityWithoutHover = 0.1;
		cssParams.fillOpacityWithHover = 1;
		cssParams.strokeOpacityWithoutHover = 0.3;
		cssParams.strokeOpacityWithHover = 0.8;
		//----getting height of plot
		var maxHeight = 600; //if a very big screen is available, restrict height to max of 400
		var minHeight = 100; //if a very small screen is available, restrict height to min of 100
		var calcHeight = Math.floor($(window).height()/4); //fourth of window, other portions to display table and other plot 
		var useHeight = Math.min(Math.max(minHeight, calcHeight), maxHeight);
		cssParams.plotHeight = useHeight - cssParams.margin.top - cssParams.margin.bottom;
		//----getting width of plot
		var maxWidth = 1000; //if a very big screen is available, restrict width to max of 1000
		var minWidth = 200; //if a very small screen is available, restrict width to max of 200
		//----|----getting calcWidth
		var idDispSetting = $('#' + id).css('display');
		$('#' + id).css('width','100%'); //set the element width to 100% to get full width of container
		var calcWidth = $('#' + id).css('width'); //this gives value ending with 'px' suffix
		calcWidth = parseInt(calcWidth.substring(0,calcWidth.length-2));
		if(idDispSetting) {
			$('#' + id).css('display',idDispSetting);
		}
		var widthPerMonth = 10;
		var useWidth = Math.min(Math.min(Math.max(minWidth, calcWidth), maxWidth), expUtils.expMaxPlotHorizWidth*widthPerMonth);//transforming expSkillData should define expUtils.expMaxPlotHorizWidth. Use it to set limit to cssParams.width used by exp-plot. It is upon coder to ensure that the variable is defined
		cssParams.plotWidth = useWidth - cssParams.margin.left - cssParams.margin.right;
		//setting ticksize and min-gap between ticks for x-axis
		cssParams.xTickSize = 9;
		cssParams.xTickGap = 60;
		if(cssParams.plotWidth >= 400 && cssParams.plotWidth <700) {
			cssParams.xTickSize = 12;
			cssParams.xTickGap = 90;
		}
		if(cssParams.plotWidth >= 700) {
			cssParams.xTickSize = 15;
			cssParams.xTickGap = 120;
		}
		//setting ticksize and min-gap between ticks for y-axis
		cssParams.yTickSize = 9;
		cssParams.yTickGap = 20;
		if(cssParams.plotHeight >= 100 && cssParams.plotHeight <250) {
			cssParams.yTickSize = 12;
			cssParams.yTickGap = 40;
		}
		if(cssParams.plotHeight >= 250) {
			cssParams.yTickSize = 15;
			cssParams.yTickGap = 60;
		}
		//return
		return cssParams;
	},
	
	//[setExperienceSkillContentAsync helper method] method to get the css-params used in making skill d3 plots. To get width estimate, the containing id is needed as parameter
	//NOTE that certain portions of the method differs from getExpPlotCssParamsInDiv. A comment is added with prefix.. //** [This portion differs from getExpPlotCssParamsInDiv]
	getSkillPlotCssParamsInDiv : function(id, skillCnt) {
		var cssParams = {};
		//border - to make ticks, and to restrict plots that can be viewed
		//currently these values are independent of screen size. But the tick-sizes change. If needed, make the margin dependent on screen size too
		//large right/left border to accommodate tooltip - left border also accommodates vertical ticks. 
		//** [This portion differs from getExpPlotCssParamsInDiv] larger left border to make y-axis label 
		cssParams.margin = {top: 10, right: 25, bottom: 25, left: 45}; 
		cssParams.fillOpacityWithoutHover = 0.1;
		cssParams.fillOpacityWithHover = 1;
		cssParams.strokeOpacityWithoutHover = 0.3;
		cssParams.strokeOpacityWithHover = 0.8;
		//----getting height of plot
		var maxHeight = 400; //if a very big screen is available, restrict height to max of 400
		var minHeight = 100; //if a very small screen is available, restrict height to min of 100
		var calcHeight = Math.floor($(window).height()/4); //fourth of window, other portions to display table and other plot 
		var useHeight = Math.min(Math.max(minHeight, calcHeight), maxHeight);
		cssParams.plotHeight = useHeight - cssParams.margin.top - cssParams.margin.bottom;
		//----getting width of plot
		var maxWidth = 1000; //if a very big screen is available, restrict width to max of 1000
		var minWidth = 200; //if a very small screen is available, restrict width to max of 200
		//----|----getting calcWidth
		var idDispSetting = $('#' + id).css('display');
		$('#' + id).css('width','100%'); //set the element width to 100% to get full width of container
		var calcWidth = $('#' + id).css('width'); //this gives value ending with 'px' suffix
		calcWidth = parseInt(calcWidth.substring(0,calcWidth.length-2));
		if(idDispSetting) {
			$('#' + id).css('display',idDispSetting);
		}
		//** [This portion differs from getExpPlotCssParamsInDiv] the logic to define width uses # of skills being plotted, not exp months
		var widthPerSkill = 200; //keep it more than (maxWidthTakenByTick + minGapBwXTick) -- see below
		var useWidth = Math.min(Math.min(Math.max(minWidth, calcWidth), maxWidth), widthPerSkill*skillCnt);
		cssParams.plotWidth = useWidth - cssParams.margin.left - cssParams.margin.right;
		//setting ticksize and min-gap between ticks for x-axis
		cssParams.xTickSize = 9;
		cssParams.xTickGap = 60;
		if(cssParams.plotWidth >= 400 && cssParams.plotWidth <700) {
			cssParams.xTickSize = 12;
			cssParams.xTickGap = 90;
		}
		if(cssParams.plotWidth >= 700) {
			cssParams.xTickSize = 15;
			cssParams.xTickGap = 120;
		}
		//setting ticksize and min-gap between ticks for y-axis
		cssParams.yTickSize = 9;
		cssParams.yTickGap = 20;
		if(cssParams.plotHeight >= 100 && cssParams.plotHeight <250) {
			cssParams.yTickSize = 12;
			cssParams.yTickGap = 40;
		}
		if(cssParams.plotHeight >= 250) {
			cssParams.yTickSize = 15;
			cssParams.yTickGap = 60;
		}
		
		//** [This portion differs from getExpPlotCssParamsInDiv] if the count of skills is too large, then increase bottom margin. Do it at this point, else the logic to get plotHeight will be affected
		var minGapBwXTick = 50; //..assuming minimum gap between x ticks for good viewing
		var maxWidthTakenByTick = 100; //..assuming that max width taken by single tick could go up to 100px
		cssParams.xTickRot = 0;
		if(cssParams.plotWidth/skillCnt < (maxWidthTakenByTick + minGapBwXTick)) {//..means too many skills, so make them vertical
			cssParams.xTickRot = 90; //use +90 rotation ..see https://bl.ocks.org/mbostock/4403522
			cssParams.margin.bottom = maxWidthTakenByTick;
		}
		
		//return
		return cssParams;
	},
	
	//[setExperienceSkillContentAsync helper method] method to attach handler after corresponding experience data have been drawn in D3. This method is provided as calback to D3
	prevClickedExpClassName : "", //name of expeience class that was previously clicked
	clickClass : "clicked", //the class that is added when experience is clicked
	hoverClass : "hovered", //the class that is added when experience is hovered, but not clicked
	expD3Callback : function(newExp) {
		var clickClassName = newExp.class; //get actual class name being clicked
		//adding handler when an experience is clicked - adding clickClass
		$("ellipse." + clickClassName).on('click', function() {
			if(aboutMe.prevClickedExpClassName!==clickClassName) { //process only if same circle is not clicked twice
				$("." + clickClassName).removeClass(aboutMe.hoverClass); //remove hoverClass if it is there
				$("." + clickClassName).addClass(aboutMe.clickClass); //add clickedClass to all elements with this class
				$('#' + aboutMe.getExpTableDescpId()).html(newExp.description); //add entry for table-description
				//enable popover for skills-used in table-description
				$(".aboutMe_expSkillUsed").popover({'container':'body','html':true, 'trigger':'hover focus', 'placement':'top'});
				if(aboutMe.prevClickedExpClassName.length>0) { //remove "clicked" class to elements that was previously clicked
					$("." + aboutMe.prevClickedExpClassName).removeClass(aboutMe.clickClass);
				}
				aboutMe.prevClickedExpClassName = clickClassName; //update previously clicked class
			}
		});
		//adding/removing handler when an experience has mouseenter/mouseleave, thus behaving as hover - adding hover-class
		$("ellipse." + clickClassName).on('mouseenter',function() {
			if(!$("." + clickClassName).hasClass(aboutMe.clickClass)) { //do processing only if this class is not already clicked
				$("." + clickClassName).addClass(aboutMe.hoverClass);
			}
		}).on('mouseleave',function() {
			if(!$("." + clickClassName).hasClass(aboutMe.clickClass)) { //do processing only if this class is not already clicked
				$("." + clickClassName).removeClass(aboutMe.hoverClass);
			}
		});
	},
	
	//[setExperienceSkillContentAsync helper method] method to attach handler after corresponding skill data have been drawn in D3. This method is provided as calback to D3
	skillSubUnitD3Callback : function(newSkillSubUnit) {
		var clickClassName = newSkillSubUnit.class; //get actual class name being clicked
		//the handler logic is invoke the event on exp-eliipse, and it has suitable logic
		$("rect." + clickClassName).on('click', function() {
			$("ellipse." + clickClassName).trigger("click"); //trigger click on ellipse, it contains main logic
		}).on('mouseenter',function() {
			$("ellipse." + clickClassName).trigger("mouseenter"); //trigger mouseenter on ellipse, it contains main logic
		}).on('mouseleave',function() {
			$("ellipse." + clickClassName).trigger("mouseleave"); //trigger mouseleave on ellipse, it contains main logic
		});
	},
	
	//[setExperienceSkillContentAsync helper method] method to add handler to redraw images on rescaling. Out of various functions used in setExperienceSkillContentAsyncHelper() only the following are needed
	activateResizeHandler : function(newExpSkillData) {
		//before activating handler, get current window width and store in a variable. Per logic, make changes only if width changes. MORE IMPORTANTLY, this logic is found to help with mobile-sites ...for some reason they rescale vertically and d3-tooltip stops responding properly!!
		aboutMe.currentWindowSz = $(window).width();
		//If rescaling happens, only the following 5 functions need to be executed
		var d3RescaleFunc = function(data) {
			var newWindowWidth = $(window).width();
			if(newWindowWidth!==aboutMe.currentWindowSz) {
				//set height to getExpTableDescpId() div containing description tables
				aboutMe.setHeightOnExpTableDescp(newExpSkillData.experiences);
				//make plots
				var expCssParams = aboutMe.getExpPlotCssParamsInDiv(aboutMe.getExpSvgId());
				expUtils.drawExpD3InIdDim(newExpSkillData.experiences, aboutMe.getExpSvgId(), expCssParams, aboutMe.expD3Callback);
				var skillCssParams = aboutMe.getSkillPlotCssParamsInDiv(aboutMe.getSkillSvgId(), newExpSkillData.skills.length);
				expUtils.drawSkillD3InIdDim(newExpSkillData.skills, aboutMe.getSkillSvgId(), skillCssParams, aboutMe.skillSubUnitD3Callback);
				//update width
				aboutMe.currentWindowSz=newWindowWidth;
			}
		};
		utils.setHandlerToWindowResize(newExpSkillData, d3RescaleFunc);
	},
	// [END OF] setExperienceSkillContentAsync helper methods; which is itself helper to setBodyContent ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
}