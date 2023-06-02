import { expect } from "chai";
import { Address, Contract, Signer, WalletTypes, toNano } from "locklift";
import { FactorySource } from "../build/factorySource";
import { Account } from "everscale-standalone-client";

let marketplace: Contract<FactorySource["Marketplace"]>;
let deployer: Signer;
let signer1: Signer;
let signer2: Signer;

let account: { listerAccount: any; offerMakerAccount: any; };

describe("Test Marketplace contract", async function () {
  before(async () => {
    deployer = (await locklift.keystore.getSigner("0"))!;
    signer1 = (await locklift.keystore.getSigner("1"))!;
    signer2 = (await locklift.keystore.getSigner("2"))!;

    const { account: listerAccount } = await locklift.factory.accounts.addNewAccount({
      type: WalletTypes.WalletV3,
      value: toNano(10000),
      publicKey: signer1.publicKey,
    });

    const { account: offerMakerAccount } = await locklift.factory.accounts.addNewAccount({
      type: WalletTypes.WalletV3,
      value: toNano(10000),
      publicKey: signer2.publicKey,
    });

    account = { listerAccount : listerAccount, offerMakerAccount: offerMakerAccount };
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
        publicKey: deployer.publicKey,
        initParams: {
          _nonce: locklift.utils.getRandomNonce(),
        },
        value: locklift.utils.toNano(2),
        constructorParams: undefined,
      });
      marketplace = contract;
      console.log(`Marketplace deployed at: ${marketplace.address.toString()}`);

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
        .send({
          from: account.listerAccount.address,
          amount: String(Number(toNano(1))),
        });

      const totalListings = await marketplace.methods.totalListings({}).call();

      const listing = await marketplace.methods.getListing({ _listingId: 0 });

      //TODO: check listings content
      expect(Number(totalListings._listingCounter)).to.be.equal(1, "Wrong number of total listings");
    });

    it("Make offer", async function () {
      const amount = 150;
      const listingId = 0;

      await marketplace.methods
        .makeOffer({
          _amount: amount,
          _listingId: listingId,
        })
        .send({
          from: account.offerMakerAccount.address,
          amount: String(Number(toNano(1))),
        });

      const totalOffers = await marketplace.methods.totalOffers({ _listingId: listingId }).call();

      expect(Number(totalOffers._offersCounter)).to.be.equal(1, "Wrong number of total offers for the listing");
    });

    it("Accept offer", async function () {
      const listingId = 0;
      const offerId = 0;

      await marketplace.methods
        .acceptOffer({
          _listingId: listingId,
          _offerId: offerId,
        })
        .send({
          from: account.listerAccount.address,
          amount: String(Number(toNano(1))),
        });

      const listing = await marketplace.methods.getListing({ _listingId: listingId }).call();
      const offer = await marketplace.methods
        .getListingOffer({
          _listingId: listingId,
          _offerId: offerId,
        })
        .call();

      expect(listing.sold).to.be.equal(true, "Listing should be marked as sold");
      expect(Number(offer.status)).to.be.equal(2, "Offer status should be ACCEPTED");
    });

    it("Decline offer", async function () {
      const listingId = 0;
      const offerId = 0;

      await marketplace.methods
        .declineOffer({
          _listingId: listingId,
          _offerId: offerId,
        })
        .sendExternal({ publicKey: signer2.publicKey });

      const listing = await marketplace.methods.getListing({ _listingId: listingId }).call();
      const offer = await marketplace.methods
        .getListingOffer({
          _listingId: listingId,
          _offerId: offerId,
        })
        .call();

      expect(listing.sold).to.be.equal(false, "Listing should not be marked as sold");
      expect(Number(offer.status)).to.be.equal(1, "Offer status should be DECLINED");
    });
  });
});
