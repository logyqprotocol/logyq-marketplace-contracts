async function deployMarketplace() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { contract: marketplace, tx } = await locklift.factory.deployContract({
    contract: "Marketplace",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
    },
    value: locklift.utils.toNano(0.1),
  });

  console.log(`Marketplace deployed at: ${marketplace.address.toString()}`);
}

deployMarketplace()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
