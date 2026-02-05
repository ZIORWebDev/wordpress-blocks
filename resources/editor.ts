import './editor.scss';

import * as Icon from './blocks/icon';
import * as IconPicker from './blocks/icon-picker';
import * as MetaField from './blocks/meta-field';
import * as IconListItem from './blocks/icon-list-item';
import * as IconList from './blocks/icon-list';
import * as AddToCart from './blocks/add-to-cart';
import * as ProductPrice from './blocks/product-price';

type BlockModule = {
  init?: () => void;
};

const BLOCKS = [
  Icon,
  IconPicker,
  MetaField,
  IconListItem,
  IconList,
  AddToCart,
  ProductPrice,
] satisfies ReadonlyArray<BlockModule>;

const initBlocks = (blocks: ReadonlyArray<BlockModule>): void => {
  for (const block of blocks) {
    if (typeof block.init === 'function') block.init();
  }
};

initBlocks(BLOCKS);
