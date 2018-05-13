//This namespace contains method to read aboutMeData json file and provide corresponding details
//Note that sometimes it may be needed to take the read data through additional processing befor giving it to main code. All those logic are executed here
var aboutMeUtils = {
	
	//get id for any html element that goes on aboutMe page. 
	//The id could be required by some methods that read raw data and parse it in proper html form
	//This is done to ensure that all id(s) made for aboutMe page has this id-structure. The logic is used to define implementation of hashchange method for proper single-page application use
	getAboutMePageIdForGiven : function(id) {
		return utils.aboutMeId + '_' + id;
	},
	
	//method to get name from single aboutMeData object
	getName : function(aboutMeData) {
		return aboutMeData.name;
	},
	
	//method to get designation from single aboutMeData object
	getDesignation : function(aboutMeData) {
		return aboutMeData.designation;
	},
	
	//method to get image from single aboutMeData object
	getImage : function(aboutMeData) {
		return aboutMeData.image;
	},
	
	//8 methods are provided that act on contact-list
	//method to get show-contact
	getShowContact : function(object) {
		if(typeof(object.show)!=="undefined") {
			return object.show;
		} else {
			return false;
		}
	},
	
	//method to identify if contact is a link or popup
	getLinkNotPopupForContact : function(object) {
		if(typeof(object.linkNotPopup)!=="undefined") {
			return object.linkNotPopup;
		} else {
			return false;
		}
	},
	
	//method to get contact-data
	getContactData : function(object) {
		return object.data;
	},
	
	//method to get extra dtaa provided for contact-data
	getContactDataExtra : function(object) {
		if(typeof(object.dataExtra)==='undefined') {
			return '';
		} else {
			return object.dataExtra;
		}
	},
	
	//method to get font-awesome contact-font
	getContactFaFont : function(object) {
		return object.faFont;
	},
	
	//method to get bootstrap-social contact-button
	getContactBsButton : function(object) {
		return object.bsButton;
	},
	
	//method to get html if data is link, not popup
	//Also note: add a padding so that it looks un-clutterted; also added option that the buttons expand when hovered; make large buttons
	//use <a> not <button>, latter does not show hyperlinks on webpage
	getBootstrapContactForLinkData : function(object) {
		return '<div class="btn-group aboutMe_social">'
				+ '<a type="button" class="btn btn-social-icon ' + aboutMeUtils.getContactBsButton(object) + '" '
				+ 'href="' + aboutMeUtils.getContactData(object) + '" target="_blank">'
				+ '<i class="' + aboutMeUtils.getContactFaFont(object) + '"></i>'
				+ '</a></div>';
	},
	
	//method to get html if data is popup, not link
	getBootstrapContactForPopupData : function(object) {
		var mainData = aboutMeUtils.getContactData(object);
		var extraData = aboutMeUtils.getContactDataExtra(object);
		if(aboutMeUtils.getContactDataExtra(object).length>0) {
			extraData = '[' + extraData + ']';
		}
		//the class "aboutMe_popover" is added so that it can be enabled after adding html
		return '<div class="btn-group aboutMe_social">'
				+ '<button type="button" class="aboutMe_popover btn btn-social-icon ' + aboutMeUtils.getContactBsButton(object) + '" '
				+ 'data-toggle="popover" data-content=\'' + (mainData + ' ' + extraData) + '\'><i class="' + aboutMeUtils.getContactFaFont(object) + '"></i>'
				+ '</button>' //using data-content='' format instead of data-content="". Former enables adding links in description
				+ utils.copyOnClickButton(mainData)
				+ '</div>';
	},
	
	//method to get corresponding Bootstrap-social button with link attached for all contact data
	getBootstrapButtons : function(aboutMeData) {
		var buttonStr = '';
		if(typeof(aboutMeData.contact)==="undefined" || aboutMeData.contact.length==0) {
			return '';
		}
		for(var i = 0, size = aboutMeData.contact.length; i < size ; i++){
			if(aboutMeUtils.getShowContact(aboutMeData.contact[i])) {
				if(aboutMeUtils.getLinkNotPopupForContact(aboutMeData.contact[i])) {
					buttonStr = buttonStr + aboutMeUtils.getBootstrapContactForLinkData(aboutMeData.contact[i]);
				} else {
					buttonStr = buttonStr + aboutMeUtils.getBootstrapContactForPopupData(aboutMeData.contact[i]);
				}
			}
		}
		if(buttonStr.length!=0) {
			return '<div class="btn-toolbar" aria-label="contact-me options">' + buttonStr + '</div>';
		} else {
			return '';
		}
	},
	
	//method to get fullDescription from single aboutMeData object. The data is joined with html formatting
	getBootstrapFullDescription : function(aboutMeData) {
		var descrip = '';
		for(var i = 0, size = aboutMeData.fullDescription.length; i < size ; i++){
			descrip = descrip + '<p class="text-justify">' + aboutMeData.fullDescription[i] + '</p>';
		}
		return descrip;
	},
	
	//6 methods for quote
	//method to get hide/show from single aboutMeData object
	getQuoteShow : function(aboutMeData) {
		if(typeof(aboutMeData.quote)==="undefined" || typeof(aboutMeData.quote.show)==="undefined") {
			return false;
		} else {
			return aboutMeData.quote.show;
		}
	},
	
	//method to get quoteText from single aboutMeData object
	getQuoteText : function(aboutMeData) {
		return aboutMeData.quote.quoteText;
	},
	
	//method to get author from single aboutMeData object
	getQuoteAuthor : function(aboutMeData) {
		if(typeof(aboutMeData.quote.author)==="undefined") {
			return '';
		}
		return aboutMeData.quote.author.trim();
	},
	
	//method to get source-text from single aboutMeData object
	getQuoteSourceText : function(aboutMeData) {
		if(typeof(aboutMeData.quote.sourceText)==="undefined") {
			return '';
		}
		return aboutMeData.quote.sourceText.trim();
	},
	
	//method to get source-link from single aboutMeData object
	getQuoteSourceLink : function(aboutMeData) {
		if(typeof(aboutMeData.quote.sourceLink)==="undefined") {
			return '';
		}
		return aboutMeData.quote.sourceLink.trim();
	},
	
	//method to get Bootstrap quote-text from single aboutMeData object
	getBootstrapQuote : function(aboutMeData) {
		if(aboutMeUtils.getQuoteShow(aboutMeData)) {
			//get necessary data
			var quote = aboutMeUtils.getQuoteText(aboutMeData);
			var author = aboutMeUtils.getQuoteAuthor(aboutMeData);
			var sourceText = aboutMeUtils.getQuoteSourceText(aboutMeData);
			var sourceLink = aboutMeUtils.getQuoteSourceLink(aboutMeData);
			//create the author/source/cite line - based on data
			var bottomLine;
			if(author.length!==0) {
				if(sourceText.length!==0) {
					if(sourceLink.length!==0) {
						bottomLine = '<footer>' + author + ' in <cite title="' + sourceLink + '">' + sourceText + '</cite></footer>';
					} else {
						bottomLine = '<footer>' + author + ' in ' + sourceText + '</footer>';
					}
				} else {
					bottomLine = '<footer>' + author + '</footer>';
				}
			} else {
				bottomLine = '';
			}
			return '<blockquote><p>' + quote + '</p>' + bottomLine + '</blockquote>';
		} else {
			return '';
		}
	},
	
}