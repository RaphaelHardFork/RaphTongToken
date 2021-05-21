// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract RaphTongToken {
    mapping(address => uint256) private _balances;
    string private _name;
    string private _symbol;
    uint256 private _totalSupply;
    mapping(address => mapping(address => uint256)) private _allowances;
    address private _owner;

    event Transfered(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event Approved(
        address indexed fundsOwner,
        address indexed fundsManager,
        uint256 amount
    );
    event Minted(uint256 amount);

    constructor(address owner_, uint256 totalSupply_) {
        _name = "RaphTongToken";
        _symbol = "RTT";
        _owner = owner_;
        _totalSupply = totalSupply_;
        _balances[owner_] = totalSupply_;
        emit Transfered(address(0), owner_, totalSupply_);
    }

    modifier OnlyOwner() {
        require(
            msg.sender == _owner,
            "RaphTongToken: you are not allowed to use this function."
        );
        _;
    }

    function transfer(address recipient, uint256 amount) public {
        require(
            _balances[msg.sender] >= amount,
            "RaphTongToken: Insuffisiant balance to tranfer funds."
        );
        require(recipient != address(0), "RaphTongToken: Cannot burn token");
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        emit Transfered(msg.sender, recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public {
        require(
            _allowances[sender][msg.sender] > 0,
            "RaphTongToken: you are not allowed to move funds of this address."
        );
        require(
            _balances[sender] >= amount,
            "RaphTongToken: Insuffisiant balance to tranfer funds."
        );
        require(recipient != address(0), "RaphTongToken: Cannot burn token");
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfered(sender, recipient, amount);
    }

    function approve(address account, uint256 amount) public {
        _allowances[msg.sender][account] = amount;
        emit Approved(msg.sender, account, amount);
    }

    function mint(uint256 amount) public OnlyOwner {
        _totalSupply += amount;
        emit Minted(amount);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function allowance(address account) public view returns (uint256) {
        return _allowances[account][msg.sender];
    }
}
