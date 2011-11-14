module("connection state");

//test that connection state transitions correctly
test("connection state progression", function() {
	var xstreamly = new XStreamly(testAppKey,testSecurityToken);
    //connection state should go from initialized => connecting => connected
    equal(xstreamly.connection.state, "connecting");
    stop();

    var everConnected = false;
    xstreamly.connection.bind('connected', function() {
        ok(true, "connected");
        everConnected = true;
        equal(xstreamly.connection.state, "connected","state is set correctly");
        xstreamly.disconnect();
    });

    xstreamly.connection.bind('disconnected', function() {
        ok(everConnected, "was connected before disconnected");
        start();

        equal(xstreamly.connection.state, "disconnected","state is set correctly");
    });
});






