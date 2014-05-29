/* models */

Players = new Meteor.Collection('players');
Sessions = new Meteor.Collection('sessions');

Suggestions = new Meteor.Collection('suggestions');

Meteor.methods({
  
  //admin methods
  createSession: function(idSession, populationSize, groupSize, numberRounds, date, rule){
    Sessions.insert({idSession: idSession, populationSize: populationSize, groupSize: groupSize, groupCapacity: [], receivedStrategiesOnGroup: [], alreadyCalculatedReward: [], numberRounds: numberRounds, date: date, rule: rule});
    for(i = 0; i<(populationSize/groupSize)*numberRounds; i++){
      Sessions.update({idSession: idSession} ,{$push: {groupCapacity: groupSize}});
      Sessions.update({idSession: idSession} ,{$push: {receivedStrategiesOnGroup: 0}});
      Sessions.update({idSession: idSession} ,{$push: {alreadyCalculatedReward: 0}});
    }

    //create necessary users
    for(i = 0; i<populationSize; i++){
      var newIdPlayer = idSession.concat(i.toString());
      //var randNumber = Math.floor((Math.random()*100)+1);
      var randNumber = 1;
      var password = newIdPlayer.concat(randNumber.toString());
      Players.insert({idPlayer: newIdPlayer, idSession: idSession, timesPlayed: 0, pPlayed: [ ], qPlayed: [ ], reward: [], othersOfferReport: [], myOfferReport: [], actualGroup: "", password: password, state: 0});
      var options = {username: newIdPlayer, password: password};
      Accounts.createUser(options);
    }
  },  
  
  introduceStrategy: function(idPlayer, suggestion){
  	Suggestions.insert({idPlayer: idPlayer, suggestion: suggestion});
  },
  
  createPlayer: function(idPlayer, idSession, password, state){
    Players.insert({idPlayer: idPlayer, idSession: idSession, timesPlayed: 0, pPlayed: [ ], qPlayed: [ ], reward: [], othersOfferReport: [], myOfferReport: [], actualGroup: "", password: password, state: state});
    var options = {username: idPlayer, password: password};
    Accounts.createUser(options);
  },
  
  saveStrategy : function(idPlayer,p,q){
    Players.update({idPlayer: idPlayer}, {$push: {pPlayed: p}});
    Players.update({idPlayer: idPlayer}, {$push: {qPlayed: q}});
    Players.update({idPlayer: idPlayer}, {$set: {state: 2}});
    Players.update({idPlayer: idPlayer}, {$inc: {timesPlayed: 1}});
    var group = Players.findOne({idPlayer: idPlayer}).actualGroup;
    var idSession = Players.findOne({idPlayer: idPlayer}).idSession;
    var rsog = Sessions.findOne({idSession: idSession}).receivedStrategiesOnGroup;
    rsog[group]++;
    Sessions.update({idSession: idSession},{$set: {receivedStrategiesOnGroup: rsog}});
    return false;
  },

  updateRoundReward: function(username, idSession){
    var sessionRule = Sessions.findOne({idSession: idSession}).rule;
    var groupSize = Sessions.findOne({idSession: idSession}).groupSize;
    var group = Players.findOne({idPlayer: username}).actualGroup;
    var roundNumber = 0;
    var groupMates = Players.find({actualGroup: group, idSession: idSession});
    var pp = [];
    var qq = [];
    var names = [];
    var myP = 0;
    var myQ = 0;
    var finalReward = 0;
    
    
    groupMates.forEach(function(g) {      
      if(g.idPlayer == username){
	    myP=(g.pPlayed)[(g.pPlayed).length-1];
	    myQ=(g.qPlayed)[(g.qPlayed).length-1];
	    
      }
      else
      {
      	
	pp= pp.concat((g.pPlayed)[(g.pPlayed).length-1]);
	qq= qq.concat((g.qPlayed)[(g.qPlayed).length-1]);
	names = names.concat(g.idPlayer);
      }
    })


    //my proposal is accepted?
    var countAcceptors = 0;
    
    for(i=0; i<qq.length /*&& countAcceptors<sessionRule*/; i++){
      if(qq[i]<=myP) 
        countAcceptors++;
    }

    var othersReport = [];
    var myReport = []; 
      
    if(countAcceptors>=sessionRule){ 
      finalReward+=(10-myP);
      myReport = myReport.concat({reward:10-myP, acceptors: countAcceptors});
    }
    
    else{
      myReport = myReport.concat({reward:0, acceptors: countAcceptors});
    }
   
    
    //my group mates proposals are accepted?
    for(i=0; i<pp.length; i++){
      var numberAcceptorsProposalP = 0;
      for(j=0; j<qq.length /*&& numberAcceptorsProposalP < sessionRule*/; j++){

        if(i==j){
          if(parseInt(pp[i])>= parseInt(myQ)){
          	numberAcceptorsProposalP++;
          }
        }
        else{
          if(parseInt(pp[i]) >= parseInt(qq[j])) numberAcceptorsProposalP++;
        }
      }
      
      if(numberAcceptorsProposalP>=sessionRule){
       finalReward+=parseFloat(pp[i])/(groupSize-1);
       othersReport = othersReport.concat({id: names[i], offer: (pp[i]*1.0/qq.length), acceptances: numberAcceptorsProposalP});
       }
       else{
       othersReport = othersReport.concat({id: names[i], offer: 0, acceptances: numberAcceptorsProposalP});
       	
       }
       
    }
    
    /* names of who accepted */
    
    Players.update({idPlayer: username},{$push: {reward: finalReward}});
    Players.update({idPlayer: username},{$set:  {state: 3}});
    
    Players.update({idPlayer: username},{$push:  {othersOfferReport: othersReport}});
    Players.update({idPlayer: username},{$push:  {myOfferReport: myReport}});
    
    
    var acr = Sessions.findOne({idSession: idSession}).alreadyCalculatedReward;
    acr[group]++;
    Sessions.update({idSession: idSession},{$set: {alreadyCalculatedReward: acr}});
    
    
    return false;
  }
  
  
});
