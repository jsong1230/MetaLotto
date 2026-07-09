// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {MetaLottoFeeRouter} from "../src/MetaLottoFeeRouter.sol";

/// @notice 배포된 MetaLotto의 수령주소 setter (ABI 일부)
interface IMetaLotto {
    function owner() external view returns (address);
    function communityFund() external view returns (address);
    function operationFund() external view returns (address);
    function setCommunityFund(address newFund) external;
    function setOperationFund(address newFund) external;
}

/// @title DeployFeeRouter
/// @notice C4 어댑터(MetaLottoFeeRouter)를 Metadium testnet(12)에 배포하고,
///         (owner라면) MetaLotto의 커뮤니티 몫 수령주소를 라우터로 지정한다.
///
/// @dev 환경변수:
///   FEE_DISTRIBUTOR_ADDRESS — MetaStake FeeDistributor 주소 (필수)
///   METALOTTO_ADDRESS       — 배포된 MetaLotto 주소 (선택, 있으면 wiring 시도)
///   WIRE_TARGET             — "community"(기본) | "operation" — 어느 몫을 라우팅할지
///
/// @dev 실행 (브로드캐스터 = MetaLotto owner여야 setter 성공):
///   FEE_DISTRIBUTOR_ADDRESS=0x2654... METALOTTO_ADDRESS=0x0042... \
///   forge script script/DeployFeeRouter.s.sol --rpc-url metadium_testnet \
///     --broadcast --legacy
contract DeployFeeRouter is Script {
    uint256 constant METADIUM_TESTNET = 12;

    function run() public returns (address router) {
        require(block.chainid == METADIUM_TESTNET, "target must be Metadium testnet (12)");

        address feeDistributor = vm.envAddress("FEE_DISTRIBUTOR_ADDRESS");
        address metaLotto = vm.envOr("METALOTTO_ADDRESS", address(0));
        string memory target = vm.envOr("WIRE_TARGET", string("community"));
        bool wireCommunity = keccak256(bytes(target)) == keccak256(bytes("community"));

        vm.startBroadcast();

        MetaLottoFeeRouter r = new MetaLottoFeeRouter(feeDistributor);
        router = address(r);
        console.log("MetaLottoFeeRouter deployed:", router);
        console.log("FeeDistributor:", feeDistributor);

        if (metaLotto != address(0)) {
            IMetaLotto ml = IMetaLotto(metaLotto);
            if (ml.owner() == msg.sender) {
                if (wireCommunity) {
                    ml.setCommunityFund(router);
                    console.log("setCommunityFund(router). communityFund =", ml.communityFund());
                } else {
                    ml.setOperationFund(router);
                    console.log("setOperationFund(router). operationFund =", ml.operationFund());
                }
            } else {
                console.log("WARN: broadcaster is not MetaLotto owner:", ml.owner());
                console.log("      owner must call setCommunityFund/setOperationFund(", router, ")");
            }
        }

        vm.stopBroadcast();
    }
}
