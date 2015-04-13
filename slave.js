
var hostIp = '127.0.0.1';
var dgram = require('dgram');
var crypto = require('crypto');
var os = require('os');

var slavePasswd = 'huangji';
var md5 = crypto.createHash('md5');
md5.update(slavePasswd);
var slavePasswdMd5 = md5.digest('hex');

var client = dgram.createSocket('udp4');
var message = {
    "type":"slaveAuth",
    "slavePasswd":slavePasswd,
    "slavePasswdMd5":slavePasswdMd5,
};

client.on('message', function(msg,addr){
    console.log('msg from server: ' + msg);
});

var msg = JSON.stringify(message);
var msgBuf = new Buffer(msg);
client.send(msgBuf, 0, msgBuf.length, 8124, hostIp, function(){
    console.log("send msg\n");
});
setInterval(heartBeat, 1000);

function heartBeat(){

    var userCpu = 0;
    var sysCpu = 0;
    var idleCpu = 0;
    var irqCpu = 0;
    
    var cpus = os.cpus();
    var idata;
    for (var i in cpus) {
        idata = cpus[i];
        userCpu += idata.times.user;
        sysCpu += idata.times.sys;
        idleCpu += idata.times.idle;
        irqCpu += idata.times.irq;
    }
    var cpuRate = idleCpu/(userCpu + sysCpu + idleCpu + irqCpu);

    var totalmem = os.totalmem();
    var freemem = os.freemem();
    var memRate = freemem/totalmem;

    var msg = {
        type : 'heartBeat',
        cpuRate : cpuRate,
        memRate : memRate,
    };

    var msgBuf = new Buffer(JSON.stringify(msg));
    client.send(msgBuf, 0, msgBuf.length, 8124, hostIp, function(){
        //console.log("send msg\n");
    });
   
}
