module("presence");

//test that a subscription can be loaded successfuly
test("subscription_succeeded generated", function() {
	var xstreamly = new XStreamly(testAppKey,testSecurityToken);
    var channel = xstreamly.subscribe('chat', { presence: true, userInfo:{name:'brian'}});
    stop();

    channel.bind('xstreamly:subscription_succeeded',function(members){
    	ok(true,'got subscription loaded');
    	notEqual(null,members,'members is set');
    	members.each(function(member){
    		log(member);
    	});
        start();
    });
});

//test that member data is set for each message
test("member info is added to message", function() {
	var xstreamly = new XStreamly(testAppKey,testSecurityToken);
    var channel = xstreamly.subscribe('chat', { 
    	presence: true,
    	userInfo:{name:'brian'},
    	includeMyMessages: true});
    stop();
    
    channel.bind('message',function(data){
   		start();
    	equal(data.member.memberInfo.name,'brian','member info is appened to message');
	});

    channel.trigger('message',{text:'hi'});
});
