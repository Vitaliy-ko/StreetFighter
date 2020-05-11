import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
  const { health: firstFighterHealth } = firstFighter;
  const { health: secondFighterHealth } = secondFighter;
  const firstFighterHPConst = Number(firstFighterHealth);
  const secondFighterHPConst = Number(secondFighterHealth);
  const criticalHitCombinationTime = 10000;
  const firstFighterHealthIndicator = document.getElementById('left-fighter-indicator');
  const secondFighterHealthIndicator = document.getElementById('right-fighter-indicator');
  const {
    PlayerOneAttack,
    PlayerTwoAttack,
    PlayerOneBlock,
    PlayerTwoBlock,
    PlayerOneCriticalHitCombination,
    PlayerTwoCriticalHitCombination,
  } = controls;

  let firstFighterHP = firstFighterHPConst;
  let secondFighterHP = secondFighterHPConst;
  let isFirstFighterCriticalHitCombinationDisabled = false;
  let isSecondFighterCriticalHitCombinationDisabled = false;
  const keyEvents = {};

  document.addEventListener('keydown', keydownHandler, false);
  document.addEventListener('keyup', keyupHandler, false);

  function keydownHandler(e) {
    keyEvents[e.code] = true;
    fightAction();
  }
  function keyupHandler(e) {
    keyEvents[e.code] = false;
  }

  return new Promise((resolve) => {
    document.addEventListener('get-winner', getWinner);

    function getWinner(event) {
      document.removeEventListener('get-winner', getWinner);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
      resolve(event.detail.winner);
    }
  });

  function fightAction() {
    if (keyEvents[PlayerOneAttack] && !keyEvents[PlayerOneBlock] && !keyEvents[PlayerTwoBlock]) {
      secondFighterHP = secondFighterHP - getDamage(firstFighter, secondFighter);
      secondFighterHealthIndicator.style.width = (secondFighterHP / secondFighterHPConst) * 100 + '%';
      checkForWinner(firstFighter, secondFighterHP);
    }

    if (keyEvents[PlayerTwoAttack] && !keyEvents[PlayerOneBlock] && !keyEvents[PlayerTwoBlock]) {
      firstFighterHP = firstFighterHP - getDamage(secondFighter, firstFighter);
      firstFighterHealthIndicator.style.width = (firstFighterHP / firstFighterHPConst) * 100 + '%';
      checkForWinner(secondFighter, firstFighterHP);
    }

    if (
      isCriticalHitCombination(PlayerOneCriticalHitCombination) === true &&
      isFirstFighterCriticalHitCombinationDisabled === false
    ) {
      secondFighterHP = secondFighterHP - getResultCombinationDamage(firstFighter);
      secondFighterHealthIndicator.style.width = (secondFighterHP / secondFighterHPConst) * 100 + '%';
      checkForWinner(firstFighter, secondFighterHP);
      isFirstFighterCriticalHitCombinationDisabled = true;
      setTimeout(() => (isFirstFighterCriticalHitCombinationDisabled = false), criticalHitCombinationTime);
    }

    if (
      isCriticalHitCombination(PlayerTwoCriticalHitCombination) === true &&
      isSecondFighterCriticalHitCombinationDisabled === false
    ) {
      firstFighterHP = firstFighterHP - getResultCombinationDamage(secondFighter);
      firstFighterHealthIndicator.style.width = (firstFighterHP / firstFighterHPConst) * 100 + '%';
      checkForWinner(secondFighter, firstFighterHP);
      isSecondFighterCriticalHitCombinationDisabled = true;
      setTimeout(() => (isSecondFighterCriticalHitCombinationDisabled = false), criticalHitCombinationTime);
    }
  }

  function isCriticalHitCombination(combination) {
    let result = true;
    combination.forEach((code) => {
      if (!keyEvents[code]) {
        return (result = false);
      }
    });
    return result;
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
