import { __ } from '@wordpress/i18n';
import { SelectControl, TextControl } from '@wordpress/components';

type TimeFormatValue = 'H:i' | 'g:i a';
type OutputFormatValue = 'summarized' | 'raw';

export type TimeFormatControlsChange = Partial<Pick<
	TimeFormatControlsProps,
	'timeFormat' | 'outputFormat' | 'dateFormat'
>>;

export interface TimeFormatControlsProps {
	timeFormat?: TimeFormatValue;
	outputFormat?: OutputFormatValue;
	showDateControls?: boolean;
	dateFormat?: string;
	onChange: (next: TimeFormatControlsChange) => void;
}

export default function TimeFormatControls({
	timeFormat = 'g:i a',
	outputFormat = 'summarized',
	showDateControls = false,
	dateFormat = 'F d, Y',
	onChange,
}: TimeFormatControlsProps) {
	return (
		<>
			<SelectControl
				label={__('Time Format')}
				value={timeFormat}
				options={[
					{ label: __('24-hour'), value: 'H:i' },
					{ label: __('12-hour'), value: 'g:i a' },
				]}
				help={__(
					'Choose how the time should be displayed. The 12-hour format includes AM/PM.'
				)}
				onChange={(value) => onChange({ timeFormat: value as TimeFormatValue })}
			/>

			<SelectControl
				label={__('Output Format')}
				value={outputFormat}
				options={[
					{ label: __('Summarized'), value: 'summarized' },
					{ label: __('Raw'), value: 'raw' },
				]}
				help={__(
					'Summarized formats the time for display. Raw outputs the stored value.'
				)}
				onChange={(value) => onChange({ outputFormat: value as OutputFormatValue })}
			/>

			{showDateControls && (
				<TextControl
					label={__('Date Format')}
					value={dateFormat}
					help={__(
						'Enter a valid PHP date format, e.g., "F d, Y" for "December 20, 2025".'
					)}
					onChange={(value) => onChange({ dateFormat: value })}
				/>
			)}
		</>
	);
}
