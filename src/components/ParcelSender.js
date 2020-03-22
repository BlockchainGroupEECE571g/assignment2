import React, { Component } from 'react'
import Addressbar from './Addressbar'
import Express from '../abis/Express'
import Web3 from 'web3'

class ParcelSender extends Component {
  state = {
    account: '',
    totalNumber: 0,
    startTime: '',
    endTime: '',
    orderWeight: '',
    orderType: '',
    orderPrice: 0,
    orders: [],
    statusMap: {
      101: 'Waiting to be taken',
      102: 'Waiting for delivery',
      103: 'Delivered, waiting a confirmation',
      104: 'Completed',
      105: 'Cancelled',
    },
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
    } else {
      window.alert('Express contract is not found in your blockchain.')
    }
  }

  createOrder1 = async (
    _senderName,
    _senderPhone,
    _pickupAddr,
    _shippingAddr,
    _receiverName,
    _receiverPhone,
  ) => {
    this.setState({ loading: true })
    const gasAmount = await this.state.deployedExpress.methods
      .createOrder1(
        _senderName,
        _senderPhone,
        _pickupAddr,
        _shippingAddr,
        _receiverName,
        _receiverPhone,
      )
      .estimateGas({ from: this.state.account })
    this.state.deployedExpress.methods
      .createOrder1(
        _senderName,
        _senderPhone,
        _pickupAddr,
        _shippingAddr,
        _receiverName,
        _receiverPhone,
      )
      .send({ from: this.state.account, gas: gasAmount })
      .once('receipt', receipt => {
        this.setState({ loading: false })
      })
  }

  createOrder2 = async (
    _startTime,
    _endTime,
    _orderWeight,
    _orderType,
    _receiver,
    _orderPrice,
  ) => {
    this.setState({ loading: true })
    const gasAmount = await this.state.deployedExpress.methods
      .createOrder2(_startTime, _endTime, _orderWeight, _orderType, _receiver)
      .estimateGas({ from: this.state.account, value: _orderPrice })
    this.state.deployedExpress.methods
      .createOrder2(_startTime, _endTime, _orderWeight, _orderType, _receiver)
      .send({ from: this.state.account, value: _orderPrice, gas: gasAmount })
      .once('receipt', receipt => {
        this.setState({ loading: false })
      })
  }
  cancelOrder = async _orderId => {
    this.setState({ loading: true })
    const gasAmount = await this.state.deployedExpress.methods
      .cancelOrder(_orderId)
      .estimateGas({ from: this.state.account })
    this.state.deployedExpress.methods
      .cancelOrder(_orderId)
      .send({ from: this.state.account, gas: gasAmount })
      .once('receipt', receipt => {
        this.setState({ loading: false })
      })
  }

  render() {
    return (
      <div>
        <Addressbar account={this.state.account} />{' '}
        <div className="container-fluid mt-5">
          <div id="createOrder">
            <h2> You Can Create Your Order Now! </h2>{' '}
            <form
              onSubmit={async event => {
                event.preventDefault()
                const senderName = this.senderName.value
                const senderPhone = this.senderPhone.value
                const pickupAddr = this.pickupAddr.value
                const shippingAddr = this.shippingAddr.value
                const receiverName = this.receiverName.value
                const receiverPhone = this.receiverPhone.value
                const startTime = this.state.startTime
                const endTime = this.state.endTime
                const orderWeight = this.state.orderWeight
                const orderType = this.state.orderType
                const orderPrice = window.web3.utils.toWei(
                  this.state.orderPrice.toString(),
                  'Ether',
                )
                const receiverAddr = this.receiverAddr.value
                // const senderName = "2";
                // const senderPhone = "1234554321";
                // const pickupAddr = "pickupAddr";
                // const shippingAddr = "shippingAddr";
                // const receiverName = "receiverName";
                // const receiverPhone = "1234554321";
                // const startTime = "1"
                // const endTime =  "4"
                // const orderWeight =  "3"
                // const orderType = "food"
                // console.log(this.state.gasFee);
                //const orderPrice = window.web3.utils.toWei("8", 'Ether');
                // const receiverAddr = "0x069C94e14a46DCE136f9FE8C366d4753136Da217"

                await this.createOrder2(
                  startTime,
                  endTime,
                  orderWeight,
                  orderType,
                  receiverAddr,
                  orderPrice,
                )
                await this.createOrder1(
                  senderName,
                  senderPhone,
                  pickupAddr,
                  shippingAddr,
                  receiverName,
                  receiverPhone,
                )
              }}
            >
              <div className="form-group mr-sm-2">
                <input
                  id="senderName"
                  type="text"
                  ref={input => {
                    this.senderName = input
                  }}
                  className="form-control"
                  placeholder="Sender Name"
                  required
                />
              </div>
              <div className="form-group mr-sm-2">
                <input
                  id="senderPhone"
                  type="Number"
                  ref={input => {
                    this.senderPhone = input
                  }}
                  className="form-control"
                  placeholder="Sender Phone"
                  required
                />
              </div>{' '}
              <div className="form-group mr-sm-2">
                <input
                  id="pickupAddr"
                  type="text"
                  ref={input => {
                    this.pickupAddr = input
                  }}
                  className="form-control"
                  placeholder="Pick Up Address"
                  required
                />
              </div>{' '}
              <div className="form-group mr-sm-2">
                <input
                  id="shippingAddr"
                  type="text"
                  ref={input => {
                    this.shippingAddr = input
                  }}
                  className="form-control"
                  placeholder="Shipping Address"
                  required
                />
              </div>{' '}
              <div className="form-group mr-sm-2">
                <input
                  id="receiverName"
                  type="text"
                  ref={input => {
                    this.receiverName = input
                  }}
                  className="form-control"
                  placeholder="Receiver Name"
                  required
                />
              </div>
              <div className="form-group mr-sm-2">
                <input
                  id="receiverPhone"
                  type="Number"
                  ref={input => {
                    this.receiverPhone = input
                  }}
                  className="form-control"
                  placeholder="Receiver Phone"
                  required
                />
              </div>{' '}
              <div className="form-group mr-sm-2">
                <select
                  onChange={e => {
                    this.setState({
                      startTime: e.target.value,
                    })
                  }}
                >
                  <option value="-1"> Please select your pick up time </option>{' '}
                  <option value="0"> 12:00 Midnight</option>{' '}
                  <option value="1"> 01:00 am </option>{' '}
                  <option value="2"> 02:00 am </option>{' '}
                  <option value="3"> 03:00 am </option>{' '}
                  <option value="4"> 04:00 am </option>{' '}
                  <option value="5"> 05:00 am </option>{' '}
                  <option value="6"> 06:00 am </option>{' '}
                  <option value="7"> 07:00 am </option>{' '}
                  <option value="8"> 08:00 am </option>{' '}
                  <option value="9"> 09:00 am </option>{' '}
                  <option value="10"> 10:00 am </option>{' '}
                  <option value="11"> 11:00 am </option>{' '}
                  <option value="12"> 12:00 Noon </option>{' '}
                  <option value="13"> 01:00 pm </option>{' '}
                  <option value="14"> 02:00 pm </option>{' '}
                  <option value="15"> 03:00 pm </option>{' '}
                  <option value="16"> 04:00 pm </option>{' '}
                  <option value="17"> 06:00 pm </option>{' '}
                  <option value="18"> 06:00 pm </option>{' '}
                  <option value="19"> 07:00 pm </option>{' '}
                  <option value="20"> 08:00 pm </option>{' '}
                  <option value="21"> 09:00 pm </option>{' '}
                  <option value="22"> 10:00 pm </option>{' '}
                  <option value="23"> 11:00 pm </option>{' '}
                </select>
                <select
                  onChange={e => {
                    this.setState({
                      endTime: e.target.value,
                    })
                  }}
                >
                  <option value="-1">Please select your expected receive time</option>{' '}
                  <option value="0"> 12:00 Midnight</option>{' '}
                  <option value="1"> 01:00 am </option>{' '}
                  <option value="2"> 02:00 am </option>{' '}
                  <option value="3"> 03:00 am </option>{' '}
                  <option value="4"> 04:00 am </option>{' '}
                  <option value="5"> 05:00 am </option>{' '}
                  <option value="6"> 06:00 am </option>{' '}
                  <option value="7"> 07:00 am </option>{' '}
                  <option value="8"> 08:00 am </option>{' '}
                  <option value="9"> 09:00 am </option>{' '}
                  <option value="10"> 10:00 am </option>{' '}
                  <option value="11"> 11:00 am </option>{' '}
                  <option value="12"> 12:00 Noon </option>{' '}
                  <option value="13"> 01:00 pm </option>{' '}
                  <option value="14"> 02:00 pm </option>{' '}
                  <option value="15"> 03:00 pm </option>{' '}
                  <option value="16"> 04:00 pm </option>{' '}
                  <option value="17"> 06:00 pm </option>{' '}
                  <option value="18"> 06:00 pm </option>{' '}
                  <option value="19"> 07:00 pm </option>{' '}
                  <option value="20"> 08:00 pm </option>{' '}
                  <option value="21"> 09:00 pm </option>{' '}
                  <option value="22"> 10:00 pm </option>{' '}
                  <option value="23"> 11:00 pm </option>{' '}
                </select>{' '}
              </div>
              <div className="form-group mr-sm-2">
                <select
                  onChange={e => {
                    this.setState({
                      orderWeight: e.target.value,
                    })
                    if (e.target.value == 1)
                      this.setState({
                        orderPrice: 3,
                      })

                    if (e.target.value == 11)
                      this.setState({
                        orderPrice: 5,
                      })
                    if (e.target.value == 21)
                      this.setState({
                        orderPrice: 7,
                      })
                  }}
                >
                  <option value="0">
                    {' '}
                    Please select your package 's weight
                  </option>{' '}
                  <option value="1"> 0 - 10 kg </option>{' '}
                  <option value="11"> 10 - 20 kg </option>{' '}
                  <option value="21"> 20 - 30 kg </option>{' '}
                </select>
                <select
                  onChange={e => {
                    this.setState({
                      orderType: e.target.value,
                    })
                  }}
                >
                  <option value="0"> Please select your package 's type</option>{' '}
                  <option value="Commodity"> Commodity </option>{' '}
                  <option value="Food"> Food </option>{' '}
                  <option value="Document"> Document </option>{' '}
                  <option value="Digital Products"> Digital Products </option>{' '}
                  <option value="Clothing"> Clothing </option>{' '}
                  <option value="Others"> Others </option>{' '}
                </select>{' '}
              </div>{' '}
              <div className="form-group mr-sm-2">
                <input
                  id="receiverAddr"
                  type="text"
                  ref={input => {
                    this.receiverAddr = input
                  }}
                  className="form-control"
                  placeholder="Receiver Hash Address"
                  required
                />
              </div>{' '}
              <h4>
                {' '}
                You Order Price: {this.state.orderPrice}
                ether{' '}
              </h4>{' '}
              <button type="submit" className="btn btn-primary">
                Create Order{' '}
              </button>{' '}
            </form>{' '}
            <h2> Your Order Records </h2>{' '}
            <table className="table">
              <thead id="orderList">
                <tr>
                  <th scope="col"> #OrderId </th>{' '}
                  <th scope="col"> Order Price </th>{' '}
                  <th scope="col"> Order Courier </th>{' '}
                  <th scope="col"> Order Status </th>{' '}
                </tr>{' '}
              </thead>{' '}
              <tbody id="orderList">
                {' '}
                {this.state.orders.map((order, key) => {
                  return (
                    <tr key={key}>
                      <th scope="row"> {order.orderId.toString()} </th>{' '}
                      <td>
                        {' '}
                        {window.web3.utils.fromWei(
                          order.orderPrice.toString(),
                          'Ether',
                        )}
                        ETH{' '}
                      </td>{' '}
                      <td> {order.courier} </td>{' '}
                      <td> {this.state.statusMap[order.orderStatus]} </td>{' '}
                      <td>
                        {' '}
                        {order.orderStatus == '101' ? (
                          <button
                            name={order.orderId}
                            onClick={async event => {
                              await this.cancelOrder(event.target.name)
                            }}
                          >
                            Cancel Order{' '}
                          </button>
                        ) : null}{' '}
                      </td>{' '}
                    </tr>
                  )
                })}{' '}
              </tbody>{' '}
            </table>{' '}
          </div>{' '}
        </div>{' '}
      </div>
    )
  }
}

export default ParcelSender
