import * as React from "react"
import {
  Animated,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type LayoutChangeEvent,
  PanResponder,
  Platform,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

export type SliderValue = number | number[]

export interface SliderProps extends ViewProps {
  value?: SliderValue
  defaultValue?: SliderValue
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: SliderValue) => void
  onSlideEnd?: (value: SliderValue) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  orientation?: "horizontal" | "vertical"
  activeColor?: string
  inactiveColor?: string
  trackStyle?: StyleProp<ViewStyle>
  thumbStyle?: StyleProp<ViewStyle>
}

const TRACK_HEIGHTS = {
  sm: 4,
  md: 6,
  lg: 8,
} as const

const THUMB_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

type SliderRef = React.ComponentRef<typeof View>

export const Slider = React.forwardRef<SliderRef, SliderProps>(
  (
    {
      value: valueProp,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      onSlideEnd,
      disabled = false,
      size = "md",
      orientation = "horizontal",
      activeColor,
      inactiveColor,
      trackStyle,
      thumbStyle,
      style,
      ...props
    },
    ref,
  ) => {
    const isVertical = orientation === "vertical"
    const { theme } = useUnistyles()

    const resolvedActiveColor = activeColor ?? theme.colors.primary
    const resolvedInactiveColor = inactiveColor ?? theme.colors.muted

    const isMultiThumb = Array.isArray(defaultValue) || Array.isArray(valueProp)

    const [uncontrolledValue, setUncontrolledValue] =
      React.useState<SliderValue>(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : uncontrolledValue

    const values = React.useMemo(
      () => (Array.isArray(value) ? [...value].sort((a, b) => a - b) : [value]),
      [value],
    )

    const thumbSize = THUMB_SIZES[size]
    const trackHeight = TRACK_HEIGHTS[size]
    const trackInset = Math.max(0, (thumbSize - trackHeight) / 2)

    const [trackLayout, setTrackLayout] = React.useState({
      width: 0,
      height: 0,
    })

    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(
      null,
    )

    const lastDraggedValue = React.useRef<number | null>(null)

    const thumbPositions = React.useRef<Animated.Value[]>(
      values.map((v) => new Animated.Value(v)),
    )
    const thumbIdCounter = React.useRef(0)
    const thumbIds = React.useRef<string[]>(
      values.map(() => `thumb-${thumbIdCounter.current++}`),
    )

    if (thumbPositions.current.length > values.length) {
      thumbPositions.current = thumbPositions.current.slice(0, values.length)
    }
    if (thumbIds.current.length > values.length) {
      thumbIds.current = thumbIds.current.slice(0, values.length)
    }
    while (thumbPositions.current.length < values.length) {
      thumbPositions.current.push(
        new Animated.Value(values[thumbPositions.current.length]),
      )
    }
    while (thumbIds.current.length < values.length) {
      thumbIds.current.push(`thumb-${thumbIdCounter.current++}`)
    }

    React.useEffect(() => {
      thumbPositions.current.forEach((pos, i) => {
        Animated.spring(pos, {
          toValue: values[i],
          useNativeDriver: false,
          damping: 20,
          stiffness: 300,
        }).start()
      })
    }, [values])

    const handleTrackLayout = React.useCallback((event: LayoutChangeEvent) => {
      setTrackLayout({
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height,
      })
    }, [])

    const getNormalizedPosition = React.useCallback(
      (relativeX: number, relativeY: number) => {
        const trackLength = isVertical ? trackLayout.height : trackLayout.width
        if (trackLength <= 0) return 0

        const pos = isVertical ? relativeY : relativeX
        const clamped = Math.max(0, Math.min(pos, trackLength))
        return clamped / trackLength
      },
      [trackLayout.height, trackLayout.width, isVertical],
    )

    const getValueFromNormalized = React.useCallback(
      (normalized: number) => {
        const raw = min + normalized * (max - min)
        const stepped = step > 0 ? Math.round(raw / step) * step : raw
        return Math.min(Math.max(stepped, min), max) as number
      },
      [min, max, step],
    )

    const handlePanResponderStart = React.useCallback(
      (
        event: GestureResponderEvent,
        _gestureState: PanResponderGestureState,
      ) => {
        const trackLength = isVertical ? trackLayout.height : trackLayout.width
        if (disabled || trackLength <= 0) return

        const relativeX = event.nativeEvent.locationX
        const relativeY = event.nativeEvent.locationY

        const normalized = getNormalizedPosition(relativeX, relativeY)
        const newValue = getValueFromNormalized(normalized)

        let nearestIndex = 0
        let nearestDistance = Infinity

        values.forEach((v, i) => {
          const distance = Math.abs(v - newValue)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = i
          }
        })

        setDraggingIndex(nearestIndex)
        setFocusedIndex(nearestIndex)
      },
      [
        disabled,
        trackLayout.height,
        trackLayout.width,
        isVertical,
        getNormalizedPosition,
        getValueFromNormalized,
        values,
      ],
    )

    const handlePanResponderMove = React.useCallback(
      (
        event: GestureResponderEvent,
        _gestureState: PanResponderGestureState,
      ) => {
        const trackLength = isVertical ? trackLayout.height : trackLayout.width
        if (disabled || draggingIndex === null || trackLength <= 0) return

        const relativeX = event.nativeEvent.locationX
        const relativeY = event.nativeEvent.locationY

        const normalized = getNormalizedPosition(relativeX, relativeY)
        let newValue = getValueFromNormalized(normalized)

        const sortedValues = [...values].sort((a, b) => a - b)

        if (draggingIndex > 0) {
          newValue = Math.max(newValue, sortedValues[draggingIndex - 1] + step)
        }
        if (draggingIndex < values.length - 1) {
          newValue = Math.min(newValue, sortedValues[draggingIndex + 1] - step)
        }

        const newValues = [...values]
        newValues[draggingIndex] = newValue
        lastDraggedValue.current = newValue

        const emittedValue = isMultiThumb ? newValues : newValues[0]

        if (!isControlled) {
          setUncontrolledValue(emittedValue)
        }
        onValueChange?.(emittedValue)
      },
      [
        disabled,
        draggingIndex,
        trackLayout.height,
        trackLayout.width,
        isVertical,
        values,
        step,
        isControlled,
        isMultiThumb,
        onValueChange,
        getNormalizedPosition,
        getValueFromNormalized,
      ],
    )

    const handlePanResponderEnd = React.useCallback(() => {
      if (draggingIndex !== null) {
        const currentValue =
          lastDraggedValue.current ?? values[draggingIndex] ?? min
        const emittedValue = isMultiThumb
          ? [
              ...values.slice(0, draggingIndex),
              currentValue,
              ...values.slice(draggingIndex + 1),
            ]
          : currentValue
        onSlideEnd?.(emittedValue)
        lastDraggedValue.current = null
        setDraggingIndex(null)
      }
    }, [draggingIndex, values, isMultiThumb, min, onSlideEnd])

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: handlePanResponderStart,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderEnd,
      onPanResponderTerminate: handlePanResponderEnd,
    })

    const [focusedIndex, setFocusedIndex] = React.useState<number>(0)

    const handleFocusValueChange = React.useCallback((newValue: string) => {
      setFocusedIndex(Number(newValue))
    }, [])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (Platform.OS !== "web" || disabled) return
        if (event.key === "Tab") {
          return
        }

        const isIncrementKey =
          event.key === "ArrowRight" || event.key === "ArrowUp"
        const isDecrementKey =
          event.key === "ArrowLeft" || event.key === "ArrowDown"
        const isHomeKey = event.key === "Home"
        const isEndKey = event.key === "End"

        if (!isIncrementKey && !isDecrementKey && !isHomeKey && !isEndKey) {
          return
        }

        const range = max - min
        if (range === 0) {
          event.preventDefault()
          return
        }

        const sortedValues = [...values].sort((a, b) => a - b)
        const currentValue = values[focusedIndex] ?? min
        const stepValue = step / range
        let newNormalized = (currentValue - min) / range

        if (isIncrementKey) {
          newNormalized = Math.min(1, newNormalized + stepValue)
        } else if (isDecrementKey) {
          newNormalized = Math.max(0, newNormalized - stepValue)
        } else if (isHomeKey) {
          newNormalized = 0
        } else if (isEndKey) {
          newNormalized = 1
        }

        event.preventDefault()
        let newValue = getValueFromNormalized(newNormalized)

        if (values.length > 1) {
          if (focusedIndex > 0) {
            newValue = Math.max(newValue, sortedValues[focusedIndex - 1] + step)
          }
          if (focusedIndex < values.length - 1) {
            newValue = Math.min(newValue, sortedValues[focusedIndex + 1] - step)
          }
        }

        const newValues = [...values]
        newValues[focusedIndex] = newValue
        lastDraggedValue.current = newValue

        const emittedValue = isMultiThumb ? newValues : newValues[0]

        if (!isControlled) {
          setUncontrolledValue(emittedValue)
        }
        onValueChange?.(emittedValue)
        onSlideEnd?.(emittedValue)
      },
      [
        disabled,
        focusedIndex,
        values,
        step,
        max,
        min,
        isControlled,
        isMultiThumb,
        onValueChange,
        onSlideEnd,
        getValueFromNormalized,
      ],
    )

    const animatedThumbPositions = React.useMemo(() => {
      return thumbPositions.current.map((pos) =>
        pos.interpolate({
          inputRange: [min, max],
          outputRange: [0, isVertical ? trackLayout.height : trackLayout.width],
          extrapolate: "clamp",
        }),
      )
    }, [
      min,
      max,
      isVertical,
      trackLayout.height,
      trackLayout.width,
      values.length,
    ])

    const renderTrackFills = () => {
      if (values.length === 0) return null

      const trackLength = isVertical ? trackLayout.height : trackLayout.width
      if (trackLength <= 0) return null

      const trackFillInsetStyle = isVertical
        ? { left: trackInset }
        : { top: trackInset }
      const sortedValues = [...values].sort((a, b) => a - b)
      const fills: React.ReactNode[] = []

      const firstValue = sortedValues[0]
      const lastValue = sortedValues[sortedValues.length - 1]

      if (values.length === 1) {
        const normalized = (firstValue - min) / (max - min)
        const length = normalized * trackLength

        fills.push(
          <Animated.View
            key={`fill-active-${firstValue}`}
            style={[
              styles.trackFill,
              {
                backgroundColor: resolvedActiveColor,
              },
              trackFillInsetStyle,
              isVertical
                ? { height: length, width: trackHeight }
                : { width: length, height: trackHeight },
              trackStyle,
            ]}
          />,
        )
      } else {
        const startNormalized = (firstValue - min) / (max - min)
        const endNormalized = (lastValue - min) / (max - min)
        const startOffset = startNormalized * trackLength
        const activeLength = (endNormalized - startNormalized) * trackLength

        fills.push(
          <Animated.View
            key={`fill-active-${firstValue}-${lastValue}`}
            style={[
              styles.trackFill,
              {
                backgroundColor: resolvedActiveColor,
              },
              trackFillInsetStyle,
              isVertical
                ? {
                    height: activeLength,
                    width: trackHeight,
                    top: startOffset,
                  }
                : {
                    width: activeLength,
                    height: trackHeight,
                    left: startOffset,
                  },
              trackStyle,
            ]}
          />,
        )
      }

      return fills
    }

    const renderThumbs = () => {
      return values.map((val, index) => {
        const isFocused = focusedIndex === index

        const thumbValue = val
        const thumbKey = thumbIds.current[index]

        const thumbContent = (
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                backgroundColor: resolvedActiveColor,
              },
              isFocused && styles.thumbFocused,
              isVertical
                ? { transform: [{ translateY: animatedThumbPositions[index] }] }
                : {
                    transform: [{ translateX: animatedThumbPositions[index] }],
                  },
              thumbStyle,
            ]}
          />
        )

        if (Platform.OS === "web") {
          return (
            <RovingFocusGroup.RovingFocusItem
              key={thumbKey}
              value={String(index)}
              disabled={disabled}
              asChild
            >
              <View
                style={styles.thumbWrapper}
                tabIndex={0}
                // @ts-expect-error - web-only prop
                onKeyDown={handleKeyDown}
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={thumbValue}
                aria-orientation={orientation}
                aria-disabled={disabled}
              >
                {thumbContent}
              </View>
            </RovingFocusGroup.RovingFocusItem>
          )
        }

        return (
          <React.Fragment key={thumbKey}>
            {thumbContent}
          </React.Fragment>
        )
      })
    }

    const renderContent = () => (
      <View
        style={[styles.trackContainer, isVertical && styles.vertical]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.trackWrapper,
            isVertical && styles.verticalWrapper,
            isVertical ? { minWidth: thumbSize } : { minHeight: thumbSize },
          ]}
          onLayout={handleTrackLayout}
        >
          <View
            style={[
              styles.track,
              isVertical ? styles.trackVertical : styles.trackHorizontal,
              isVertical ? { width: trackHeight } : { height: trackHeight },
              {
                backgroundColor: resolvedInactiveColor,
              },
              trackStyle,
            ]}
          />
          {renderTrackFills()}
          {renderThumbs()}
        </View>
      </View>
    )

    const sliderValue = values[focusedIndex] ?? min

    return (
      <View ref={ref} style={[disabled && styles.disabled, style]} {...props}>
        {Platform.OS === "web" ? (
          <RovingFocusGroup.RovingFocusGroup
            orientation={isVertical ? "vertical" : "horizontal"}
            loop
            value={String(focusedIndex)}
            onValueChange={handleFocusValueChange}
            asChild
          >
            <View style={styles.webSliderContainer} tabIndex={-1}>
              {renderContent()}
            </View>
          </RovingFocusGroup.RovingFocusGroup>
        ) : (
          <View
            accessibilityRole="adjustable"
            accessibilityValue={{ min, max, now: sliderValue }}
            accessibilityState={{ disabled }}
          >
            {renderContent()}
          </View>
        )}
      </View>
    )
  },
)

Slider.displayName = "Slider"

const styles = StyleSheet.create((theme) => ({
  webSliderContainer: {
    outlineWidth: 0,
  },
  trackContainer: {
    position: "relative",
    justifyContent: "center",
  },
  trackWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  verticalWrapper: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    minHeight: 20,
  },
  track: {
    borderRadius: 999,
    overflow: "hidden",
  },
  trackHorizontal: {
    width: "100%",
    height: 4,
  },
  trackVertical: {
    width: 4,
    flex: 1,
  },
  trackFill: {
    position: "absolute",
    borderRadius: 999,
    left: 0,
    top: 0,
  },
  thumb: {
    position: "absolute",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  thumbWrapper: {
    outlineWidth: 0,
  },
  thumbFocused: {
    outlineWidth: 2,
    outlineStyle: "solid",
    outlineColor: theme.colors.ring,
  },
  vertical: {
    flexDirection: "column",
  },
  disabled: {
    opacity: 0.5,
  },
}))
