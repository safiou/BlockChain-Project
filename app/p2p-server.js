const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const Receved_Types = {
    Chain : 'BC',
    transaction : 'trans',
    clear_Transactions: "clear"
};

class P2pServer{
    constructor(blockChain,TransactionPool){
        this.sockets = [];
        this.blokChain = blockChain;
        this.TransactionPool = TransactionPool;
        
    }
    listen(){
        const server = new Websocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers()
        console.log(`Listening for peer-to-peer connection on: ${P2P_PORT}`);
    }
    connectToPeers(){
        peers.forEach(peer => {
          const socket = new Websocket(peer);
          socket.on('open', () => this.connectSocket(socket));
        });
    }
   connectSocket(socket){
        this.sockets.push(socket);
        console.log(`Socket Connected`);
        this.messageHandler(socket);
        this.sendChain(socket);
        //console.log((JSON.stringify(this.blokChain.chain)));
    }
    syncChains(){
        this.sockets.forEach(socket => this.sendChain(socket));
    }
    messageHandler(socket){
        socket.on('message',(message) =>{
            const data = JSON.parse(message);
            switch(data.type){
                case Receved_Types.Chain :
                    this.blokChain.updateChain(data.Chain);
                    break;
                case Receved_Types.transaction:
                    this.TransactionPool.updateOrAddTransaction(data.transaction)
                    break;
                case Receved_Types.clear_Transactions:
                    this.TransactionPool.clear();
                    break
            }
            //console.log('data',data);
        });
    }
    sendTrans(socket,transaction){
        socket.send(JSON.stringify({
            type : Receved_Types.transaction,
            transaction}));
    }
    broadcastTransaction(transaction){
        this.sockets.forEach(socket => this.sendTrans(socket,transaction));
    }
    broadcastClearTransaction(){
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type : Receved_Types.clear_Transactions,
        })));
    }
    sendChain(socket){
        socket.send(JSON.stringify({
            type : Receved_Types.Chain,
            Chain : this.blokChain.chain}));
    }
}
module.exports = P2pServer;