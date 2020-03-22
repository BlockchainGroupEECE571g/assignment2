import React, { Component } from 'react'
import './App.css'
import bg from '../images/backgroud.png';
import logo from '../images/logo.png';

class App extends Component {
  render() {
    return (
      <div>
       <div className="container-fluid mt-5">
       <img src ={bg} className = "bg"></img>
       <div  className = "logo"><img src ={logo} className = "logoimg"></img></div>
       <div className = "threeButton">
       <button onClick={this.ParcelSender.bind(this)}>ParcelSender</button>
        <button onClick={this.Courier.bind(this)}>Courier</button>
        <button onClick={this.Receiver.bind(this)}>Receiver</button>
        </div>
        </div>
      </div>
    )
  }
  ParcelSender = () => {
   this.props.history.push({pathname:'/ParcelSender'})
  }  

  Courier = () => {
   this.props.history.push({pathname:'/Courier'})

  }

  Receiver = () => {
   this.props.history.push({pathname:'/Receiver'})
  }

}


export default App
