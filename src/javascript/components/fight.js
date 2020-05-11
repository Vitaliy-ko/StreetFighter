import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
  const { health: firstFighterHealth } = firstFighter;
  const { health: secondFighterHealth } = secondFighter;
  const firstFighterHPConst = Number(firstFighterHealth);
  const secondFighterHPConst = Number(secondFighterHealth);
  const defenceModeTime = 500;
  const criticalHitCombinationTime = 10000;
  const firstFighterHealthIndicator = document.getElementById('left-fighter-indicator');
  const secondFighterHealthIndicator = document.getElementById('right-fighter-indicator');
  let firstFighterHP = firstFighterHPConst;
  let secondFighterHP = secondFighterHPConst;
  let isFirstFighterInDefenceMode = false;
  let isSecondFighterInDefenceMode = false;
  let firstFighterDefenceModeTimeout = null;
  let secondFighterDefenceModeTimeout = null;
  let isFirstFighterCriticalHitCombinationDisabled = false;
  let isSecondFighterCriticalHitCombinationDisabled = false;
  let keyIndexPlOneCriticalHitCombination = 0;
  let keyIndexPlTwoCriticalHitCombination = 0;

  const {
    PlayerOneAttack,
    PlayerTwoAttack,
    PlayerOneBlock,
    PlayerTwoBlock,
    PlayerOneCriticalHitCombination,
    PlayerTwoCriticalHitCombination,
  } = controls;

  document.addEventListener('keydown', fightAction, false);

  return new Promise((resolve) => {
    document.addEventListener('get-winner', getWinner);

    function getWinner(event) {
      document.removeEventListener('get-winner', getWinner);
      document.removeEventListener('keydown', fightAction);
      resolve(event.detail.winner);
    }
  });

  function fightAction(event) {
    const { code } = event;

    switch (code) {
      case PlayerOneAttack: {
        const resultDamage = getResultDamage(
          firstFighter,
          secondFighter,
          isFirstFighterInDefenceMode,
          isSecondFighterInDefenceMode,
          firstFighterDefenceModeTimeout
        );
        secondFighterHP = secondFighterHP - resultDamage;
        secondFighterHealthIndicator.style.width = (secondFighterHP / secondFighterHPConst) * 100 + '%';
        checkForWinner(firstFighter, secondFighterHP);
        keyIndexPlOneCriticalHitCombination = 0;
        break;
      }
      case PlayerTwoAttack: {
        const resultDamage = getResultDamage(
          secondFighter,
          firstFighter,
          isSecondFighterInDefenceMode,
          isFirstFighterInDefenceMode,
          secondFighterDefenceModeTimeout
        );
        firstFighterHP = firstFighterHP - resultDamage;
        firstFighterHealthIndicator.style.width = (firstFighterHP / firstFighterHPConst) * 100 + '%';
        checkForWinner(secondFighter, firstFighterHP);
        keyIndexPlTwoCriticalHitCombination = 0;
        break;
      }

      case PlayerOneBlock:
        isFirstFighterInDefenceMode = true;
        clearTimeout(firstFighterDefenceModeTimeout);
        firstFighterDefenceModeTimeout = setTimeout(() => {
          isFirstFighterInDefenceMode = false;
        }, defenceModeTime);
        keyIndexPlOneCriticalHitCombination = 0;
        break;

      case PlayerTwoBlock:
        isSecondFighterInDefenceMode = true;
        clearTimeout(secondFighterDefenceModeTimeout);
        secondFighterDefenceModeTimeout = setTimeout(() => {
          isSecondFighterInDefenceMode = false;
        }, defenceModeTime);
        keyIndexPlTwoCriticalHitCombination = 0;
        break;

      case PlayerOneCriticalHitCombination[keyIndexPlOneCriticalHitCombination]:
        keyIndexPlOneCriticalHitCombination++;
        if (keyIndexPlOneCriticalHitCombination === 3 && !isFirstFighterCriticalHitCombinationDisabled) {
          secondFighterHP = secondFighterHP - getResultCombinationDamage(firstFighter);
          secondFighterHealthIndicator.style.width = (secondFighterHP / secondFighterHPConst) * 100 + '%';
          keyIndexPlOneCriticalHitCombination = 0;
          checkForWinner(firstFighter, secondFighterHP);
          isFirstFighterCriticalHitCombinationDisabled = true;
          setTimeout(() => (isFirstFighterCriticalHitCombinationDisabled = false), criticalHitCombinationTime);
        }
        break;
      case PlayerTwoCriticalHitCombination[keyIndexPlTwoCriticalHitCombination]:
        keyIndexPlTwoCriticalHitCombination++;
        if (keyIndexPlTwoCriticalHitCombination === 3 && !isSecondFighterCriticalHitCombinationDisabled) {
          firstFighterHP = firstFighterHP - getResultCombinationDamage(secondFighter);
          firstFighterHealthIndicator.style.width = (firstFighterHP / firstFighterHPConst) * 100 + '%';
          keyIndexPlTwoCriticalHitCombination = 0;
          checkForWinner(secondFighter, firstFighterHP);
          isSecondFighterCriticalHitCombinationDisabled = true;
          setTimeout(() => (isSecondFighterCriticalHitCombinationDisabled = false), criticalHitCombinationTime);
        }
        break;
      default:
        keyIndexPlOneCriticalHitCombination = 0;
        keyIndexPlTwoCriticalHitCombination = 0;
        return;
    }
  }
}

function checkForWinner(attacker, defenderHeals) {
  if (defenderHeals <= 0) {
    document.dispatchEvent(
      new CustomEvent('get-winner', {
        detail: { winner: attacker },
      })
    );
  }
}

function getResultCombinationDamage(fighter) {
  const { attack } = fighter;
  return attack * 2;
}

function getResultDamage(
  attacker,
  defender,
  isAttackerInDefenceMode,
  isDefenderInDefenceMode,
  attackerInDefenceModeTimer
) {
  if (isAttackerInDefenceMode) {
    isAttackerInDefenceMode = false;
    clearTimeout(attackerInDefenceModeTimer);
  }

  if (isDefenderInDefenceMode) {
    return getDamage(attacker, defender);
  } else {
    return getHitPower(attacker);
  }
}

export function getDamage(attacker, defender) {
  const damage = getHitPower(attacker) - getBlockPower(defender);
  if (damage <= 0) {
    return 0;
  }
  return damage;
}

export function getHitPower(fighter) {
  const { attack } = fighter;
  const criticalHitChance = getChance();
  const power = attack * criticalHitChance;
  return power;
}

export function getBlockPower(fighter) {
  const { defense } = fighter;
  const dodgeChance = getChance();
  const power = defense * dodgeChance;
  return power;
}

function getChance() {
  return Math.random() + 1;
}
