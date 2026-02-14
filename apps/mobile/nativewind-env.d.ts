/**
 * NativeWind className type augmentations for React Native components.
 *
 * In a monorepo, nativewind is hoisted to root node_modules so
 * `/// <reference types="nativewind/types" />` can't resolve.
 * We inline the augmentations here instead.
 */

import "react-native";

declare module "react-native" {
  // Core components
  interface ViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TextProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ImagePropsBase {
    className?: string;
    cssInterop?: boolean;
  }
  interface TextInputProps {
    className?: string;
    cssInterop?: boolean;
    placeholderClassName?: string;
  }
  interface SwitchProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ScrollViewProps {
    contentContainerClassName?: string;
    indicatorClassName?: string;
  }
  interface FlatListProps<ItemT> {
    columnWrapperClassName?: string;
  }
  interface ImageBackgroundProps {
    imageClassName?: string;
  }
  interface KeyboardAvoidingViewProps {
    contentContainerClassName?: string;
  }
  interface PressableProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TouchableOpacityProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TouchableHighlightProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TouchableWithoutFeedbackProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ActivityIndicatorProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface StatusBarProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface InputAccessoryViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ModalBaseProps {
    presentationClassName?: string;
  }
}

declare module "@react-native/virtualized-lists" {
  export interface VirtualizedListWithoutRenderItemProps<ItemT> {
    ListFooterComponentClassName?: string;
    ListHeaderComponentClassName?: string;
  }
}
