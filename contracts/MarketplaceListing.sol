// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Marketplace Product Listing
 * @dev lorem ipsum
 */
contract MarketplaceListing {

    enum OfferStatus{ CREATED, DECLINED, ACCEPTED }

    struct Listing {
        string name;
        string description;
        uint256 price;
        address payable seller;
        bool sold;
    }

     struct Offer {
        uint256 listingId;     // Listing ID 
        uint256 value;         // Amount buyer is offering
        address buyer;      // Buyer wallet 
        OfferStatus status; // CREATED, DECLINED, ACCEPTED 
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingsCounter = 0;
    mapping (uint256 => Offer) public offers;
    uint256 public offersCounter = 0;

    function totalListings() public view returns (uint) {
        return listingsCounter;
    }

    function totalOffers() public view returns (uint) {
        return offersCounter;
    }

    function createListing(string calldata _name, string calldata _description, uint256 _price) public {
        require(_price > 0, "Price must be greater than zero");
        Listing memory newListing = Listing(_name, _description, _price, payable(msg.sender), false);
        listings[listingsCounter] = newListing;
        listingsCounter++;
    }

    function createOffer(uint256 _amount, uint256 _listingId) public {
        require(_amount > 0, "Price must be greater than zero");
        require(_listingId < listingsCounter, "This listing doesn't exists.");
        require(msg.sender == listings[_listingId].seller, "You cannot create an Offer for your own listing");
        Offer memory newOffer = Offer(_listingId, _amount, msg.sender, OfferStatus.CREATED);
        offers[offersCounter] = newOffer;
        //if amounts match automatically accepting the offer
        if(listings[_listingId].price == _amount) _acceptOffer(_listingId, offersCounter);
        offersCounter++;
    }

    function _acceptOffer(uint256 _listingId, uint256 _offerId) private {
        offers[_offerId].status = OfferStatus.ACCEPTED;
        listings[_listingId].sold = true;
        //transfer funds
    }

    function acceptOffer(uint256 _listingId, uint256 _offerId) public {
        //add check if offer is still on CREATED status
        require(_offerId < offersCounter, "This offer doesn't exists.");
        require(msg.sender == listings[offers[_offerId].listingId].seller, "The listing that received this offer is not yours.");
        offers[_offerId].status = OfferStatus.ACCEPTED;
        listings[_listingId].sold = true;
        //transfer funds
    }

    function declineOffer(uint256 _offerId) public {
        //add check if offer is still on CREATED status
        require(_offerId < offersCounter, "This offer doesn't exists.");
        require(msg.sender == listings[offers[_offerId].listingId].seller, "The listing that received this offer is not yours.");
        offers[_offerId].status = OfferStatus.DECLINED;
        //refund offer sender
    }
}

