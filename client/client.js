Template.players.player = function () {
  return Players.find({});
}

Template.sessions.session = function () {
  return Sessions.find({});
}

Template.createUser.events = {
  'click #createNewUser' : function(event) {
    var name = document.getElementById('newUserId').value;
    var session = document.getElementById('newUserSessionId').value;
    Meteor.call('createPlayer', name, session, "password", 0);
    return false;
  }
}

Template.userInformation.events = {
  'click #logOutButton' : function(event) {
    Meteor.logout();
    return false;
  }
}

Template.introduceStrategy.events = {
  'click #submiteStrategy' : function(event) {
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
    Meteor.loginWithPassword(u,p,function(wrong){
      if(wrong){
	console.log("wrongpass")}
      else{
	var session = Players.findOne({idPlayer: u}).idSession;
	if(Meteor.userId() && Meteor.user().username !== "admin"){ 
	  Meteor.call('insertGroup', u, session);
	}
      }
    });
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
    return false;
  }
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

Template.gameArea.groupIsFull = function(){
  
  var idSession = Players.findOne({idPlayer: Meteor.user().username}).idSession;
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
  return Players.find({actualGroup: actualGroup, state: {$gte: 2}, idSession: idSession}).count()==Sessions.findOne({idSession: idSession}).groupSize;
}

Template.gameArea.events = {
  'click #incrementstate' : function(event) {
    Meteor.call('incState', Meteor.user().username); 
  },
  
  'click #updateRoundReward' : function(event) {
    var user =  Meteor.user().username;
    var session = Players.findOne({idPlayer: user}).idSession;
    Meteor.call('updateRoundReward', user, session);
  }
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

Template.gameArea.roundReward = function() {
  var rewards = Players.findOne({idPlayer: Meteor.user().username}).reward;
  return rewards[rewards.length-1];
}

Template.gameArea.rewardComputed = function() {
  var state = Players.findOne({idPlayer: Meteor.user().username}).state;
  return (state === 3);
}