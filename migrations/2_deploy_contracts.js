const Express = artifacts.require("Express");

module.exports = function(deployer) {
  deployer.deploy(Express);
};
