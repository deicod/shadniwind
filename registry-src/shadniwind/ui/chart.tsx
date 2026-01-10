import * as React from "react"
import {
  type LayoutChangeEvent,
  type StyleProp,
  Text,
  View,
  type ViewProps,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { Circle, Line, Path, Rect, Svg } from "react-native-svg"

export type ChartType = "line" | "bar" | "area"

export type ChartDatum = Record<string, number | string | null | undefined>

export type ChartSeries = {
  id: string
  dataKey: string
  label?: string
  color?: string
  type?: ChartType
  strokeWidth?: number
  fillOpacity?: number
  showDots?: boolean
  dotSize?: number
}

export type ChartProps = ViewProps & {
  data: ChartDatum[]
  series: ChartSeries[]
  width?: number
  height?: number
  padding?: number
  minValue?: number
  maxValue?: number
  showGrid?: boolean
  gridLineCount?: number
}

export type ChartLegendProps = {
  series: ChartSeries[]
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  indicatorStyle?: StyleProp<ViewStyle>
}

type ChartPoint = {
  x: number
  y: number
  value: number
}

const DEFAULT_HEIGHT = 180
const DEFAULT_GRID_LINES = 4

function toNumber(value: unknown) {
  if (typeof value === "number" && !Number.isNaN(value)) return value
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return null
}

function buildLinePath(points: ChartPoint[]) {
  if (!points.length) return ""
  return points
    .map((point, index) => {
      const prefix = index === 0 ? "M" : "L"
      return `${prefix}${point.x} ${point.y}`
    })
    .join(" ")
}

function buildAreaPath(points: ChartPoint[], baselineY: number) {
  if (!points.length) return ""
  const line = buildLinePath(points)
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  return `${line} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Simple SVG-based chart component.
 *
 * Supports line, area, and bar series. Data is scaled by min/max values and
 * rendered with index-based X positions.
 *
 * Limitations:
 * - No axes, tooltips, or gesture interactions.
 * - Values are treated as numeric; non-numeric entries are clamped to the
 *   min value.
 * - Intended for small datasets and dashboard-style visuals.
 *
 * Requires `react-native-svg` to be installed.
 */
export const Chart = React.forwardRef<View, ChartProps>(
  (
    {
      data,
      series,
      width,
      height = DEFAULT_HEIGHT,
      padding,
      minValue,
      maxValue,
      showGrid = false,
      gridLineCount = DEFAULT_GRID_LINES,
      style,
      onLayout,
      ...props
    },
    ref,
  ) => {
    const { theme } = useUnistyles()
    const [measuredWidth, setMeasuredWidth] = React.useState(0)

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        if (width === undefined) {
          setMeasuredWidth(event.nativeEvent.layout.width)
        }
        onLayout?.(event)
      },
      [onLayout, width],
    )

    const resolvedWidth = width ?? measuredWidth
    const resolvedPadding = padding ?? theme.spacing[4]
    const innerWidth = Math.max(0, resolvedWidth - resolvedPadding * 2)
    const innerHeight = Math.max(0, height - resolvedPadding * 2)

    const palette = React.useMemo(
      () => [
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.accent,
        theme.colors.destructive,
        theme.colors.ring,
        theme.colors.mutedForeground,
      ],
      [theme],
    )

    const resolvedSeries = React.useMemo(
      () =>
        series.map((item, index) => ({
          ...item,
          type: item.type ?? "line",
          color: item.color ?? palette[index % palette.length],
          strokeWidth: item.strokeWidth ?? 2,
          fillOpacity: item.fillOpacity ?? 0.2,
          dotSize: item.dotSize ?? 4,
        })),
      [palette, series],
    )

    const numericValues = React.useMemo(() => {
      const values: number[] = []
      for (const item of resolvedSeries) {
        for (const datum of data) {
          const value = toNumber(datum[item.dataKey])
          if (value !== null) values.push(value)
        }
      }
      return values
    }, [data, resolvedSeries])

    const computedMin =
      minValue ?? (numericValues.length ? Math.min(...numericValues) : 0)
    const computedMax =
      maxValue ??
      (numericValues.length ? Math.max(...numericValues) : computedMin + 1)
    const resolvedMin = computedMin
    const resolvedMax = Math.max(computedMax, resolvedMin)
    const range = resolvedMax - resolvedMin || 1

    const lineStep = data.length > 1 ? innerWidth / (data.length - 1) : 0
    const baselineY = resolvedPadding + innerHeight

    const barSeries = resolvedSeries.filter((item) => item.type === "bar")
    const barGroupWidth = data.length ? innerWidth / data.length : 0
    const barGap = Math.min(barGroupWidth * 0.2, resolvedPadding)
    const barWidth =
      barSeries.length > 0
        ? Math.max(0, (barGroupWidth - barGap) / barSeries.length)
        : 0
    const barRadius = theme.radius.sm

    const gridLines = React.useMemo(() => {
      if (!showGrid || gridLineCount <= 0) return []
      return Array.from({ length: gridLineCount + 1 }, (_, index) => {
        const y =
          resolvedPadding + (innerHeight / gridLineCount) * index
        return { key: `grid-${Math.round(y * 1000)}`, y }
      })
    }, [gridLineCount, innerHeight, resolvedPadding, showGrid])

    const containerStyle: StyleProp<ViewStyle> = [
      styles.container,
      { height, width: width ?? undefined },
      style,
    ]

    return (
      <View
        ref={ref}
        style={containerStyle}
        onLayout={handleLayout}
        accessibilityRole={props.accessibilityRole ?? "image"}
        {...props}
      >
        {resolvedWidth > 0 && innerWidth > 0 && innerHeight > 0 ? (
          <Svg width={resolvedWidth} height={height}>
            {gridLines.map((line) => (
              <Line
                key={line.key}
                x1={resolvedPadding}
                x2={resolvedPadding + innerWidth}
                y1={line.y}
                y2={line.y}
                stroke={theme.colors.border}
                strokeWidth={1}
              />
            ))}

            {barSeries.map((item, seriesIndex) => {
              return data.map((datum, datumIndex) => {
                const rawValue = toNumber(datum[item.dataKey]) ?? resolvedMin
                const normalized = clamp((rawValue - resolvedMin) / range, 0, 1)
                const barHeight = innerHeight * normalized
                const x =
                  resolvedPadding +
                  datumIndex * barGroupWidth +
                  barGap / 2 +
                  seriesIndex * barWidth
                const y = baselineY - barHeight

                return (
                  <Rect
                    key={`${item.id}-bar-${datumIndex}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={barRadius}
                    ry={barRadius}
                    fill={item.color}
                  />
                )
              })
            })}

            {resolvedSeries.map((item) => {
              if (item.type === "bar") return null
              const points: ChartPoint[] = data.map((datum, index) => {
                const rawValue = toNumber(datum[item.dataKey]) ?? resolvedMin
                const normalized = clamp((rawValue - resolvedMin) / range, 0, 1)
                const x =
                  resolvedPadding +
                  (data.length > 1 ? lineStep * index : innerWidth / 2)
                const y = baselineY - innerHeight * normalized
                return { x, y, value: rawValue }
              })

              const linePath = buildLinePath(points)
              const areaPath = buildAreaPath(points, baselineY)

              return (
                <React.Fragment key={item.id}>
                  {item.type === "area" ? (
                    <>
                      <Path
                        d={areaPath}
                        fill={item.color}
                        fillOpacity={item.fillOpacity}
                        stroke="none"
                      />
                      <Path
                        d={linePath}
                        stroke={item.color}
                        strokeWidth={item.strokeWidth}
                        fill="none"
                      />
                    </>
                  ) : (
                    <Path
                      d={linePath}
                      stroke={item.color}
                      strokeWidth={item.strokeWidth}
                      fill="none"
                    />
                  )}

                  {item.showDots
                    ? points.map((point, index) => (
                        <Circle
                          key={`${item.id}-dot-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r={item.dotSize ?? 4}
                          fill={item.color}
                        />
                      ))
                    : null}
                </React.Fragment>
              )
            })}
          </Svg>
        ) : null}
      </View>
    )
  },
)

Chart.displayName = "Chart"

export function ChartLegend({
  series,
  style,
  labelStyle,
  indicatorStyle,
}: ChartLegendProps) {
  const { theme } = useUnistyles()
  const palette = React.useMemo(
    () => [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.destructive,
      theme.colors.ring,
      theme.colors.mutedForeground,
    ],
    [theme],
  )

  return (
    <View style={[styles.legend, style]}>
      {series.map((item, index) => {
        const color = item.color ?? palette[index % palette.length]
        return (
          <View key={item.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendSwatch,
                { backgroundColor: color },
                indicatorStyle,
              ]}
            />
            <Text style={[styles.legendLabel, labelStyle]}>
              {item.label ?? item.id}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    overflow: "hidden",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
}))
