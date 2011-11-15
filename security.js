module("security");

//test that you can get persisted messages
test("default security token can not send private messages", function() {
    var xstreamly = new XStreamly(testAppKey, testSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.subscribe(testName, { 
        includeMyMessages: true,//need this so we can see the message we send
        private:true
    });

    var count =0;
    testChannel.bind('test', function(data) {
        ok(false,'Should not have resived message');
    });
    
    setTimeout("start()",1500)

    testChannel.trigger('test', "I hope I don't get this");
    stop();
});

//test that you can get persisted messages
test("secure token can access private channels", function() {
    var xstreamly = new XStreamly(testAppKey, privateSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.subscribe(testName, { 
        includeMyMessages: true,//need this so we can see the message we send
        private:true
    });

    var count =0;
    testChannel.bind('test', function(data) {
        ok(true,'got message');
        start();
    });

    testChannel.trigger('test', "I hope I don't get this");
    stop();
});
