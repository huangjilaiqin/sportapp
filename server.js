
var io = require('socket.io')(20000);

var protocols = {
    'register':register,
    'login':login,
    'logout':logout,
    'findfriendbyid':findFriendById,
    'addfriend':addFriend,
    'chat':chat,
    'issueStatus':issueStatus,
};

//connect to redis
var redis = require("redis"),
    redisClient = redis.createClient();

client.on("error", function(err){
    console.log("Error: " + err);
});


io.on('connection', function(socket){
    for(var protocolName in protocols)
    {
        var protocolFun = protocols[protocolName];
        socket.on(protocolName, function(data){
            protocolFun(socket, data);
        });
    }
});

function register(socket, data)
{
    var user = JSON.parse(data);
    if(user.username == nil || user.password == nil)
    {
        socket.emit('error', 'username or password can\'t be null!');
        redisClient.exists(user.username,function(error, data){
            if(data != nil)
            {
                socket.emit('error', 'the username is already used!');
            }
            else
            {
                var userid = user.username;
                user.username = nil;
                redisClient.set(user.username, JSON.stringify(user));    
                socket.emit('sys', 'register success');
            }
        });
    }
}

function login(socket, data)
{
    var checkUser = JSON.parse(data);
    if(checkUser.username == nil || checkUser.password == nil)
    {
        socket.emit('error', 'username or password can\'t be null!');
    }
    redisClient.get(checkUser.username,function(error, data){
        if(data == nil)
        {
            socket.emit('error', 'username is not exist');
            return;
        }
        var user = JSON.parse(data);
        if(checkUser.password != user.password)
        {
            socket.emit('error', 'password is wrong');
            return;
        }
        socket.emit('sys', 'login success!');
    });
}

function logout(socket, data)
{

}

function chat(socket, data)
{

}

function findFriendById(socket, data)
{

}

function addFriend(socket, data)
{

}

function issueStatus(socket, data)
{

}
