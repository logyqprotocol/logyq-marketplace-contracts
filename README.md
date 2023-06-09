# Marketplace Smart Contract Documentation

Here's the technical documentation for each function in the Marketplace smart contract:

### `totalListings()`

This function is a view function that returns the total number of listings created in the marketplace. It retrieves the value of the `listingsCounter` variable, which represents the total number of listings, and returns it.

### `getFirstElement()`

This function is a view function that returns the offers counter of the first listing in the marketplace. It retrieves the `offersCounter` value from the first listing (index 0) in the `listings` mapping and returns it.

### `totalOffers(uint256 _listingId)`

This function is a view function that returns the total number of offers for a specific listing. It takes a parameter `_listingId` representing the ID of the listing and retrieves the `offersCounter` value from the corresponding listing in the `listings` mapping. It then returns the value.

### `createListing(string _title, string _description, uint256 _price)`

This function allows a user to create a new listing in the marketplace. It takes three parameters: `_title` (string) representing the title of the listing, `_description` (string) representing the description of the listing, and `_price` (uint256) representing the price of the listing.

Inside the function, it first checks that the `_price` is greater than zero using a `require` statement. It then creates a new `Listing` struct with the provided parameters and other default values such as `seller`, `sold`, `offersCounter`, and `offers`.

The new listing is stored in the `listings` mapping with the `listingsCounter` as the key. The `listingsCounter` is incremented, and a `listingCreated` event is emitted with the ID of the new listing.

### `makeOffer(uint256 _amount, uint256 _listingId)`

This function allows a user to make an offer on a specific listing. It takes two parameters: `_amount` (uint256) representing the offer amount, and `_listingId` (uint256) representing the ID of the listing.

The function first performs several `require` statements to validate the offer conditions, such as ensuring the offer amount is greater than zero, the listing ID exists, the user is not the seller of the listing, and the listing is not already sold.

If the offer conditions are met, a new `Offer` struct is created with the provided offer amount, the address of the buyer (the caller), and an initial status of `OfferStatus.PENDING`.

The new offer is stored in the `offers` mapping of the corresponding listing using the `offersCounter` as the key. If the offer amount matches the listing price, the offer is automatically accepted by calling the `_acceptOffer` function.

Finally, an `offerReceived` event is emitted with the listing ID and the ID of the new offer, and the `offersCounter` is incremented.

### `_acceptOffer(uint256 _listingId, uint256 _offerId)`

This private function is called internally to accept an offer for a listing. It takes two parameters: `_listingId` (uint256) representing the ID of the listing, and `_offerId` (uint256) representing the ID of the offer.

The function updates the status of the offer to `OfferStatus.ACCEPTED` in the `offers` mapping of the corresponding listing. It also sets the `sold` status of the listing to `true`.

An `offerAccepted` event is emitted with the listing ID and the ID of the accepted offer. The function can also include the logic for transferring funds from the buyer to the seller.

### `acceptOffer(uint256 _listingId, uint256 _offerId)`

This function allows the seller of a listing to accept a specific offer. It takes two parameters: `_listingId` (uint256) representing the ID of the listing, and `_offerId` (uint256) representing the ID of the offer.

The function first performs several `require` statements to validate the offer acceptance conditions, such as ensuring the offer ID exists, the caller is the seller of the listing, and the offer status is `OfferStatus.PENDING`.

If the conditions are met, the function updates the status of the offer to `OfferStatus.ACCEPTED` in the `offers` mapping of the corresponding listing. It also sets the `sold` status of the listing to `true`.

An `offerAccepted` event is emitted with the listing ID and the ID of the accepted offer. The function can also include the logic for transferring funds from the buyer to the seller.

### `declineOffer(uint256 _listingId, uint256 _offerId)`

This function allows the seller of a listing to decline a specific offer. It takes two parameters: `_listingId` (uint256) representing the ID of the listing, and `_offerId` (uint256) representing the ID of the offer.

The function first performs several `require` statements to validate the offer decline conditions, such as ensuring the offer ID exists, the caller is the seller of the listing, and the offer status is `OfferStatus.PENDING`.

If the conditions are met, the function updates the status of the offer to `OfferStatus.DECLINED` in the `offers` mapping of the corresponding listing. It also sets the `sold` status of the listing to `false`.

An `offerDeclined` event is emitted with the listing ID and the ID of the declined offer. The function can also include the logic for refunding the offer sender.

### `getListing(uint256 _listingId)`

This function is a view function that returns the details of a specific listing. It takes one parameter: `_listingId` (uint256) representing the ID of the listing.

The function retrieves the corresponding `Listing` struct from the `listings` mapping using the `_listingId` and returns the individual fields such as `title`, `description`, `price`, `seller`, `sold`, and `offersCounter`.

### `getListingOffer(uint256 _listingId, uint256 _offerId)`

This function is a view function that returns the details of a specific offer for a listing. It takes two parameters: `_listingId` (uint256) representing the ID of the listing, and `_offerId` (uint256) representing the ID of the offer.

The function retrieves the corresponding `Offer` struct from the `offers` mapping of the specified listing using the `_listingId` and `_offerId`, and returns the individual fields such as `amount`, `buyer`, and `status`.
