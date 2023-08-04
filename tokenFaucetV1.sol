// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenFaucetV1 {
    event DonationHappened(address indexed donator, uint indexed amountDonated);
    // scopes
    //   public, external, internal, private
    //   most gas -> least gas
    receive() external payable {
        emit DonationHappened(msg.sender, msg.value);
    }

    function withdraw(uint amount) external payable {
        (bool wsuccess, ) = payable(msg.sender).call{value: amount}("");
        require(wsuccess, "withdraw failed. Asked for too much?");
    }
}