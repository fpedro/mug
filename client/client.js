Accounts.ui.config({
  requestPermissions: {
  },
  requestOfflineToken: {
  },
  passwordSignupFields: 'USERNAME_ONLY'
});

Accounts.config({
  forbidClientAccountCreation : true
});

Template.mainPage.displayInformation = function() {
  return Session.get("displayInfo");
}

Template.mainPage.welcomePage = function() {
  return Session.get("welcomePage");
}


Template.userInformation.events = {
  'click #logOutButton' : function(event) {
    Meteor.logout();
    return false;
  },
  
  'click #displayInformation': function(event) {
    Session.set("displayInfo", true);
    return false;
  }
}


Template.tutorial.events = {
  'click #quitInformationPanel' : function(event) {
    Session.set("displayInfo", false);
    return false;
  },
  
  
  'click #step2linkPrevious' : function(event) {
  	$("#step2").hide();
  	$("#step1").fadeIn();
    return false;
  },
  
  'click #step3linkPrevious' : function(event) {
    $("#step3").hide();
  	$("#step2").fadeIn("slow");
    return false;
  },
  
  'click #step4linkPrevious' : function(event) {
  	$("#step4").hide();
  	$("#step3").fadeIn("slow");
    return false;
  },
  
  'click #step5linkPrevious' : function(event) {
  	$("#step5").hide();
  	$("#step4").fadeIn("slow");
    return false;
  },
  
  'click #step6linkPrevious' : function(event) {
  	$("#step6").hide();
  	$("#step5").fadeIn("slow");
    return false;
  },  
  
  'click #step7linkPrevious' : function(event) {
  	$("#step7").hide();
  	$("#step6").fadeIn("slow");
    return false;
  },  
  
  
  
  
  
  
  'click #step1linkNext' : function(event) {
  	$("#step1").hide();
    $("#step2").fadeIn("slow");
    return false;
  },
  
  'click #step2linkNext' : function(event) {
  	$("#step2").hide();
    $("#step3").fadeIn("slow");
    return false;
  },
  
  'click #step3linkNext' : function(event) {
  	$("#step3").hide();
    $("#step4").fadeIn("slow");
    return false;
  },
  
  'click #step4linkNext' : function(event) {
  	$("#step4").hide();
    $("#step5").fadeIn("slow");
    return false;
  },
  
  'click #step5linkNext' : function(event) {
  	$("#step5").hide();
    $("#step6").fadeIn("slow");
    return false;
  },
  
  'click #step6linkNext' : function(event) {
  	$("#step6").hide();
    $("#step7").fadeIn("slow");
    return false;
  },
  
  
  
  'click #displayInformation': function(event) {
    Session.set("displayInfo", true);
    return false;
  }
}

Template.welcome.events = {
  'click #goTutorial' : function(event) {
    Session.set("welcomePage", false);
    return false;
  },
  
  'click #displayInformation': function(event) {
    Session.set("displayInfo", true);
    return false;
  }
}

Template.players.player = function () {
  return Players.find({});
}

Template.introduceStrategy.player = function () {
  return Players.find({idPlayer: Meteor.user().username});
}

Template.createUser.events = {
  'click #createNewUser' : function(event) {
    var name = document.getElementById('newUserId').value;
    var session = document.getElementById('newUserSessionId').value;
    Meteor.call('createPlayer', name, session, "password", 0);
    return false;
  }
}


Template.introduceStrategy.events = {
  'click #submitStrategy' : function(event) {
    var p = document.getElementById('pValue').value;
    var q = document.getElementById('qValue').value;
    Meteor.call('saveStrategy', Meteor.user().username, p, q);
    return false;
  }
}

Template.loginSection.events = {
  'click #loginSectionLogin' : function(event) {
    var u = document.getElementById('loginSectionUsername').value;
    var p = document.getElementById('loginSectionPassword').value;
    Session.set("displayInfo", false);
    var loginSuccess = true;
    Meteor.loginWithPassword(u,p,function(wrong){
      if(wrong){
        alert("Wrong Password");
	    console.log("wrongpass");
        }
      else{
	    var session = Players.findOne({idPlayer: u}).idSession;
	    if(Meteor.userId() && Meteor.user().username !== "admin"){ 
	      Session.set("displayInfo", true);
	      Session.set("welcomePage", true);
	      Meteor.call('insertGroup', u, session);
	      
        }
      }
    });
    return false;
  }
}


Template.introduceSuggestions.events = {
	
	'click #submitSuggestion' : function(event){
		var suggestion = document.getElementById('suggestionField').value;
		var user =  Meteor.user().username;
		Meteor.call('introduceStrategy', user, suggestion);

		$("#suggestionForm").hide();
		$("#finalConsiderations").hide();
  	    $("#thanksSuggestions").fadeIn("slow");
  	    return false;
	}
	
}


Template.createSession.events = {
  'click #createNewSession' : function(event) {
    var idSession = document.getElementById('sessionId').value;
    var populationSize = document.getElementById('populationSize').value;
    var groupSize = document.getElementById('groupSize').value;
    var numberRounds = document.getElementById('numberRounds').value;
    var rule = document.getElementById('rule').value;
    
    //cria ids e pass para todos os utilizadores
    //inicializa todas as estruturas
    
    Meteor.call('createSession', idSession, populationSize, groupSize, numberRounds, "today", rule);
    
    document.getElementById('createSessionForm').reset();
    
    return false;
  }
}

