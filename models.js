/* models */

Players = new Meteor.Collection('players');
Sessions = new Meteor.Collection('sessions');
Suggestions = new Meteor.Collection('suggestions');
Plays = new Meteor.Collection('plays');

Meteor.methods({
  
  createPlayer: function(idPlayer, idSession, password){
    Players.insert({idPlayer: idPlayer, idSession: idSession, pPlayed: [ ], qPlayed: [ ], reward: [], othersOfferReport: [], myOfferReport: [], password: password});
    var options = {username: idPlayer, password: password};
    Accounts.createUser(options);
  },  
  
  //admin methods
  createSession: function(idSession, populationSize, groupSize, numberRounds, date, rule){
    Sessions.insert({idSession: idSession, populationSize: populationSize, groupSize: groupSize, numberRounds: numberRounds, date: date, rule: rule});

    //create necessary users
    for(i = 0; i<populationSize; i++){
      var newIdPlayer = idSession.concat(i.toString());
      //var randNumber = Math.floor((Math.random()*100)+1);
      var randNumber = 1;
      var password = newIdPlayer.concat(randNumber.toString());
      Players.insert({idPlayer: newIdPlayer, idSession: idSession, pPlayed: [ ], qPlayed: [ ], reward: [], othersOfferReport: [], myOfferReport: [], password: password});
      var options = {username: newIdPlayer, password: password};
      Accounts.createUser(options);
    }
  },  
  
  introduceStrategy: function(idPlayer, suggestion){
  	Suggestions.insert({idPlayer: idPlayer, suggestion: suggestion});
  	return false;
  },
  
  saveStrategy : function(idPlayer,p,q, idSession, round){
  	Plays.insert({round: round, idPlayer: idPlayer, p: p, q: q, idSession: idSession});
  	Players.update({idPlayer: idPlayer},{$push:  {pPlayed: p}});
  	Players.update({idPlayer: idPlayer},{$push:  {qPlayed: q}});
  	
  	return false;
  },

  updateRoundReward: function(username, idSession, round){
  	
  	
  	//choose group-size -1 random strategies from the plays
  	//compute reward
  	//update player reward
  	
    var sessionRule = Sessions.findOne({idSession: idSession}).rule;
    var groupSize = Sessions.findOne({idSession: idSession}).groupSize;
    
    var roundNumber = 0;
    var pp = [];
    var qq = [];
    var names = [];
    var myP = 0;
    var myQ = 0;
    var finalReward = 0;

    myP=Plays.findOne({idPlayer: username, idSession: idSession, round: round}).p;
    myQ=Plays.findOne({idPlayer: username, idSession: idSession, round: round}).q;
    
    ppTmp = [];
    qqTmp = [];
    namesTmp = [];
    
    var tmpResults = Plays.find({idSession: idSession, round: round});
    tmpResults.forEach(function (val) {
    	if(val.idPlayer != username){
    	  ppTmp = ppTmp.concat(val.p);
    	  qqTmp = qqTmp.concat(val.q);
    	  namesTmp = namesTmp.concat(val.idPlayer);
    	}
    });
    
    var indexes = [];
    var times = 0;
    
    //select random strategies
    while(times < (groupSize-1)){
    	var rrr = Math.floor(Math.random() * (groupSize-1));
	while(indexes.indexOf(rrr)>0) rrr = Math.floor(Math.random() * (groupSize-1));
    	indexes = indexes.concat(rrr);
    	times += 1;
    }
    
    for(i=0; i<indexes.length; i++){    
    	pp=pp.concat(ppTmp[indexes[i]]);
    	qq=qq.concat(qqTmp[indexes[i]]);
    	names = names.concat(namesTmp[indexes[i]]);
    }

    //my proposal is accepted?
    var countAcceptors = 0;
    
    for(i=0; i<qq.length /*&& countAcceptors<sessionRule*/; i++){
      if(parseInt(qq[i])<=parseInt(myP)) 
        countAcceptors++;
    }

    var othersReport = [];
    var myReport = []; 
      
    if(countAcceptors>=sessionRule){ 
      finalReward+=(10-parseInt(myP));
      myReport = myReport.concat({reward:10-parseInt(myP), acceptors: countAcceptors});
    }
    
    else{
      myReport = myReport.concat({reward:0, acceptors: countAcceptors});
    }
   
    
    
    //my group mates proposals are accepted?
    for(i=0; i<pp.length; i++){
      var numberAcceptorsProposalP = 0;
      for(j=0; j<qq.length /*&& numberAcceptorsProposalP < sessionRule*/; j++){

        if(i==j){
          if(parseInt(pp[i]) >= parseInt(myQ)){
          	numberAcceptorsProposalP++;
          }
        }
        else{
          if(parseInt(pp[i]) >= parseInt(qq[j])){ 
            numberAcceptorsProposalP++;
          }
        }
      }
      
      if(numberAcceptorsProposalP>=sessionRule){
       finalReward+=Math.round(parseFloat(pp[i])/(groupSize-1) * 100) / 100;
       othersReport = othersReport.concat({id: names[i], offer: (Math.round(parseFloat(pp[i])/(groupSize-1) * 100) / 100), acceptances: numberAcceptorsProposalP});
       }
       else{
       othersReport = othersReport.concat({id: names[i], offer: 0, acceptances: numberAcceptorsProposalP});
       	
       }
       
    }
    
    Players.update({idPlayer: username},{$push: {reward: Math.round(finalReward * 100) / 100}});
    Players.update({idPlayer: username},{$push:  {othersOfferReport: othersReport}});
    Players.update({idPlayer: username},{$push:  {myOfferReport: myReport}});
    return false;
  }
  
  
});
