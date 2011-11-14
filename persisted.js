module("persisted messaging");

//test that you can get persisted messages
test("simple", function() {
    var xstreamly = new XStreamly(testAppKey, testSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.subscribe(testName, { 
        includeMyMessages: true,//need this so we can see the message we send
        includePersistedMessages:true//be setting this to true we will aslo get all the persisted messages
    });
    stop();
    var randNumbers = [];
    randNumbers.push(Math.random());
    randNumbers.push(Math.random());
    randNumbers.push(Math.random());
    
    var count =0;
    testChannel.bind('test', function(data) {
        ok($.inArray(data,randNumbers)>-1, data+ " is in array");
        count++;
        if(count===3){
            start();
        }
    });
    
    //trigger is (eventName,data,[persisted])
    //by setting persisted to true the messages
    //will be saved on the server so that new
    //clients to the channel can see them
    testChannel.trigger('test', randNumbers[0],true);
    testChannel.trigger('test', randNumbers[1],true);
    testChannel.trigger('test', randNumbers[2],true);
});

//test that persisted messages are also recived by
//regular clients but they only get the messages that
//happen in real time and not any saved persisted messages
test("also recieved in real time", function() {
    var xstreamly = new XStreamly(testAppKey, testSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.subscribe(testName, { 
        includeMyMessages: true//need this so we can see the message we send
    });
    stop();
    
    var count =0;
    testChannel.bind('test', function(data) {
        if(data===1){
            ok(true,"got real time data");
            testChannel.trigger('test', 2,true);
        }
        else if(data===2){
            ok(true,"got persisted data sent in real time");
            start();
        }
        else{
            ok(false,"got unexpected data: "+data);
        }
    });
    
    testChannel.trigger('test', 1);
});

//test that messages can be deleted
test("deleting", function() {
    var xstreamly = new XStreamly(testAppKey, testSecurityToken);
    var testName = getTestTestName();
    var testChannel = xstreamly.subscribe(testName, { 
        includeMyMessages: true//need this so we can see the message we send
    });
    stop();
    
    var count =0;
    testChannel.bind('test', function(data,key) {
        ok(true,"got real time data");
        testChannel.removePersistedMessage(key);
        //didn't throw an exception
        start();
    });
    
    testChannel.trigger('test', 1,true);
});




