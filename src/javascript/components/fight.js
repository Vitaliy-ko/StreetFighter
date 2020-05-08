import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
  const { health: firstFighterHealth } = firstFighter;
  const { health: secondFighterHealth } = secondFighter;
  const defenceModeTime = 500;
  let firstFighterHP = Number(firstFighterHealth);
  let secondFighterHP = Number(secondFighterHealth);
  let isFirstFighterInDefenceMode = false;
  let isSecondFighterInDefenceMode = false;
  let firstFighterDefenceModeTimeout = null;
  let secondFighterDefenceModeTimeout = null;
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
        console.log(resultDamage, isSecondFighterInDefenceMode, secondFighterHP);
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
        if (keyIndexPlOneCriticalHitCombination === 3) {
          secondFighterHP = secondFighterHP - getResultCombinationDamage(firstFighter);
          console.log(secondFighterHP);
          keyIndexPlOneCriticalHitCombination = 0;
          checkForWinner(firstFighter, secondFighterHP);
        }
        break;
      case PlayerTwoCriticalHitCombination[keyIndexPlTwoCriticalHitCombination]:
        keyIndexPlTwoCriticalHitCombination++;
        if (keyIndexPlTwoCriticalHitCombination === 3) {
          firstFighterHP = firstFighterHP - getResultCombinationDamage(secondFighter);
          keyIndexPlTwoCriticalHitCombination = 0;
          checkForWinner(secondFighter, firstFighterHP);
        }
        break;
      default:
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
  // const damage = getHitPower(attacker) - getBlockPower(defender);
  const damage = 5 - getBlockPower(defender);
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
