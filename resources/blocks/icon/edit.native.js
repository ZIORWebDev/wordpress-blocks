/**
 * External dependencies
 */
import { View, Animated, Easing, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies (global wp object)
 */
const { BlockControls, store: blockEditorStore } = wp.blockEditor;
const { useEffect, useState, useRef, useCallback } = wp.element;
const { ToolbarGroup, ToolbarButton, LinkSettingsNavigation, Icon } =
  wp.components;
const { compose } = wp.compose;
const { __, sprintf } = wp.i18n;
const { withSelect } = wp.data;
const { store: blocksStore } = wp.blocks;

/**
 * Internal dependencies
 */
import { getIconService } from './icon-list';
import styles from './editor.scss';

const DEFAULT_ACTIVE_ICON_STYLES = {
  backgroundColor: '#f0f0f0',
  color: '#444',
};
const ANIMATION_DELAY = 300;
const ANIMATION_DURATION = 400;

const linkSettingsOptions = {
  url: {
    label: __('URL'),
    placeholder: __('Add URL'),
    autoFocus: true,
  },
  linkLabel: {
    label: __('Link label'),
    placeholder: __('None'),
  },
  footer: {
    label: __('Briefly describe the link to help screen reader user'),
  },
};

const IconEdit = ({
  attributes,
  setAttributes,
  isSelected,
  onFocus,
  name,
  activeVariation,
}) => {
  const { url, service = name } = attributes;
  const [isLinkSheetVisible, setIsLinkSheetVisible] = useState(false);
  const [hasUrl, setHasUrl] = useState(!!url);
  const activeIcon =
    styles[`wp-ziorwebdev-icon-${service}`] ||
    styles[`wp-ziorwebdev-icon`] ||
    DEFAULT_ACTIVE_ICON_STYLES;
  const animatedValue = useRef(new Animated.Value(0)).current;

  const { icon, label: iconLinkName } = getIconService(activeVariation);

  // When new icon icon is added link sheet is opened automatically.
  useEffect(() => {
    if (isSelected && !url) {
      setIsLinkSheetVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setHasUrl(false);
      animatedValue.setValue(0);
    } else if (url) {
      animateColors();
    }
  }, [url]);

  const interpolationColors = {
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  };

  const { opacity } = hasUrl ? activeIcon : interpolationColors;

  function animateColors() {
    Animated.sequence([
      Animated.delay(ANIMATION_DELAY),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.circle,
        useNativeDriver: false,
      }),
    ]).start(() => setHasUrl(true));
  }

  const onCloseSettingsSheet = useCallback(() => {
    setIsLinkSheetVisible(false);
  }, []);

  const onOpenSettingsSheet = useCallback(() => {
    setIsLinkSheetVisible(true);
  }, []);

  const onEmptyURL = useCallback(() => {
    animatedValue.setValue(0);
    setHasUrl(false);
  }, [animatedValue]);

  function onIconPress() {
    if (isSelected) {
      setIsLinkSheetVisible(true);
    } else {
      onFocus();
    }
  }

  const accessibilityHint = url
    ? sprintf(
        // translators: %s: icon link name e.g: "Instagram".
        __('%s has URL set'),
        iconLinkName,
      )
    : sprintf(
        // translators: %s: icon link name e.g: "Instagram".
        __('%s has no URL set'),
        iconLinkName,
      );

  return (
    <View style={styles.container}>
      {isSelected && (
        <>
          <BlockControls>
            <ToolbarGroup>
              <ToolbarButton
                title={sprintf(
                  // translators: %s: icon link name e.g: "Instagram".
                  __('Add link to %s'),
                  iconLinkName,
                )}
                icon={'admin-links'}
                onClick={onOpenSettingsSheet}
                isActive={url}
              />
            </ToolbarGroup>
          </BlockControls>
          <LinkSettingsNavigation
            isVisible={isLinkSheetVisible}
            url={attributes.url}
            label={attributes.label}
            rel={attributes.rel}
            onEmptyURL={onEmptyURL}
            onClose={onCloseSettingsSheet}
            setAttributes={setAttributes}
            options={linkSettingsOptions}
            withBottomSheet
          />
        </>
      )}

      <TouchableWithoutFeedback
        onPress={onIconPress}
        accessibilityRole="button"
        accessibilityLabel={sprintf(
          // translators: %s: icon link name e.g: "Instagram".
          __('%s icon'),
          iconLinkName,
        )}
        accessibilityHint={accessibilityHint}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: activeIcon.backgroundColor,
              opacity,
            },
          ]}
        >
          <Icon animated icon={icon()} style={{ color: activeIcon.color }} />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default compose([
  withSelect((select, { clientId }) => {
    const { getBlock } = select(blockEditorStore);
    const { getActiveBlockVariation } = select(blocksStore);

    const block = getBlock(clientId);
    const name = block?.name.substring(17);

    return {
      name,
      activeVariation: block
        ? getActiveBlockVariation(block.name, block.attributes)
        : undefined,
    };
  }),
])(IconEdit);
