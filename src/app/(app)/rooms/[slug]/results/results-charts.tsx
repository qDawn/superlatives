'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'motion/react'

type TallyEntry = {
  label: string
  count: number
}

type QuestionResult = {
  question: {
    id: string
    text: string
  }
  tally: TallyEntry[]
}

export default function ResultsCharts({
  results,
}: {
  results: QuestionResult[]
}) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={chartType === 'bar' ? 'default' : 'outline'}
          onClick={() => setChartType('bar')}
        >
          Bar chart
        </Button>
        <Button
          size="sm"
          variant={chartType === 'pie' ? 'default' : 'outline'}
          onClick={() => setChartType('pie')}
        >
          Pie chart
        </Button>
      </div>

      {results.map(({ question, tally }, idx) => (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card>
            <CardContent className="pt-4 space-y-4">
              <p className="font-medium text-sm">{question.text}</p>
              {tally.length === 0 ? (
                <p className="text-xs text-muted-foreground">No votes.</p>
              ) : (
                <AnimatePresence mode="wait">
                  {chartType === 'bar' ? (
                    <motion.div
                      key="bar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BarChart tally={tally} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pie"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PieChart tally={tally} />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function BarChart({ tally }: { tally: TallyEntry[] }) {
  const max = Math.max(...tally.map(t => t.count))
  return (
    <div className="space-y-3">
      {tally.map((entry, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{entry.label}</span>
            <span className="text-muted-foreground">{entry.count} vote{entry.count !== 1 ? 's' : ''}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(entry.count / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function PieChart({ tally }: { tally: TallyEntry[] }) {
  const total = tally.reduce((sum, t) => sum + t.count, 0)
  const colors = [
    '#7F77DD', '#1D9E75', '#D85A30', '#D4537E',
    '#378ADD', '#639922', '#BA7517', '#E24B4A'
  ]

  let cumulative = 0
  const slices = tally.map((entry, i) => {
    const pct = entry.count / total
    const start = cumulative
    cumulative += pct
    return { ...entry, pct, start, color: colors[i % colors.length] }
  })

  function describeArc(start: number, end: number, r: number) {
    const cx = 80, cy = 80
    const startAngle = start * 2 * Math.PI - Math.PI / 2
    const endAngle = end * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const large = end - start > 0.5 ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="flex gap-8 items-center flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map((slice, i) => (
          <path
            key={i}
            d={describeArc(slice.start, slice.start + slice.pct, 70)}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="space-y-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: slice.color }} />
            <span>
              <span className="font-medium">{slice.label}</span>
              {' '}— {slice.count} ({Math.round(slice.pct * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}