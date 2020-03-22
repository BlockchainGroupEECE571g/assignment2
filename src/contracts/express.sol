pragma solidity >=0.4.21 <0.7.0;

contract Express {
    string public expressName;
    uint256 public totalNumber = 0;
    uint256 public constant price1 = 3 ether;
    uint256 public constant price2 = 5 ether;
    uint256 public constant price3 = 7 ether;
    uint256 public constant status1 = 101; //Waiting to be taken
    uint256 public constant status2 = 102; //Waiting for delivery
    uint256 public constant status3 = 103; //Delivered waiting confirmation
    uint256 public constant status4 = 104; //Complete
    uint256 public constant status5 = 105; //Cancelled
    uint256 public constant parcelNumPerHour = 2;
    struct Order1 {
        uint256 orderId;
        string senderName;
        uint256 senderPhone;
        string pickupAddr;
        string shippingAddr;
        string receiverName;
        uint256 receiverPhone;
    }

    struct Order2 {
        uint256 orderId;
        uint256 startTime;
        uint256 endTime;
        uint256 orderWeight;
        string orderType;
        uint256 orderPrice;
    }

    struct Order3 {
        uint256 orderId;
        address payable parcelSender;
        address payable courier;
        address receiver;
        uint256 orderStatus;
    }

    struct Courier {
        uint256 courierGrade;
        uint256[] courierOrders;
        uint256 curOrdersNum; //
        uint256 totalGradesNum;
    }

    mapping(uint256 => Order1) public orders1;
    mapping(uint256 => Order2) public orders2;
    mapping(uint256 => Order3) public orders3;
    mapping(address => Courier) public couriers;
    //event
    event orderCreated1(
        uint256 orderId,
        string senderName,
        uint256 senderPhone,
        string pickupAddr,
        string shippingAddr,
        string receiverName,
        uint256 receiverPhone
    );

    event orderCreated2(
        uint256 orderId,
        uint256 startTime,
        uint256 endTime,
        uint256 orderWeight,
        string orderType,
        uint256 orderPrice
    );
    event orderCreated3(
          address payable parcelSender,
          address receiver,
           uint256 orderStatus
        );

    event orderCancelled(
        uint256 orderId,
        address payable parcelSender,
        address receiver,
        uint256 orderStatus
    );


    event orderTaken(
        uint256 orderId,
        address payable courier,
        uint256 orderStatus
    );

    event courierTaken(uint256[] courierOrders, uint256 curOrdersNum);

    event orderDelivered(
        uint256 orderId,
        address courier,
        address receiver,
        uint256 orderStatus,
        uint256 currentTime
    );

    event courierDelivered(uint256[] courierOrders, uint256 curOrdersNum);

    event orderConfirmed(
        uint256 orderId,
        address payable parcelSender,
        address payable courier,
        address receiver,
        uint256 orderStatus
    );

    event orderComplete(
        uint256 orderId,
        address payable parcelSender,
        address payable courier,
        address receiver,
        uint256 orderStatus,
        uint256 grade
    );

    constructor() public {
        expressName = "Ethereum Express.com";
    }

    //make orders
    function createOrder1(
        string memory _senderName,
        uint256 _senderPhone,
        string memory _pickupAddr,
        string memory _shippingAddr,
        string memory _receiverName,
        uint256 _receiverPhone
    ) public {
        require(bytes(_senderName).length > 0, "senderName is required!");
        require(
            _senderPhone > 1000000000 && _senderPhone < 9999999999,
            "Please input correct phone number!"
        );
        require(bytes(_pickupAddr).length > 0, "Pick up address is required!");
        require(
            bytes(_shippingAddr).length > 0,
            "Shipping address is required!"
        );
        require(bytes(_receiverName).length > 0, "receiverName is required!");
        require(
            _receiverPhone > 1000000000 && _receiverPhone < 1999999999,
            "Please input correct phone number!"
        );
        totalNumber = totalNumber + 1;
        orders1[totalNumber].orderId = totalNumber;
        orders1[totalNumber].senderName = _senderName;
        orders1[totalNumber].senderPhone = _senderPhone;
        orders1[totalNumber].pickupAddr = _pickupAddr;
        orders1[totalNumber].shippingAddr = _shippingAddr;
        orders1[totalNumber].receiverName = _receiverName;
        orders1[totalNumber].receiverPhone = _receiverPhone;
        Order1 memory _order1 = orders1[totalNumber];
        emit orderCreated1(
            _order1.orderId,
            _order1.senderName,
            _order1.senderPhone,
            _order1.pickupAddr,
            _order1.shippingAddr,
            _order1.receiverName,
            _order1.receiverPhone
        );
    }

    //make orders
    function createOrder2(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _orderWeight,
        string memory _orderType,
        address _receiver
    ) public payable {
        require(
            _startTime < _endTime,
            "start time should be smaller than end time!"
        );
        require(
            _orderWeight > 0 && _orderWeight <= 50,
            "order weight should be within the range"
        );
        orders2[totalNumber].orderId = totalNumber;
        orders2[totalNumber].startTime = _startTime;
        orders2[totalNumber].endTime = _endTime;
        orders2[totalNumber].orderWeight = _orderWeight;
        orders2[totalNumber].orderType = _orderType;
        if (_orderWeight > 0 && _orderWeight <= 10) {
            orders2[totalNumber].orderPrice = price1;
        } else if (_orderWeight > 10 && _orderWeight <= 30) {
            orders2[totalNumber].orderPrice = price2;
        } else if (_orderWeight > 30 && _orderWeight <= 50) {
            orders2[totalNumber].orderPrice = price3;
        }
        require(
            msg.value >= orders2[totalNumber].orderPrice,
            "Not enough ether to create order"
        );
        Order2 memory _order2 = orders2[totalNumber];
        emit orderCreated2(
            _order2.orderId,
            _order2.startTime,
            _order2.endTime,
            _order2.orderWeight,
            _order2.orderType,
            _order2.orderPrice
        );
        orders3[totalNumber].orderId = totalNumber;
        orders3[totalNumber].parcelSender = msg.sender;
        orders3[totalNumber].receiver = _receiver;
        orders3[totalNumber].orderStatus = status1;
        Order3 memory _order3 = orders3[totalNumber];
        emit orderCreated3(
            _order3.parcelSender,
            _order3.receiver,
            _order3.orderStatus
        );
    }


    //cancel order
    function cancelOrder(uint256 _orderId) public {
        Order2 memory _order2 = orders2[_orderId];
        Order3 memory _order3 = orders3[_orderId];
        require(
            msg.sender == _order3.parcelSender,
            "Only parcelSender can cancel this order"
        );

        require(
            _orderId > 0 && _orderId <= totalNumber,
            "Order should be created!"
        );
        require(
            _order3.orderStatus == status1,
            "Order could not be cancelled!"
        );
        _order3.orderStatus = status5;
        orders3[_orderId] = _order3;
        _order3.parcelSender.transfer(_order2.orderPrice);
        emit orderCancelled(
            _order3.orderId,
            _order3.parcelSender,
            _order3.receiver,
            _order3.orderStatus
        );
    }


    //Courier takes order
    function takeOrder(uint256 _orderId, uint256 _currentTime) public {
        Order2 memory _order2 = orders2[_orderId];
        Order3 memory _order3 = orders3[_orderId];
        require(
            _orderId > 0 && _orderId <= totalNumber,
            "Order should be ready to be taken!"
        );
        require(
            _order3.orderStatus == status1,
            "Order should not be taken yet!"
        );
        require(
            _currentTime < _order2.endTime,
            "CurrentTime exceed order's endTime"
        );

        uint256 limitTime = _order2.endTime - _currentTime;
        require(
            couriers[msg.sender].curOrdersNum < limitTime * parcelNumPerHour,
            "Number of courier's parcels should not exceed"
        );
        _order3.courier = msg.sender;
        _order3.orderStatus = status2;
        orders3[_orderId] = _order3;
        couriers[msg.sender].courierOrders.push(_orderId);
        couriers[msg.sender].curOrdersNum++;
        emit orderTaken(_order3.orderId, _order3.courier, _order3.orderStatus);
        emit courierTaken(
            couriers[msg.sender].courierOrders,
            couriers[msg.sender].curOrdersNum
        );
    }

    function deliverOrder(uint256 _orderId, uint256 _currentTime) public {
        require(
            _orderId <= totalNumber,
            "OrderId is non-existed"
        );
        Order1 memory _order1 = orders1[_orderId];
        Order3 memory _order3 = orders3[_orderId];
        for (
            uint256 i = 0;
            i < couriers[msg.sender].courierOrders.length;
            i++
        ) {
            if (couriers[msg.sender].courierOrders[i] == _orderId) {
                delete couriers[msg.sender].courierOrders[i];
                break;
            }
        }
        _order3.orderStatus = status3;
        orders3[_orderId] = _order3;
        couriers[msg.sender].curOrdersNum--;
        emit orderDelivered(
            _order1.orderId,
            msg.sender,
            _order3.receiver,
            _order3.orderStatus,
            _currentTime
        );
        emit courierDelivered(
            couriers[msg.sender].courierOrders,
            couriers[msg.sender].curOrdersNum
        );
    }

    function confirmOrder(uint256 _orderId) public {
        require(
            _orderId <= totalNumber,
            "OrderId is non-existed"
        );
        Order2 memory _order2 = orders2[_orderId];
        Order3 memory _order3 = orders3[_orderId];
        require(
            _order3.orderStatus == status3,
            "Order should be waiting for a confirmation"
        );
        require(
            _order3.receiver == msg.sender,
            "Only receiver can confirm order"
        );
        _order3.orderStatus = status4;
        orders3[_orderId] = _order3;
        emit orderConfirmed(
            _order3.orderId,
            _order3.parcelSender,
            _order3.courier,
            _order3.receiver,
            _order3.orderStatus
        );
       _order3.courier.transfer(_order2.orderPrice);
    }

    function makeGrade(uint256 _orderId, uint256 _grade) public view {
        Order3 memory _order3 = orders3[_orderId];
        require(
            _order3.receiver == msg.sender,
            "Only receiver can confirm order"
        );
        Courier memory _courier = couriers[_order3.courier];
        _courier.totalGradesNum++;
        //?cannot support float type
        _courier.courierGrade = (_grade + _courier.courierGrade * (_courier.totalGradesNum - 1)) /
            (_courier.totalGradesNum);

    }

}
