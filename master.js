
var slaves = {};
var net = require('net');
var dgram = require('dgram');
var crypto = require('crypto');
var config = require('./masterConfig.js');
var log4js = require('log4js');
var logger = log4js.getLogger();

var slavePasswd = 'huangji';
var md5 = crypto.createHash('md5');
md5.update(slavePasswd);
var slavePasswdMd5 = md5.digest('hex');

var dgramServer = dgram.createSocket('udp4');
dgramServer.bind(8124);

var handlers = {
    slaveAuth : slaveAuth,
    heartBeat : heartBeat,
};

dgramServer.on('message', function(msg,addr) {

    var msg = msg.toString();

    logger.debug('message from :', addr.address, ':', addr.port, ' ', msg); 
    var msgObj;
    try{
        msgObj = JSON.parse(msg);
    }catch(err){
        logger.error(err.message, 'JSON can\'t parse:', msg);
    }
    var result = handlers[msgObj.type](msgObj, addr);
});

dgramServer.on('listening', function(){
    var address = dgramServer.address();        
    logger.debug('server is start! listen at: ', address);
});

setInterval(checkSlavesHeartbeat, 1000*2);

function slaveAuth(msg, addr)
{
    var result;
    if(slavePasswd != msg.slavePasswd || slavePasswdMd5 != msg.slavePasswdMd5) {
        result = [-1, 'password is not right maybe beacuse of network,try again!'];
    }
    else {
        result = [0];
        setSlave(addr.address, addr.port);
    }
    var resultStr = JSON.stringify(result);
    var buff = new Buffer(resultStr);
    dgramServer.send(buff, 0 , buff.length, addr.port, addr.address);
}

function checkSlavesHeartbeat() {
    var slave;
    for(var key in slaves) {
        slave = slaves[key];

        slave.state.beat++;
        logger.debug('beat:', slave.state.beat);

        if (slave.state.beat > config.heartRate.dead) {
            logger.debug('slave:' + key + 'is death!');
            delete slaves[key];
        } else if (slave.state.beat > config.heartRate.sick) {
            logger.debug('slave:' + key + 'is almost death!');
        } else if (slave.state.beat > config.heartRate.heath) {
            logger.debug('slave:' + key + 'is sick!');
        }
    }
}

function heartBeat(msg, addr) {
    updateSlaveState(addr.address, addr.port, msg);
}

var slaves = {};
var clients = {};
function setSlave(ip, port) {
    slaves[ip + ':' + port] = {
        state : {
            beat : 0,
            client : 0,
        },
        msg : {
            ip : ip,
            port : port,
        },
   };
}
function getSlave(ip, port) {
    //according to the cpuRate,memRate,client number of node to return which node to connect    
    var slaveId;
    for(var key in slaves) {
        if (slaves[key].state.beat <= config.heartRate.heath) {
            if(!slaveId) {
                slaveId = key;
            }
            if(slaves[key].state.client > slaves[slaveId].state.client) {
                slaveId = key;
            }
        }
    }

    if (!slaveId) {
        return null;
    }
    slaves[slaveId].state.client++;
    client[ip + ':' + port] = slaveId;
    return slaves[slaveId].msg;
}
function updateSlaveState(ip, port, msg) {
    var id = ip + ':' + port;
    slaves[id].state.cpuRate = msg.cpuRate;
    slaves[id].state.memRate = msg.memRate;
    log(ws, ['slave beat:','cpuRate:',msg.cpuRate, 'memRate:', msg.memRate]);

    if (slaves[id].state.beat > 0) {
        slaves[id].state.beat--;  
    }
}

