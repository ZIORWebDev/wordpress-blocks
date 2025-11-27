import './editor.scss';
import * as Icon from './blocks/icon';
import * as IconPicker from './blocks/icon-picker';

const getAllBlocks = () => {
	const blocks = [
		Icon,
		IconPicker
	];

	return blocks.filter( Boolean );
};

getAllBlocks().forEach( ( { init } ) => init() );