Template.gameArea.events = {
  'click #incrementstate' : function(event) {
    Meteor.call('incState', Meteor.user().username); 
  },
  
  'click #updateRoundReward' : function(event) {
    var user =  Meteor.user().username;
    var session = Players.findOne({idPlayer: user}).idSession;
    Meteor.call('updateRoundReward', user, session);
  },
  
  'click #playNextRound' : function(event) {
    var user =  Meteor.user().username;
    var session = Players.findOne({idPlayer: user}).idSession;
    Meteor.call('prepareNextRound', user, session);
    Meteor.call('insertGroup', user, session);
  }
}

Template.tutorial.nRounds = function(){
	var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
	var session = Sessions.findOne({idSession: idSession});
	return session.numberRounds; 
}

Template.tutorial.groupSize = function(){
	var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
	var session = Sessions.findOne({idSession: idSession});
	return session.groupSize; 
}

Template.listOfUsers.userss = function() {
  return Meteor.users.find({});
}

Template.adminArea.show = function() {
  return (Meteor.user() && Meteor.user().username=="admin");

}

Template.gameArea.show = function() {
  return (Meteor.user() && Meteor.user().username !="admin"); 
}

Template.gameArea.username = function() {
  return Meteor.user().username; 
}

Template.viewSuggestions.suggestions = function(){
	return Suggestions.find({});
}

Template.groupCapacity.sessions = function(){
  return Sessions.find({});
}

Template.groupCapacity.groups = function(idSession){
  return Sessions.findOne({idSession: idSession}).groupCapacity;
}

Template.gameArea.groupMates = function() { 
  var user = Players.findOne({idPlayer: Meteor.user().username});
  return Players.find({actualGroup: user.actualGroup, idSession: user.idSession});
}


Template.reportRoundReward.groupMates = function() { 
  var user = Players.findOne({idPlayer: Meteor.user().username});
  return Players.find({actualGroup: user.actualGroup, idSession: user.idSession});
}

Template.reportRoundReward.roundReward = function() {
  var rewards = Players.findOne({idPlayer: Meteor.user().username}).reward;
  return rewards[rewards.length-1];
}

Template.reportRoundReward.ownOfferReward = function() {
  var p = Players.findOne({idPlayer: Meteor.user().username}).pPlayed;
  p = p[p.length-1];
  return 10-p;
}

Template.reportRoundReward.roundRewardReportOther = function() {
  var rReward = Players.findOne({idPlayer: Meteor.user().username}).othersOfferReport;
  return rReward[rReward.length-1];
}

Template.reportRoundReward.roundRewardReportMine = function() {
  var rReward = Players.findOne({idPlayer: Meteor.user().username}).myOfferReport;
  return rReward[rReward.length-1];
}

Template.gameArea.totalReward = function() {
  var listRewards = Players.findOne({idPlayer: Meteor.user().username}).reward;
  var totalReward = 0;
  for(i=0; i<listRewards.length; i++){
    totalReward = totalReward + parseFloat(listRewards[i]);
  }
  return totalReward;
}

//player state logic propositons (decide what to show to the player)

Template.introduceStrategy.rule = function() {
	var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
	var session = Sessions.findOne({idSession: idSession});
	return session.rule; 	
}

Template.tutorial.rule = function() {
	var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
	var session = Sessions.findOne({idSession: idSession});
	return session.rule; 	
}


Template.gameArea.rewardComputed = function() {
  var state = Players.findOne({idPlayer: Meteor.user().username}).state;
  return (state === 3);
}

Template.gameArea.allRoundsPlayed = function() {
  var timesPlayed = Players.findOne({idPlayer: Meteor.user().username}).timesPlayed;
  var numberRounds = Sessions.findOne({idSession: Players.findOne({idPlayer: Meteor.user().username}).idSession}).numberRounds;
  return (timesPlayed == numberRounds);
}

Template.gameArea.groupIsFull = function(){
  var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
  var state = Players.findOne({idPlayer: Meteor.user().username}).state;
  if(state > 1) return true;
  var session = Sessions.findOne({idSession: idSession});
  var actualGroup = Players.findOne({idPlayer: Meteor.user().username}).actualGroup;
  var capacity = session.groupCapacity[actualGroup];
  return capacity==0;
}

Template.gameArea.strategiesInserted = function(){
  var state = Players.findOne({idPlayer: Meteor.user().username}).state;
  return state >= 2;
}

Template.gameArea.allGroupResponded = function(){
  var actualGroup = Players.findOne({idPlayer: Meteor.user().username}).actualGroup;
  var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
  var receivedStrategiesOnGroup = (Sessions.findOne({idSession: idSession}).receivedStrategiesOnGroup)[actualGroup];
  var groupSize = Sessions.findOne({idSession: idSession}).groupSize;
  return receivedStrategiesOnGroup == groupSize;
}

Template.gameArea.allRewardsCalculated = function(){
  var actualGroup = Players.findOne({idPlayer: Meteor.user().username}).actualGroup;
  var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
  var alreadyCalculatedReward = (Sessions.findOne({idSession: idSession}).alreadyCalculatedReward)[actualGroup];
  var groupSize = Sessions.findOne({idSession: idSession}).groupSize;
  return alreadyCalculatedReward == groupSize;
}
