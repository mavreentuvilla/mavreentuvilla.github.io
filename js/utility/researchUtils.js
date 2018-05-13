//This namespace contains method to read researchData json file and provide corresponding details
//Note that sometimes it may be needed to take the read data through additional processing befor giving it to main code. All those logic are executed here
var researchUtils = {
	
	//get id for any html element that goes on research page. 
	//The id could be required by some methods that read raw data and parse it in proper html form
	//This is done to ensure that all id(s) made for aboutMe page has this id-structure. The logic is used to define implementation of hashchange method for proper single-page application use
	getResearchPageIdForGiven : function(id) {
		return utils.researchId + '_' + id;
	},
	
	//method to get id of researchUnit
	getResearchUnitId : function(researchUnit) {
		return researchUtils.getResearchPageIdForGiven(researchUnit.id);
	},
	
	//method to get title of researchUnit
	getResearchUnitTitle : function(researchUnit) {
		return researchUnit.title;
	},

	//method to get image of researchUnit
	getResearchUnitImage : function(researchUnit) {
		return researchUnit.image;
	},
	
	//method to get StartDate of researchUnit
	getResearchUnitStartDate : function(researchUnit) {
		return researchUnit.startDate;
	},
	
	//method to get EndDate of researchUnit
	getResearchUnitEndDate : function(researchUnit) {
		return researchUnit.endDate;
	},
	
	//method to get OneLineDescription of researchUnit
	getResearchUnitOneLineDescription : function(researchUnit) {
		return researchUnit.oneLineDescription;
	},
	
	//method to get content of FullDescription from single researchData object formatted in html
	getResearchUnitBootstrapFullDescription : function(researchUnit) {
		var descrip = '';
		for(var i = 0, size = researchUnit.fullDescription.length; i < size ; i++){
			descrip = descrip + '<p class="text-justify">' + researchUnit.fullDescription[i] + '</p>';
		}
		return descrip;
	},
	
	//method to get sub-research details from single researchData object formatted in html
	getResearchUnitBootstrapSubResearch : function(researchUnit) {
		if(typeof(researchUnit.subResearch)==="undefined" || researchUnit.subResearch.length==0) {
			return '';
		}
		return '<div class="row"><div class="col-xs-12">' //create row and column div to contain data
				+ '<h4 style="margin-top:30px;margin-bottom:15px">Additional Details</h4>' //add a header just to show that sub-research section is starting
				+ researchUtils.getResearchUnitBootstrapAccordion(researchUnit)
				+ '</div></div>'; //close the row and column divs
	},
	
	// [START OF] getResearchUnitBootstrapSubResearch helper methods ----------------------------------------------------------------------
	//[getResearchUnitBootstrapSubResearch helper method] method to get id for panel-group element of accordion. This helps in constructing proper accordion
	getIdForAccordionPanelGroup : function(researchUnit) {
		return researchUtils.getResearchUnitId(researchUnit) + '_accordionPanelGroup';
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get id of accordion-top. This is the element where page schould scroll to when subresearch elements clicked
	getIdForHrefToSubResAccordOnClick : function(subResearchUnit) {
		return researchUtils.getResearchPageIdForGiven(subResearchUnit.id) + '_accordionHrefDest';
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get id for title to accordion unit
	getIdForAccordionUnitTitle : function(subResearchUnit) {
		return researchUtils.getResearchPageIdForGiven(subResearchUnit.id) + '_title';
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get title to accordion unit
	getTitleForAccordionUnit : function(subResearchUnit) {
		return subResearchUnit.title;
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get id of clickable element in accordion title. This will be used to write methods that auto open the accordion when clicked from sideNavbar
	getIdForAccordionUnitTitleClick : function(subResearchUnit) {
		return researchUtils.getResearchPageIdForGiven(subResearchUnit.id) + '_titleClick';
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get id of body to accordion unit. The unit respresents a particular subResearch entry from list under a primary research topic
	getIdForAccordionUnitBody : function(subResearchUnit) {
		return researchUtils.getResearchPageIdForGiven(subResearchUnit.id) + '_body';
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get full-description to accordion unit. The unit respresents a particular subResearch entry from list under a primary research topic
	getBootstrapFullDescriptionForAccordionUnit : function(subResearchUnit) {
		if(typeof(subResearchUnit.fullDescription)==="undefined" || subResearchUnit.fullDescription.length===0) {
			return '';
		}
		var str = '';
		for(var i = 0, size = subResearchUnit.fullDescription.length; i < size ; i++){
			//NOTE: it is assumed that subResearch descriptions are properly formatted html. Nothing else is done.
			str = str + subResearchUnit.fullDescription[i];
		}
		return str;
	},
	
	//[getResearchUnitBootstrapSubResearch helper method] method to get accordion-only content filled with subResearch data
	getResearchUnitBootstrapAccordion : function(researchUnit) {
		var str = '';
		str = str + '<div class="panel-group" id="' + researchUtils.getIdForAccordionPanelGroup(researchUnit) + '" role="sub-research-tablist" aria-multiselectable="true">'; //make the initial panel-group div
		
		//making accordion title and body
		var expandedFlag = true; //to expand the first element of accordion
		for(var i = 0, size = researchUnit.subResearch.length; i < size ; i++){
			//additional data based on expandedFlag
			//---- if expandedFlag is false
			var panelHeadCollapseClass = 'class="collapsed"';
			var ariaExpanded = 'aria-expanded="false"';
			var panelBodyCollapseExtraClass = '';
			//---- if expandedFlag is true
			if(expandedFlag) {
				panelHeadCollapseClass = '';
				ariaExpanded = 'aria-expanded="true"';
				panelBodyCollapseExtraClass = 'in';
			}
			
			var subResearchUnit = researchUnit.subResearch[i];
			str = str + utils.getInvPageScrollDownElemWithIdAndWidth(researchUtils.getIdForHrefToSubResAccordOnClick(subResearchUnit),70) //div with id where page will scroll to once links from side navbar is clicked. This is added to prevent accordion hiding behind floating top navbar
					+ '<div class="panel panel-default">' //open div to panel making accordion unit
					//START MAKING PANEL-TITLE in accordion
					+ '<div class="panel-heading" role="subResearch-tab" id="' + researchUtils.getIdForAccordionUnitTitle(subResearchUnit) + '">' //start div and set id for accordion unit title
					+ '<h4 class="panel-title">' //Due to complexity of <a> element inside panel title, it is finely-broken. Be careful of adding at least one, or more space
						+ '<a'
							+ ' id="' + researchUtils.getIdForAccordionUnitTitleClick(subResearchUnit) + '"' //An "id" is given to <a> element so that collapse-js can be triggered
							+ ' ' + panelHeadCollapseClass //set if collapsed or not
							+ ' role="button" data-toggle="collapse"' //set some more parameters
							+ ' data-parent="#' + researchUtils.getIdForAccordionPanelGroup(researchUnit) + '"' //set the parent id for whole accordion
							+ ' href="#' + researchUtils.getIdForAccordionUnitBody(subResearchUnit) + '"' //set the target href of click
							+ ' ' + ariaExpanded + ' aria-controls="' + researchUtils.getIdForAccordionUnitBody(subResearchUnit) + '">' //set aria options
							+ researchUtils.getTitleForAccordionUnit(subResearchUnit) //set text enclosed by <a> element, i.e. the subresearch title
						+ '</a>' //end of <a> element
					+ '</h4>' //end of setting title 
					+ '</div>' //end div for accordion unit title. Thus, END-MAKING PANEL-TITLE in accordion
					//START MAKING PANEL-BODY IN ACCORDION
					//open div that encloses panel body and causes collapse. Due to complexity of this element, it is finely broken
					+ '<div'
						+ ' id="' + researchUtils.getIdForAccordionUnitBody(subResearchUnit) + '"'
						+ ' class="panel-collapse collapse ' + panelBodyCollapseExtraClass + '"'
						+ ' role="subresearch-tabpanel" aria-labelledby="' + researchUtils.getIdForAccordionUnitTitle(subResearchUnit) + '"'
					+ '>' 
					+ '<div class="panel-body">' + researchUtils.getBootstrapFullDescriptionForAccordionUnit(subResearchUnit) + '</div>' //Put content of that particular subResearch in panel body
					+ '</div>' //close div enclosing panel body and triggering collapse
					+ '</div>' //close div to panel making accordion unit
					
			//change expandedFlag to false - since only the first entry is expanded, not others, so no need to do any check, just set it false
			expandedFlag=false;
		}
		str = str + '</div>'; //close panel-group-div
		
		//return
		return str;
	}
	// [END OF] getResearchUnitBootstrapSubResearch helper methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
}