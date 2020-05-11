import { showModal } from './modal';
import { createElement } from '../../helpers/domHelper';
import { createFighterImage } from '../fighterPreview';
import App from './../../app';

export function showWinnerModal(fighter) {
  console.dir(fighter);
  const root = document.getElementById('root');
  const bodyElement = createElement({ tagName: 'div', className: 'modal-body' });
  const fighterName = createElement({ tagName: 'p', className: 'fighter-name' });
  const fighterImage = createFighterImage(fighter);

  fighterName.innerText = fighter.name;

  bodyElement.append(fighterName, fighterImage);

  showModal({
    title: 'Winner',
    bodyElement,
    onClose: () => {
      root.innerHTML = '';
      new App();
    },
  });
}
