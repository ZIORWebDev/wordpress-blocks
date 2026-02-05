/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';

type ToolsPanelDropdownMenuProps =
	| {
			popoverProps: {
				placement: 'left-start';
				offset: number;
			};
	  }
	| Record<string, never>;

export function useToolsPanelDropdownMenuProps(): ToolsPanelDropdownMenuProps {
	const isMobile = useViewportMatch('medium', '<');

	return !isMobile
		? {
				popoverProps: {
					placement: 'left-start',
					// For non-mobile: inner sidebar width (248px) - button width (24px) - border (1px)
					// + padding (16px) + spacing (20px) = 259
					offset: 259,
				},
		  }
		: {};
}
