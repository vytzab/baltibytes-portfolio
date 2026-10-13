// The site: the game, straight into the Starting Village.
import '@fontsource/pixelify-sans/400.css';
import './game/game.css';
import { startGame } from './game/boot.ts';

startGame({ ids: { game: 'game', dialogue: 'dialogue', panel: 'info-panel', touch: 'touch-controls' }, mapId: 'map.village' });
