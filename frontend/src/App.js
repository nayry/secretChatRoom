import { Component } from 'react';
import socketIOClient from "socket.io-client";

import './App.css';

const ENDPOINT = "http://127.0.0.1:5000";
const socket = socketIOClient(ENDPOINT);


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {joined: false, clientID: 0, room: {}, code: "", text: ""};

    // This binding is necessary to make `this` work in the callback
    this.createNewRoom = this.createNewRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.sendText = this.sendText.bind(this);
    socket.on("joined", data => {
      let room = JSON.parse(data);
      let clientID = room.clients[room.clients.length-1];
      this.setState({joined: true, clientID: clientID, room: room});
    });
    // socket.on("othersJoined", data => {
    //   let room = JSON.parse(data);
    //   this.setState({room: room});
    // });
    socket.on("newMessage", data => {
      let room = JSON.parse(data);
      this.setState({room: room});
    });
    socket.on("start", data => {
      if (data) {
        let room = JSON.parse(data);
        let clientID = room.clients[0];
        this.setState({joined: true, clientID: clientID, room: room});
      }
    });
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({code: event.target.value});
  }


  handleText(event) {
    event.preventDefault();
    console.log("sffs");
    this.setState({text: event.target.value});
  }

  sendText() {
    socket.emit("newText", this.state.room.roomName, this.state.text);
    this.setState({text: ""});
  }
  
  createNewRoom(){
    console.log("success!");
    socket.emit("newChat");
    // socket.on("start", data => {
    //   if (data) {
    //     let room = JSON.parse(data);
    //     let clientID = room.clients[0];
    //     this.setState({joined: true, clientID: clientID, room: room});
    //   }
    // });
  }

  joinRoom(){
    console.log(this.state.code);
    socket.emit("joinChat", this.state.code);
    // socket.on("joined", data => {
    //   let room = JSON.parse(data);
    //   let clientID = room.clients[room.clients.length-1];
    //   this.setState({joined: true, clientID: clientID, room: room});
    // });
  }

  componentDidMount() {
    // socket.on("joined", data => {
    //   let room = JSON.parse(data);
    //   let clientID = room.clients[room.clients.length-1];
    //   this.setState({joined: true, clientID: clientID, room: room});
    // });
  }
  

  render() {
    console.log(this.state);

    return (
      !this.state.joined ? 
      <div className='chatbox'>
        <div className="chat-form">

          <button onClick={this.createNewRoom}>Create a New Chat Room!</button>
        </div>
        <div className="chat-form">
          <textarea value={this.state.code} onChange={(e) => this.handleChange(e)} />
          <button onClick={this.joinRoom}>Enter Code</button>
        </div>

      </div> :
      <div className="chatbox">
      <div className="chatlogs">
      <p>{this.state.room && `Room Code: ${this.state.room.roomName}`}</p>
      {this.state.room && this.state.room.history.map(message => {
        return (
          this.state.clientID !== message.id ?
          <div><div className="chat friend">
            <div className="user-photo">
            <p className="user-number">No.{this.state.room.clients.indexOf(message.id)+1}</p>
            </div>
            <p className="chat-message">{message.message}</p>
          </div></div>
          :
          <div><div className="chat self">
              <div className="user-photo">
              <p className="user-number">No.{this.state.room.clients.indexOf(message.id)+1}</p>
                </div>
              <p className="chat-message">{message.message}</p>
            </div></div>)
      })}
      </div>
        <div className="chat-form">
          <textarea value={this.state.text} onChange={(e) => this.handleText(e)}></textarea>
          <button onClick={this.sendText}>Send</button>
        </div>
      </div>
    )
  }
}

export default App;
