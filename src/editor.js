import './editor.scss';
import * as Icon from './blocks/icon';
import * as IconPicker from './blocks/icon-picker';
import * as MetaField from './blocks/meta-field';
// import * as IconList from './blocks/icon-list';

const getAllBlocks = () => {
	const blocks = [
		Icon,
		IconPicker,
		// IconList,
		MetaField
	];

	return blocks.filter( Boolean );
};

getAllBlocks().forEach( ( { init } ) => init() );