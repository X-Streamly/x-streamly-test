module("simple messaging");

//test a messages going to the server
test("simple message", function() {
    //create the xtreamly object with your application key
    var xstreamly = new XStreamly(testAppKey,testSecurityToken);
    var testName = getTestTestName();//  this just retuns a random name so that test don't intefear with each other
    
    //subscribe to the channel
    var testChannel = xstreamly.subscribe(testName, { 
        includeMyMessages: true//need this so we can see the message we send
    });
    stop();
    var randNumber = Math.random();
    
    //register a call abck for when we recieve data
    testChannel.bind('test', function(data) {
        equal(data, randNumber, "number recieved is correct");
        start();
    });

    //send some data
    testChannel.trigger('test', randNumber);
});

//test a messages going to the server
test("do not recieve your own messages by defult", function() {
    var xstreamly = new XStreamly(testAppKey,testSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.subscribe(testName, { 
        //includeMyMessages: false// false is the default value so we don't need to set it
    });
    stop();
    testChannel.bind('test', function(data) {
        console.log('fuuuuuuuuuuuuuuu');
        ok(false,"shouldn't have recived any data");
        start();
    });

    testChannel.trigger('test', 6);
    setTimeout("start()",2000);
    
});

test("list channels", function() {
    var xstreamly = new XStreamly(testAppKey,testSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.listChannels(function(channel){
    	ok(channel);
    	start();
    	testChannel.cancel();
    });
    stop();
});




