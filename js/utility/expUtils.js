//This namespace contains method to read experience json file and provide corresponding details
//Note that sometimes it may be needed to take the read data through additional processing befor giving it to main code. All those logic are executed here
var expUtils = {
	
	//constants
	monthsPerYear : 12,
	//---- following constants used when assigning heights
	heightPerMonthInRad : 2, //relation between radius months and height
	heightEnhanceSz : 1, //this constant is used to change the height for experiences with same start/end entry

	//function to get months between 2 time object used
	monthIntervalFunc : function(start, end) {
		return expUtils.monthsPerYear*(end.year - start.year) + (end.month - start.month);
	},
	
	//function returning class name for all entries linked to particular experience
	expClassLinkPrefix : "expClassLink_",
	getClassForExp : function(expId) {
		return expUtils.expClassLinkPrefix + expId;
	},

	//function to declare "today's" date and related variables - this is used in performing calculations
	defineTodayDateVars : function() {
		expUtils.todayDate = new Date();
		expUtils.todayYear = expUtils.todayDate.getFullYear();
		expUtils.todayMonthOneShift = expUtils.todayDate.getMonth() + 1; //because JS gives months in 0-11
		//this is used in experience.skillsUsed.duration if not given by user
		expUtils.defaultSkillUsedTimeEnd = {year: expUtils.todayYear, month: expUtils.todayMonthOneShift};
		//this is used in sorting experience data. Note that the default time goes 1 month in future so that experiences which finished in this month come before those that are still ongoing
		expUtils.defaultTimeEndForExpSort = {year: expUtils.todayYear, month: expUtils.todayMonthOneShift + 1}; 
		if(expUtils.defaultTimeEndForExpSort.month>12) {
			expUtils.defaultTimeEndForExpSort.month -= 12;
			expUtils.defaultTimeEndForExpSort.year += 1;
		}
	},
	
	//this method transforms experience/skill data read from json in a format more useful for making plots
	//note that in doing so, it also defines some other variables of interest that are used in making plots. BUT, these variables depend on experience.json data and not on screen size - so changing screen size does not affect the data created
	transformExpSkillData : function(expSkillData) {
		
		//define some variables - ones that should be done first because they can be used in multiple steps
		expUtils.defineTodayDateVars();
		//do some preprocessing
		expUtils.sortSkillsDataById(expSkillData.skills);
		expUtils.sortExpDataByDateId(expSkillData.experiences);
		expUtils.sortSkillUsedInExpById(expSkillData.experiences);
		expUtils.defineExpMinTimeStart(expSkillData.experiences[0]); //define expMinTimeStart only after sorting
		expUtils.makeStartEndDateStr(expSkillData.experiences);
		expUtils.checkSetSkillsUsedDurationForExp(expSkillData.experiences);
		//make some supporting objects used locally in method
		//---- turn skill-description list into a map of skill-id and corresponding skill-object. This is used in making new skill data
		var skillIdNameMap = new Map();
		for(var i=0, size=expSkillData.skills.length; i<size; i++) {
			skillIdNameMap.set(expSkillData.skills[i].id, expSkillData.skills[i]);
		}
		
		//[START-OF] making new data
		var newExpArr = []; //new experience array object. 1-d arr
		//these 2 variables are used to identify if new entry being iterated over has same timeStart and timeEnd as previous entry. Thus, help in changing height
		var prevTimeStartStr = ""; 
		var prevTimeEndStr = "";
		//if a height increase is needed, then this variable identifies the factor by which-many-times the increase should be done
		var heightEnhanceCnt = 0;
		// A map of skill-id and corresponding (new) skill entry objects, chronologically adding new entries to skill-id as it is encountered. This is used in making skill plot.
		var newSkillMap = new Map();
		for(var i=0, size=expSkillData.skills.length; i<size; i++) {
			newSkillMap.set(expSkillData.skills[i].id, {name:expSkillData.skills[i].name, expUseList:[]});
		}
		//few extra objects that are made because it is used by d3-plots. Thus, these variables are assigned to name space
		expUtils.expMaxPlotHorizWidth = 0; 
		expUtils.expMaxPlotVertHeight = 0;
		expUtils.expMaxTimeEnd = {year:expUtils.expMinTimeStart.year, month:expUtils.expMinTimeStart.month}; // this variable is used for setting time-ticks
		
		//---- [START-OF] LOOP TO MAKE NEW DATA
		for(var i=0, size=expSkillData.experiences.length; i<size; i++) {
			//creating new expArr object that goes in newExpArr array - in chronological manner
			var expObj = {};
			//[For new expArr object] setting its index location after sort as its id. IT IS NOT the id given in expSkillData.experiences
			expObj.id = i;
			//[For new expArr object] setting how far from plot's start does this experience start 
			expObj.startOffsetMonths = expUtils.monthIntervalFunc(expUtils.expMinTimeStart, expSkillData.experiences[i].timeStart); 
			//[For new expArr object] setting month-radius of experience, including start and end months.
			//---- Also find the max horizontal width (in unit of months) up to which plot will go
			if(typeof(expSkillData.experiences[i].timeEnd)==="undefined" || typeof(expSkillData.experiences[i].timeEnd.month)==="undefined") {
				//so this research is still ongoing, use [(current - start) +1] as radius
				expObj.radMonths = expUtils.monthIntervalFunc(expSkillData.experiences[i].timeStart, expUtils.defaultSkillUsedTimeEnd) + 1;
				expUtils.expMaxPlotHorizWidth = Math.max(expUtils.expMaxPlotHorizWidth,(expObj.startOffsetMonths + expObj.radMonths)); //because plot needs to go upto half circle
				expUtils.expMaxTimeEnd = expUtils.defaultSkillUsedTimeEnd; //if timeEnd is undefined, then it is marked as current experience. This can be max timeEnd possible
			} else {
				expObj.radMonths = (expUtils.monthIntervalFunc(expSkillData.experiences[i].timeStart, expSkillData.experiences[i].timeEnd) + 1)/2;
				expUtils.expMaxPlotHorizWidth = Math.max(expUtils.expMaxPlotHorizWidth,(expObj.startOffsetMonths + 2*expObj.radMonths)); //because plot needs to go upto full circle
				if(expUtils.monthIntervalFunc(expUtils.expMaxTimeEnd, expSkillData.experiences[i].timeEnd)>0) {
					expUtils.expMaxTimeEnd = expSkillData.experiences[i].timeEnd;
				}
			}
			//[For new expArr object] setting height
			//---- identify if new timeStartStr and timeEndStr are same as previous one. If so, increase heightEnhanceCnt. else reset it to 0
			if(expSkillData.experiences[i].timeStartStr===prevTimeStartStr && expSkillData.experiences[i].timeEndStr===prevTimeEndStr) {
				heightEnhanceCnt += 1;
			} else {
				heightEnhanceCnt = 0; //reset count if previous and current entry not same
			}
			//---- update prevTimeStartStr and  prevTimeEndStr
			prevTimeStartStr = expSkillData.experiences[i].timeStartStr;
			prevTimeEndStr = expSkillData.experiences[i].timeEndStr;
			//---- set height
			expObj.height = expObj.radMonths*(expUtils.heightPerMonthInRad + heightEnhanceCnt*expUtils.heightEnhanceSz);
			//---- Also find the max vertical height (in unit of ht-scaled-months) up to which plot will go
			expUtils.expMaxPlotVertHeight = Math.max(expUtils.expMaxPlotVertHeight,expObj.height);
			//[For new expArr object] setting text displayed on tooltip 
			expObj.tooltipTitle = expSkillData.experiences[i].title;
			//[For new expArr object] setting description 
			expObj.description = expUtils.getBootstrapTableDescForExp(expSkillData.experiences[i], skillIdNameMap);
			//[For new expArr object] setting the classes it should have to link it to corresponding skills and table
			expObj.class = expUtils.getClassForExp(expObj.id);
			//[For new expArr object] pushing the new expObj object in expArr array
			newExpArr.push(expObj);
	
			//creating new skillsUsed object that goes in newSkillMap map - in chronological manner
			if(typeof(expSkillData.experiences[i].skillsUsed)!=="undefined" && expSkillData.experiences[i].skillsUsed.length>0) {
				for(var j=0, size2=expSkillData.experiences[i].skillsUsed.length; j<size2; j++) {
					var skillObj = {};
					skillObj.tooltipTitle = expSkillData.experiences[i].title;
					skillObj.class = expUtils.getClassForExp(expObj.id); //all skill-sub-entries linked with same class
					skillObj.expId = expObj.id; //used in assigning same color to skill as to experience
					skillObj.monthDuration = expSkillData.experiences[i].skillsUsed[j].monthDuration; //used to define height of skillSubEntry
					newSkillMap.get(expSkillData.experiences[i].skillsUsed[j].skillId).expUseList.push(skillObj);
				}
			}
		}
		//---- [END-OF] LOOP TO MAKE NEW DATA

		//Finally, before returning the new data, set it in appropriate formatted
		//---- After creating new exp objects, it is also necessary to assign them a z-value to ensure that all entries are clickable and smaller "experience" entries don't get hidden behind bigger ones. IN SVG, the "z-value" is index ordered, i.e. elements painted first go at bottom and those painted later go on top. Refr: http://stackoverflow.com/questions/17786618/how-to-use-z-index-in-svg-elements    To ensure that all elements are visible, the newExpArr needs to be sorted by heights descending. This ensures that smallest circles have highest priority in being visible. For those with same height, the ones with smaller startOffsetMonths should be put later to give them high z-value. This should completely break any degeneracy
		expUtils.sortNewExpArrByHtOffset(newExpArr);
		//---- from the newSkillMap, remove id that do not have any entries from any experience. When making array, sort by skill-id
		var newSkillArr = expUtils.getNewSkillArrFromMap(newSkillMap);
		//return
		return {experiences:newExpArr, skills:newSkillArr};
	},
	
	//this method sorts the skills entry in experience.json data in ascending order by Id
	sortSkillsDataById : function(skillList) {
		skillList.sort(function(a,b) {
			return a.id - b.id;
		});
	},
	
	//this method sorts the skills entry in experience.json data in ascending order by Id
	sortExpDataByDateId : function(experienceList) {
		//By design, we want to arrange each rectangular block for a skill chronlogically such that click/hover on those elements trigger corresponding experience. Thus it becomes necessary to sort experience chronologically ascending, so that we access skills in proper order. Further, for same startTime, we want to have the ones with close endTime by sorted before those with later endTimes. For same start/end time sort ascending by id
		experienceList.sort(function(a,b) {
			//highest priority - sort by start date
			if(expUtils.monthIntervalFunc(a.timeStart, b.timeStart)!==0) {
				return -expUtils.monthIntervalFunc(a.timeStart, b.timeStart);
			}
			//next priority, sort by end date - define it if not already
			var aTimeEnd = a.timeEnd;
			if(typeof(a.timeEnd)==="undefined" || typeof(a.timeEnd.month)==="undefined") {
				aTimeEnd = expUtils.defaultTimeEndForExpSort;
			}
			var bTimeEnd = b.timeEnd;
			if(typeof(b.timeEnd)==="undefined" || typeof(b.timeEnd.month)==="undefined") {
				bTimeEnd = expUtils.defaultTimeEndForExpSort;
			}
			if(expUtils.monthIntervalFunc(aTimeEnd, bTimeEnd)!==0) {
				return -expUtils.monthIntervalFunc(aTimeEnd, bTimeEnd);
			}
			//finally break degeneracy by  id. Smaller id gets higher sorted first
			return a.id - b.id;
		});
	},
	
	//this method sorts the skillsUsed entry in each experience entry from experience.json data in ascending order by Id
	sortSkillUsedInExpById : function(experienceList) {
		for(var i=0, size=experienceList.length; i<size; i++) {
			if(typeof(experienceList[i].skillsUsed)!=="undefined" && experienceList[i].skillsUsed.length>0) {
				experienceList[i].skillsUsed.sort(function(a,b) {
					return a.skillId - b.skillId;
				});
			}
		}
	},
	
	//this method is used to get expMinTimeStart. It is not the minimum timeStart among all entries, which, after sorting is bound to expSkillData.experiences[0]. But it is the value from where the experience-plot will start. Also format it so that it is always 1st or 7th month of year, and there is a minimum 6 months gap from this value (i.e. start of experience plot timeline) to first experience entry
	defineExpMinTimeStart : function(experience) {
		expUtils.expMinTimeStart = {year:experience.timeStart.year, month:experience.timeStart.month - 6};
		if(expUtils.expMinTimeStart.month<1) { // if month was negative, means we need to round to 7th month of last year
			expUtils.expMinTimeStart.month = 7; //remember, we are starting from 1-12 for month, not 0-11 used by JS
			expUtils.expMinTimeStart.year -= 1;
		} else { // else round to 1st month of this year
			expUtils.expMinTimeStart.month = 1;
		}
	},

	//this method adds a start and end date string to experience data. It is used in description and, more importantly, in identifying height
	makeStartEndDateStr : function(experienceList) {
		for(var i=0, size=experienceList.length; i<size; i++) {
			experienceList[i].timeStartStr = experienceList[i].timeStart.month + "/" + experienceList[i].timeStart.year;
			if(typeof(experienceList[i].timeEnd)==="undefined" || typeof(experienceList[i].timeEnd.month)==="undefined") {
				experienceList[i].timeEndStr = "Current";
			} else {
				experienceList[i].timeEndStr = experienceList[i].timeEnd.month + "/" + experienceList[i].timeEnd.year;
			}
		}
	},
	
	//this method preprocesses experience data (Data read from json, not the newly made data) and checks/sets correct skill-duration for each skillsUsed entry in each experience
	checkSetSkillsUsedDurationForExp : function(experienceList) {
		for(var i=0, size=experienceList.length; i<size; i++) {
			if(typeof(experienceList[i].timeEnd)==="undefined" || typeof(experienceList[i].timeEnd.month)==="undefined") {
				//check and set duration in skills used entries
				var maxSkillUsedMonths = expUtils.monthIntervalFunc(experienceList[i].timeStart,expUtils.defaultSkillUsedTimeEnd) + 1;
				if(typeof(experienceList[i].skillsUsed)!=="undefined" && experienceList[i].skillsUsed.length>0) {
					for(var j=0, size2=experienceList[i].skillsUsed.length; j<size2; j++) {
						if(typeof(experienceList[i].skillsUsed[j].monthDuration)==="undefined" || experienceList[i].skillsUsed[j].monthDuration<=0 || experienceList[i].skillsUsed[j].monthDuration>maxSkillUsedMonths) {
							experienceList[i].skillsUsed[j].monthDuration = maxSkillUsedMonths;
						}
					}
				}
			} else {
				//check and set duration in skills used entries
				var maxSkillUsedMonths = expUtils.monthIntervalFunc(experienceList[i].timeStart,experienceList[i].timeEnd) + 1;
				if(typeof(experienceList[i].skillsUsed)!=="undefined" && experienceList[i].skillsUsed.length>0) {
					for(var j=0, size2=experienceList[i].skillsUsed.length; j<size2; j++) {
						if(typeof(experienceList[i].skillsUsed[j].monthDuration)==="undefined" || experienceList[i].skillsUsed[j].monthDuration<=0 || experienceList[i].skillsUsed[j].monthDuration>maxSkillUsedMonths) {
							experienceList[i].skillsUsed[j].monthDuration = maxSkillUsedMonths;
						}
					}
				}
			}
		}
	},
	
	//this method returns the bootstrap table description for experience. The experience data used is the original one read from json and not the new one
	getBootstrapTableDescForExp : function(experience, skillIdNameMap) {
		var titleStr = experience.title;
		if(typeof(experience.webpage)!=="undefined" || experience.webpage.length!=0) {
			titleStr = titleStr + ' [<a href="' + experience.webpage + '" target="_blank">WEBPAGE</a>]';
		}
		var awardStr = "";
		if(typeof(experience.awards)!=="undefined" && experience.awards.length!==0) {
			awardStr = awardStr + '<tr><td rowspan="' + experience.awards.length + '"><b><u>AWARDS: </u></b></td><td>' + experience.awards[0] + '</td></tr>';
			for(var i=1, size=experience.awards.length; i<size; i++) {
				awardStr = awardStr + '<tr><td>' + experience.awards[i] + '</td></tr>';
			}
		}
		/*
		var skillStr = "";
		if(typeof(experience.skillsUsed)!=="undefined" || experience.skillsUsed.length!==0) {
			skillStr = '<tr><td>Skills Used:</td><td>';
			for(var i=0, size=experience.skillsUsed.length; i<size; i++) {
				skillStr = skillStr + skillIdNameMap.get(experience.skillsUsed[i].skillId).name + " ";
			}
			skillStr = skillStr + '</td></tr>';
		}
		*/
		var skillStr = "";
		if(typeof(experience.skillsUsed)!=="undefined" || experience.skillsUsed.length!==0) {
			skillStr = '<tr><td>Skills Used:</td><td>';
			for(var i=0, size=experience.skillsUsed.length; i<size; i++) {
				skillStr = skillStr + '<button type="button" class="btn btn-info btn-sm aboutMe_expSkillUsed" data-toggle="popover" data-content=\'' + expUtils.getBootstrapDescForSkillInExp(experience.skillsUsed[i]) + '\'>' + skillIdNameMap.get(experience.skillsUsed[i].skillId).name + '</button> '; //extra space at end to keep gap between consecutive buttons. aboutMe_expSkillUsed class to enable tooltip
			}
			skillStr = skillStr + '</td></tr>';
		}
		var paperStr = "";
		if(typeof(experience.papers)!=="undefined" && experience.papers.length!==0) {
			paperStr = paperStr + '<tr><td rowspan="' + experience.papers.length + '"><b><u>AWARDS: </u></b></td><td>' + experience.papers[0] + '</td></tr>';
			for(var i=1, size=experience.papers.length; i<size; i++) {
				paperStr = paperStr + '<tr><td>' + experience.papers[i] + '</td></tr>';
			}
		}
		//make the table html
		return '<table class="table table-bordered table-responsive"><tbody>'
			+ '<tr><th colspan="2">' + titleStr + '</th></tr>'
			+ '<tr><td colspan="2">' + experience.workplace + ' (' + experience.timeStartStr + ' - ' + experience.timeEndStr + ')</td></tr>'
			+ awardStr
			+ skillStr
			+ '<tr><td>Description:</td><td>' + experience.description + '</td></tr>'
			+ paperStr
			+ '</tbody></table>';
	},
	
	getBootstrapDescForSkillInExp : function(skillSubUnit) {
		return '<p>' + skillSubUnit.useDescription + ' (<b>' + skillSubUnit.monthDuration + '</b> months)</p>';
	},
	
	//this method is used to sort the newExpArr by height first, and by startOffsetMonths as second priority
	sortNewExpArrByHtOffset : function(newExpArr) {
		newExpArr.sort(function(a,b) {
			//first priority, sort by height
			if(a.height!==b.height) {
				return -(a.height - b.height); //initial minus-sign is to show descending sort
			}
			return -(a.startOffsetMonths - b.startOffsetMonths); 
		});
	},
	
	//this method accepts the newSkillMap and returns suitable array of skills that can be used for plotting
	getNewSkillArrFromMap : function(newSkillMap) {
		keyArr = [];
		//remove entries from map that have no experience where the skills were used
		for (var [key, value] of newSkillMap) {
			if (value.expUseList.length===0) {
				newSkillMap.delete(key);
			} else {
				keyArr.push(key);
			}
		}
		//sort keyArr (i.e. array containing id(s) in ascending order
		keyArr.sort(function(a,b) {return a-b;});
		//make a new array where values are sorted by id.
		newSkillArr = [];
		for(var i=0, size=keyArr.length; i<size; i++) {
			newSkillArr.push(newSkillMap.get(keyArr[i]));
		}
		//return
		return newSkillArr;
	},
	
	//this method accepts a numeric id and provides corresponding colorDepth
	colArr : ["#1f77b4","#98df8a","#d62728","#c5b0d5","#8c564b","#f7b6d2","#7f7f7f","#dbdb8d","#17becf","#aec7e8","#2ca02c","#ff9896","#9467bd","#c49c94","#e377c2","#c7c7c7","#bcbd22","#9edae5"],  //take d3.schemeCategory20, remove 2 orange, then keep 2 color, remove 2 color. Finally append the removed pairs at end in same sequence. This creates dark-light pair of dissimilar type
	colorForId : function(numId) {
		return expUtils.colArr[(numId)%18]; 
	},
	
	//this method uses the transformed experience data to make corresponding plot
	drawExpD3InIdDim : function(newExpList, id, cssParams, expD3Callback) {
		//start by cleaing out previous html
		$('#' + id).html('');
		//make d3 plot, start by making svg element
		var expSvg = d3.select("#" + id).append("svg")
					.attr("height", cssParams.plotHeight + cssParams.margin.top + cssParams.margin.bottom)
					.attr("width", cssParams.plotWidth + cssParams.margin.right + cssParams.margin.left);
		var expSvgShiftGrp = expSvg.append("g").attr("transform", "translate(" + cssParams.margin.left + "," + cssParams.margin.top + ")");
		//define tooltip for use. Then initialize it on expSvg
		var expSvgToolTip = d3.tip().attr("class", "d3-tip").offset([-8, 0]).html(function(d) { return d.tooltipTitle; });
		expSvg.call(expSvgToolTip);
		//create scale(s)
		//---- scale to get ellipse x-location
		var expXScale = d3.scaleLinear()
							.domain([0, expUtils.expMaxPlotHorizWidth])
							.range([0, cssParams.plotWidth]); //not using .nice() at end. data is formatted
		//---- scale to get ellipse x-radius (same as expXScale)
		var expXRadScale = d3.scaleLinear()
							.domain([0, expUtils.expMaxPlotHorizWidth])
							.range([0, cssParams.plotWidth]);
		//---- scale to get ellipse y-radius
		var expYRadScale = d3.scaleLinear()
							.domain([0, expUtils.expMaxPlotVertHeight])
							.range([0, cssParams.plotHeight]);
		//---- scale for time : used in making axis
		var expXTimeScale = d3.scaleTime()
							.domain([new Date(expUtils.expMinTimeStart.year, expUtils.expMinTimeStart.month - 1, 1), new Date(expUtils.expMaxTimeEnd.year, expUtils.expMaxTimeEnd.month - 1, 28)])
							.range([0, cssParams.plotWidth]);
		//making clipPath to prevent overflow of images outside the required area
		var expSvgClipPath = expSvg.append("clipPath").attr("id","clipPathForExpPlot")
							.append("rect")
							//Note that since clipPath will apply to expSvgShiftGrp which is shifted, so clip-path's x,y should not be shifted again
							.attr("x",0) 
							.attr("y",0)
							.attr("width",cssParams.plotWidth)
							.attr("height",cssParams.plotHeight);
		//making new elements within expSvgShiftGrp by applying clipPath to it. The images will be drawn here
		var expDrawSvg = expSvgShiftGrp.append("g").attr("id","plot-area-exp").attr("clip-path","url(#clipPathForExpPlot)");
		//make ellipses in plot area
		expDrawSvg.selectAll("ellipse").data(newExpList).enter().append("ellipse")
				.attr("cx",function(d){return expXScale(d.startOffsetMonths + d.radMonths);})
				.attr("cy",cssParams.plotHeight) //remember, svg takes height from top, so for center to be at bottom height should be maxxed-out
				.attr("rx",function(d){return expXRadScale(d.radMonths);})
				.attr("ry",function(d){return expYRadScale(d.height);})
				.attr("fill",function(d){return expUtils.colorForId(d.id);})
				.attr("fill-opacity",cssParams.fillOpacityWithoutHover)
				.attr("stroke","black")
				.attr("stroke-opacity",cssParams.strokeOpacityWithoutHover)
				.attr("class",function(d){return d.class;})
				.each(function(d){expD3Callback(d);})
				.on('mouseover', expSvgToolTip.show) //d3-tip's tooltip
				.on('mouseout', expSvgToolTip.hide);
		//make x-axis
		var xTickCnt = Math.max(3,Math.floor(cssParams.plotWidth/cssParams.xTickGap)); //Decide how many x-ticks to show
		var expXAxis = d3.axisBottom(expXTimeScale)
						.ticks(xTickCnt) //NOTE: can also use .ticks(d3.timeYear.every(1))
						.tickSize(6,0)
						.tickFormat(d3.timeFormat("%m/%y"));
		expSvgShiftGrp.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + cssParams.plotHeight + ")")
			.call(expXAxis)
				.selectAll("text") //see https://bl.ocks.org/mbostock/4403522 - also covers rotation of ticks
				.style("font-size",(cssParams.xTickSize + "px"));
		//don't make y-axis, not needed. Y-axis does not convey any measure/units
	},
	
	//this method uses the transformed skill data to make corresponding plot
	d3SkillPadInner : 0.2, //constants for inner ad outer padding percentage
	d3SkillPadOuter : 0,
	drawSkillD3InIdDim : function(newSkillList, id, cssParams, skillSubUnitD3Callback) {
		//start by cleaing out previous html
		$('#' + id).html('');
		//reformat data to make it 1-d. This is easy to draw rectangles. Also identify max-skill-used duration for any one skill and get the skill-description array used in making x-axis ticks
		var newSkillList2 = [];
		var skillNameArr = [];
		var maxSkillUsedDuration = 0;
		for(var i=0, size=newSkillList.length; i<size; i++) {
			var prevDuration = 0;
			skillNameArr.push(newSkillList[i].name);
			for(var j=0, size2=newSkillList[i].expUseList.length; j<size2; j++) {
				newSkillList[i].expUseList[j].id = i; //to get the x location where rectangle should be put
				newSkillList[i].expUseList[j].prevDuration = prevDuration; //to get y-offset of rectangle
				newSkillList2.push(newSkillList[i].expUseList[j]);
				prevDuration += newSkillList[i].expUseList[j].monthDuration;
			}
			//above loop misses count from last entry, so adding it again
			prevDuration += newSkillList[i].expUseList[j-1].monthDuration;
			//getting maxSkillUsed for any skill
			maxSkillUsedDuration = Math.max(maxSkillUsedDuration, prevDuration);
		}
		//make d3 plot, start by making svg element
		var skillSvg = d3.select("#" + id).append("svg")
					.attr("height", cssParams.plotHeight + cssParams.margin.top + cssParams.margin.bottom)
					.attr("width", cssParams.plotWidth + cssParams.margin.right + cssParams.margin.left);
		var skillSvgShiftGrp = skillSvg.append("g").attr("transform", "translate(" + cssParams.margin.left + "," + cssParams.margin.top + ")");
		//define tooltip for use. Then initialize it on skillSvg
		var skillSvgToolTip = d3.tip().attr("class", "d3-tip").offset([-8, 0]).html(function(d) { return d.tooltipTitle; });
		skillSvg.call(skillSvgToolTip);
		//create scale(s)
		//---- scale to get skill rect x-location
		var skillXScale = d3.scaleBand()
							.domain(d3.range(newSkillList.length)) //newSkillList.length, not newSkillList2
							.rangeRound([0, cssParams.plotWidth])
							.paddingInner(expUtils.d3SkillPadInner)
							.paddingOuter(expUtils.d3SkillPadOuter);
		//---- scale to get rect y-start
		var skillYStartScale = d3.scaleLinear()
							.domain([0, maxSkillUsedDuration])
							.range([cssParams.plotHeight, 0]); //remember 'y' is measured from top
		//---- scale to get rect y-height -- same as skillYStartScale
		var skillYHeightScale = d3.scaleLinear()
							.domain([0, maxSkillUsedDuration])
							.range([0, cssParams.plotHeight]);
		//making clipPath to prevent overflow of images outside the required area
		var skillSvgClipPath = skillSvg.append("clipPath").attr("id","clipPathForSkillPlot")
							.append("rect")
							//Note that since clipPath will apply to skillSvgShiftGrp which is shifted, so clip-path's x,y should not be shifted again
							.attr("x",0) 
							.attr("y",0)
							.attr("width",cssParams.plotWidth)
							.attr("height",cssParams.plotHeight);
		//making new elements within skillSvgShiftGrp by applying clipPath to it. The images will be drawn here
		var skillDrawSvg = skillSvgShiftGrp.append("g").attr("id","plot-area-skill").attr("clip-path","url(#clipPathForSkillPlot)");
		//make rectangles in plot area
		skillDrawSvg.selectAll("rect").data(newSkillList2).enter().append("rect") //NOTE: using newSkillList2, not newSkillList
				.attr("x",function(d,i){return skillXScale(d.id);})
				.attr("y",function(d){return skillYStartScale(d.monthDuration + d.prevDuration);}) 
				.attr("width",function(d){return skillXScale.bandwidth();})
				.attr("height",function(d){return skillYHeightScale(d.monthDuration);})
				.attr("fill",function(d){return expUtils.colorForId(d.expId);})
				.attr("fill-opacity",cssParams.fillOpacityWithoutHover)
				.attr("stroke","black")
				.attr("stroke-opacity",cssParams.strokeOpacityWithoutHover)
				.attr("class",function(d){return d.class;})
				.each(function(d){skillSubUnitD3Callback(d);})
				.on('mouseover', skillSvgToolTip.show) //d3-tip's tooltip
				.on('mouseout', skillSvgToolTip.hide);
		//make x-axis
		skillXScale.domain(skillNameArr); //change domain so as to use "skillNames" - as long as they correctly map to previous domain name!!
		var skillXAxis = d3.axisBottom(skillXScale)
						.ticks(skillNameArr.length)
						.tickSize(6,0);
		var skillXAxisSel = skillSvgShiftGrp.append("g")
								.attr("class", "x axis")
								.attr("transform", "translate(0," + cssParams.plotHeight + ")")
								.call(skillXAxis);
		if(cssParams.xTickRot===0) {
			skillXAxisSel.selectAll("text") //see https://bl.ocks.org/mbostock/4403522 - also covers rotation of ticks
						.style("font-size",(cssParams.xTickSize + "px"));
		} else {
			skillXAxisSel.selectAll("text") //see https://bl.ocks.org/mbostock/4403522 - also covers rotation of ticks
						.attr("y", 0)
						.attr("x", 9) //because ticks are that high
						.attr("dy", ".35em") //in its absence ticks don't quite lie on centere of text, dy make the shift based on "text height" to align text and ticks. Also see: http://stackoverflow.com/questions/19127035/what-is-the-difference-between-svgs-x-and-dx-attribute -- see both top and bottom answer. .35em helps in aligning regardless of font size!
						.attr("transform", "rotate(" + cssParams.xTickRot + ")")
						.style("text-anchor", "start") //for rotation by -90, use text-anchor of end, and change x to -9
						.style("font-size",(cssParams.xTickSize + "px"));
		}
		//make y-axis
		var ytickCnt = Math.max(3,Math.floor(cssParams.plotHeight/cssParams.yTickGap)); //Decide how many y-ticks to show
		var skillYAxis = d3.axisLeft(skillYStartScale)
						.ticks(ytickCnt)
						.tickSize(6,0); //set negative inner ticks to make grid lines. See http://bl.ocks.org/hunzy/11110940
		skillSvgShiftGrp.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(0,0)")
			.call(skillYAxis)
				.selectAll("text") //see https://bl.ocks.org/mbostock/4403522 - also covers rotation of ticks
				.style("font-size",(cssParams.yTickSize + "px"));
		//make y-axis label - See http://bl.ocks.org/phoebebright/3061203
        skillSvg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (cssParams.yTickSize) + "," + (cssParams.plotHeight/2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Months")
			.style("font-size",(cssParams.yTickSize + "px"));;
	}
}