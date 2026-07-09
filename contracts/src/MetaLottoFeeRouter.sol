// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice MetaStake FeeDistributor — 수수료 적립 (veMETA 스테이커 분배)
interface IFeeDistributor {
    function depositFee() external payable;
}

/// @title MetaLottoFeeRouter — C4 통합 어댑터
/// @notice MetaLotto의 커뮤니티/운영 몫(각 5%)을 수령해 MetaStake FeeDistributor로
///         포워딩한다 → veMETA 스테이커에게 주간 epoch 단위 분배.
///
///         연결 방식(non-invasive): MetaLotto owner가 setCommunityFund(router) 또는
///         setOperationFund(router)로 이 라우터를 수령주소로 지정하면 된다.
///         MetaLotto 컨트랙트 수정/재배포 불필요 (C1/C3의 v2 재배포와 대비).
///
///         통합 축: C1~C3는 OperatorRegistry(operator staking) 축이었고,
///         C4는 FeeDistributor + veMETA(수수료 분배) 축의 첫 어댑터다.
///
///         Trustless: 자금은 오직 FeeDistributor로만 흐른다 (owner/인출 함수 없음).
contract MetaLottoFeeRouter {
    IFeeDistributor public immutable feeDistributor;
    uint256 public totalForwarded;

    event Received(address indexed from, uint256 amount);
    event Forwarded(address indexed caller, uint256 amount, uint256 totalForwarded);

    error ZeroAddress();
    error NothingToForward();

    constructor(address _feeDistributor) {
        if (_feeDistributor == address(0)) revert ZeroAddress();
        feeDistributor = IFeeDistributor(_feeDistributor);
    }

    /// @notice MetaLotto 분배(.call)로 들어오는 META 수령. 최소 로직으로 유지해
    ///         MetaLotto 분배 tx의 가스 실패를 방지한다 (포워딩은 별도 flush).
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice 누적된 META를 FeeDistributor로 포워딩. permissionless
    ///         (자금은 FeeDistributor로만 가므로 누구나 호출 가능 — keeper/cron 적합).
    function flush() external returns (uint256 amount) {
        amount = address(this).balance;
        if (amount == 0) revert NothingToForward();
        feeDistributor.depositFee{value: amount}();
        totalForwarded += amount;
        emit Forwarded(msg.sender, amount, totalForwarded);
    }

    /// @notice 아직 포워딩되지 않은 대기 잔액
    function pending() external view returns (uint256) {
        return address(this).balance;
    }
}
