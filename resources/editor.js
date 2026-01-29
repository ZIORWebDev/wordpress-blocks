import './editor.scss';
import * as Icon from './blocks/icon';
import * as IconPicker from './blocks/icon-picker';
import * as MetaField from './blocks/meta-field';
import * as IconListItem from './blocks/icon-list-item';
import * as IconList from './blocks/icon-list';
import * as AddToCart from './blocks/add-to-cart';

const getAllBlocks = () => {
  const blocks = [Icon, IconPicker, MetaField, IconListItem, IconList, AddToCart];

  return blocks.filter(Boolean);
};

getAllBlocks().forEach(({ init }) => init());
