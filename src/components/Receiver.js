import React, { Component } from 'react'
import Addressbar from './Addressbar'
import Express from '../abis/Express'
import Web3 from 'web3'
class Receiver extends Component {
  state = {
    account: '',
    orders: [],
    currentCourier: ''
  }

  async componentDidMount() {
    await this.getWeb3Provider()
    await this.connectToBlockchain()
  }

  async getWeb3Provider() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      )
    }
  }
  async connectToBlockchain() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Express.networks[networkId]
    if (networkData) {
      const deployedExpress = new web3.eth.Contract(
        Express.abi,
        networkData.address,
      )
      this.setState({ deployedExpress: deployedExpress })
      const totalNumber = await deployedExpress.methods.totalNumber().call()
      this.setState({ totalNumber })
      console.log('totalNumber', totalNumber)
      for (var i = 1; i <= totalNumber; i++) {
        const order1 = await deployedExpress.methods.orders1(i).call()
        const order2 = await deployedExpress.methods.orders2(i).call()
        const order3 = await deployedExpress.methods.orders3(i).call()
        const orderAll = { ...order1, ...order2, ...order3 }
        this.setState({
          orders: [...this.state.orders, orderAll],
        })
      }
      console.log('myOrders', this.state.orders)
      const currentCourier = await deployedExpress.methods.couriers(accounts[0]).call();
      this.setState({
        currentCourier: currentCourier
      })
      console.log('currentCourier', this.state.currentCourier);

    } else {
      window.alert('Express contract is not found in your blockchain.')
    }
  }
  render() {
    return (
    
      <div>
       <Addressbar account={this.state.account} />
       <div className="container-fluid mt-5">
      
      
      </div>
      </div>
      
      )}
}

export default Receiver
