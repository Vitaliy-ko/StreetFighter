import { createElement } from '../helpers/domHelper';

export function createFighterPreview(fighter, position) {
  const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
  const fighterElement = createElement({
    tagName: 'div',
    className: `fighter-preview___root ${positionClassName}`,
  });
  const fighterCharacteristics = ['name', 'health', 'attack', 'defense'];
  const fighterImage = createFighterImage(fighter);
  const characteristicsContainer = createElement({
    tagName: 'div',
    className: 'fighter-preview__chars-container',
  });

  fighterElement.append(fighterImage);
  fighterCharacteristics.forEach((characteristic) => {
    characteristicsContainer.append(addCharacteristic(characteristic, fighter));
  });

  fighterElement.append(characteristicsContainer);
  return fighterElement;
}

function addCharacteristic(characteristic, fighter) {
  const container = createElement({ tagName: 'div', className: 'fighter-preview__char-container' });

  const characteristicName = createElement({
    tagName: 'span',
    className: 'fighter-preview__char fighter-preview__char__name',
  });
  const characteristicValue = createElement({
    tagName: 'span',
    className: 'fighter-preview__char',
  });

  characteristicName.innerText = characteristic;
  characteristicValue.innerText = fighter[characteristic];

  container.append(characteristicName, characteristicValue);
  return container;
}

export function createFighterImage(fighter) {
  const { source, name } = fighter;
  const attributes = {
    src: source,
    title: name,
    alt: name,
  };
  const imgElement = createElement({
    tagName: 'img',
    className: 'fighter-preview___img',
    attributes,
  });

  return imgElement;
}
