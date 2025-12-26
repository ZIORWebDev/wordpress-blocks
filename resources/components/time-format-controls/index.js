/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { SelectControl, TextControl } = wp.components;

export default function TimeFormatControls({
  timeFormat = 'g:i a',
  outputFormat = 'summarized',
  showDateControls = false,
  dateFormat = 'F d, Y',
  onChange,
}) {
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
          'Choose how the time should be displayed. The 12-hour format includes AM/PM.',
        )}
        onChange={(value) => onChange({ timeFormat: value })}
      />

      <SelectControl
        label={__('Output Format')}
        value={outputFormat}
        options={[
          { label: __('Summarized'), value: 'summarized' },
          { label: __('Raw'), value: 'raw' },
        ]}
        help={__(
          'Summarized formats the time for display. Raw outputs the stored value.',
        )}
        onChange={(value) => onChange({ outputFormat: value })}
      />

      {showDateControls && (
        <TextControl
          label={__('Date Format')}
          value={dateFormat}
          help={__(
            'Enter a valid PHP date format, e.g., "F d, Y" for "December 20, 2025".',
          )}
          onChange={(value) => onChange({ dateFormat: value })}
        />
      )}
    </>
  );
}
