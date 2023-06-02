import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

let marketplace: Contract<FactorySource["Marketplace"]>;
let signer: Signer;

describe("Test Marketplace contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const marketplaceData = await locklift.factory.getContractArtifacts("Marketplace");

      expect(marketplaceData.code).not.to.equal(undefined, "Code should be available");
      expect(marketplaceData.abi).not.to.equal(undefined, "ABI should be available");
      expect(marketplaceData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const { contract } = await locklift.factory.deployContract({
        contract: "Marketplace",
        publicKey: signer.publicKey,
        initParams: {
          _nonce: locklift.utils.getRandomNonce(),
        },
        value: locklift.utils.toNano(2),
        constructorParams: undefined,
      });
      marketplace = contract;

      expect(await locklift.provider.getBalance(marketplace.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Create listing", async function () {
      const title = "Test Listing";
      const description = "This is a test listing";
      const price = 10;

      await marketplace.methods
        .createListing({
          _title: title,
          _description: description,
          _price: price,
        })
        .sendExternal({ publicKey: signer.publicKey });

      const totalListings = await marketplace.methods.totalListings().call();

      expect(Number(totalListings)).to.be.equal(1, "Wrong number of total listings");
    });

    it("Make offer", async function () {
      const amount = 150;
      const listingId = 0;

      await marketplace.methods
        .makeOffer({
          _amount: amount,
          _listingId: listingId,
        })
        .sendExternal({ publicKey: signer.publicKey });

      const totalOffers = await marketplace.methods.totalOffers({ _listingId: listingId }).call();

      expect(Number(totalOffers)).to.be.equal(1, "Wrong number of total offers for the listing");
    });

    it("Accept offer", async function () {
      const listingId = 0;
      const offerId = 0;

      await marketplace.methods
        .acceptOffer({
          _listingId: listingId,
          _offerId: offerId,
        })
        .sendExternal({ publicKey: signer.publicKey });

      const listing = await marketplace.methods.listings().call();
      const offer = await marketplace.methods
        .getListingOffer({
          _listingId: listingId,
          _offerId: offerId,
        })
        .call();

      expect(listing.listings[0][1].sold).to.be.equal(true, "Listing should be marked as sold");
      expect(Number(offer.value0.status)).to.be.equal(2, "Offer status should be ACCEPTED");
    });

    it("Decline offer", async function () {
      const listingId = 0;
      const offerId = 0;

      await marketplace.methods.declineOffer({
        _listingId: listingId,
        _offerId: offerId,
      }).sendExternal({ publicKey: signer.publicKey });

      const listing = await marketplace.methods.listings().call();
      const offer = await marketplace.methods.getListingOffer({
        _listingId: listingId,
        _offerId: offerId,
      }).call();

      expect(listing.listings[0][1].sold).to.be.equal(false, "Listing should not be marked as sold");
      expect(Number(offer.value0.status)).to.be.equal(1, "Offer status should be DECLINED");
    });
  });
});
