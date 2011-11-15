var username;
var password;
var securedPath;
var appKey;

var credentialsWrong = function(){
	$.cookie('x-streamly-test-username',null);
	$.cookie('x-streamly-test-password',null);
	username=undefined;
	password = undefined;
}

module("REST",{
	setup:function(){
		if(!username){
			username = $.cookie('x-streamly-test-username');
			if(!username){
				username = prompt('x-stream-ly needs to be athenticated to run this test, please enter your username');
				$.cookie('x-streamly-test-username',username);
			}
		}
		
		if(!password){
			password = $.cookie('x-streamly-test-password');

			if(!password){
				password = prompt('x-stream-ly needs to be athenticated to run this test, please enter your password');
				$.cookie('x-streamly-test-password',password);
			}
		}
		
		stop();
		$.ajax({
			url:xstreamlyRootDomain+'/api/v1.1/',
		   	beforeSend: function(xhr){
			   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
			},
		   	crossDomain: true,
			success:function(data){
				start();
				if(data 
				&& data.app_keys
				&& data.app_keys[0]
				&& data.app_keys[0].link
				&& data.app_keys[0].link.href){
					securedPath=data.app_keys[0].link.href;
					appKey = securedPath.split('/')[3];
				} else {
					throw 'data was misformated';
				}
				
			},
			error:function(jqXHR, textStatus, errorThrown) { 
				console.log(textStatus);
				start();
				throw 'could not get app key from specified credentials, all these tests will fail';
				
			},
		});
	}
});

//test that you can get persisted messages
test("Get Session List", function() {
    stop();
    $.ajax({
    	beforeSend: function(xhr){
			   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
		},
    	url:xstreamlyRootDomain+securedPath+'/security',
    	success:function(data){
    		ok(true,'page request successful');
    		ok(data.success,'data has sucecssfull property set');
    		ok(data.authorized,'authorization was successful');
    		ok(data.sessions.length>0,'there is at least one session');
    		start();
    	},
    	error:function(jqXHR, textStatus, errorThrown) { 
    		ok(false,'(You need to log in before you can run this test) - error: '+textStatus);
    		start();
    	}
    });
});

//Creates a new security token, checks that is got created, deletes it, checks that it got deleted
test("Create and Delete token", function() {
    stop();
    var newTokenKey;
    
    var deleteToken = function(){
    	$.ajax({
    	beforeSend: function(xhr){
			   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
		},
    	url:xstreamlyRootDomain+securedPath+'/security/'+newTokenKey,
    	type: 'DELETE',
    	success:function(data){
    		ok(true,'DELETEed new security token successfuly');
    		checkTokens(false);
    	},
    	error:function(jqXHR, textStatus, errorThrown) { 
    		ok(false,'Failed to delete new security token '+textStatus);
    		start();
    	}
    });
    }
    
    var checkTokens = function(expectedToFindToken){
    	$.ajax({
			beforeSend: function(xhr){
				   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
			},
			url:xstreamlyRootDomain+securedPath+'/security',
			success:function(data){
				var found = false;
				$.each(data.sessions,function(){
					var session = $(this)[0];
					if(session.key ==newTokenKey){
						found = true;
					}
				});
				ok(expectedToFindToken===found,'new key: '+newTokenKey+ ' in correct state');

				if(expectedToFindToken){
					if(found){
						deleteToken();
					} 
					else{
						start();
					}
				}
				else {
					start();
				}

			},
			error:function(jqXHR, textStatus, errorThrown) { 
				ok(false,'Problem getting tokens '+textStatus);
				start();
			}
    	});
    }
    
    $.ajax({
    	beforeSend: function(xhr){
			   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
		},
    	url:xstreamlyRootDomain+securedPath+'/security',
    	type: 'POST',
    	data: {action:'write',channel:'game'},
    	success:function(data){
    		ok(true,'POSTed new security token successfuly');
    		newTokenKey= data;
    		checkTokens(true);
    	},
    	error:function(jqXHR, textStatus, errorThrown) { 
    		ok(false,'(You need to log in before you can run this test) - error: '+textStatus);
    		start();
    	}
    });
});

test("Send message via REST", function() {
    stop();
	//this is overly complicated but we need to retrieve a security token to use
	//for creating the x-streamly object
	$.ajax({
			beforeSend: function(xhr){
				   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
			},
			url:xstreamlyRootDomain+securedPath+'/security',
			success:function(data){
				ok(true,'got security tokens');
				startTest(data.sessions[0].key);
			},
			error:function(jqXHR, textStatus, errorThrown) { 
				ok(false,'Problem getting tokens '+textStatus);
				start();
			}
    });
    
    var testName = 'test';//getTestTestName();
	var eventName = "my-event";
	
	var startTest = function(securityToken){
		console.log('got key: '+securityToken);
		var xstreamly = new XStreamly(appKey, securityToken);
		var testChannel = xstreamly.subscribe(testName,{includeMyMessages:true});
				
		testChannel.bind(eventName, function(data) {
	   		if(data.isReady){
	   			ok(true,"got data websocket call - we are now listening");
	   			postData();
	   		}
	   		else if(data.isDone){
	   		   	ok(true,"got data from POST method");
		    	start();
	   		}
		});
		
		testChannel.trigger(eventName,{isReady:true});
	};

	
    
    var postData = function(){
    
		console.log('posting to: '+(xstreamlyRootDomain+securedPath+'/channels/'+encodeURI(testName)+'/events/'+eventName));
		$.ajax({
			beforeSend: function(xhr){
				   xhr.setRequestHeader("Authorization", "Basic " + $.base64Encode(username + ":" + password));
			},
			url:xstreamlyRootDomain+securedPath+'/channels/'+encodeURI(testName)+'/events/'+eventName,
			type: 'POST',
			data: JSON.stringify({isDone:true}),
			success:function(data){
				ok(true,'POSTed message successfuly');
			},
			error:function(jqXHR, textStatus, errorThrown) { 
				ok(false,'Could not post message: '+textStatus);
				start();
			}
		});
	}
});
