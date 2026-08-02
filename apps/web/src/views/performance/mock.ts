import type {
  PerformanceItem,
  PerformanceOverview,
  PerformanceListResult,
  PerformancePeriod,
  PerformanceIndicator,
} from './types'

const regions = [
  { code: 'EAST', name: '华东区' },
  { code: 'SOUTH', name: '华南区' },
  { code: 'NORTH', name: '华北区' },
  { code: 'CENTRAL', name: '华中区' },
  { code: 'SOUTHWEST', name: '西南区' },
]

const teams = [
  { id: 'team_1', name: '血球销售一部', ownerName: '张经理' },
  { id: 'team_2', name: '生化销售二部', ownerName: '李经理' },
  { id: 'team_3', name: '免疫销售三部', ownerName: '王经理' },
  { id: 'team_4', name: '流水线事业部', ownerName: '赵经理' },
  { id: 'team_5', name: '基层医疗组', ownerName: '刘经理' },
]

const products = [
  { id: 'prod_1', name: '血球流水线', productLine: '血球' },
  { id: 'prod_2', name: '生化分析仪', productLine: '生化' },
  { id: 'prod_3', name: '免疫发光仪', productLine: '免疫' },
  { id: 'prod_4', name: '凝血分析仪', productLine: '凝血' },
  { id: 'prod_5', name: '尿液分析系统', productLine: '尿液' },
]

const channels = [
  { id: 'ch_1', name: '华东总代理', regionName: '华东区' },
  { id: 'ch_2', name: '华南核心经销商', regionName: '华南区' },
  { id: 'ch_3', name: '华北区域分销', regionName: '华北区' },
  { id: 'ch_4', name: '西南授权商', regionName: '西南区' },
  { id: 'ch_5', name: '华中合作伙伴', regionName: '华中区' },
]

function buildItem(
  id: string,
  name: string,
  baseTarget: number,
  extra: Partial<PerformanceItem> = {},
): PerformanceItem {
  const target = Math.round(baseTarget * (0.6 + Math.random() * 0.8))
  const actual = Math.round(target * (0.45 + Math.random() * 0.45))
  const achievementRate = Math.round((actual / target) * 1000) / 10
  const gap = target - actual
  const yoy = Math.round((Math.random() * 40 - 10) * 10) / 10
  const mom = Math.round((Math.random() * 30 - 10) * 10) / 10
  let status: 'normal' | 'attention' | 'risk' = 'normal'
  if (achievementRate < 50) status = 'risk'
  else if (achievementRate < 80) status = 'attention'

  return { id, name, target, actual, achievementRate, gap, yoy, mom, status, ...extra }
}

export function generatePerformanceOverview(
  period: string = 'month',
  indicator: string = 'revenue',
): PerformanceOverview {
  const baseMultiplier = indicator === 'quantity' ? 1 : indicator === 'collection' ? 0.85 : 1
  const targetTotal = Math.round(
    (period === 'year' ? 350000000 : period === 'quarter' ? 90000000 : 30000000) * baseMultiplier,
  )
  const actualTotal = Math.round(targetTotal * (0.6 + Math.random() * 0.25))
  const achievementRate = Math.round((actualTotal / targetTotal) * 1000) / 10
  const gap = targetTotal - actualTotal
  const yoy = Math.round((Math.random() * 30 - 5) * 10) / 10
  const mom = Math.round((Math.random() * 20 - 5) * 10) / 10
  const months = period === 'year' ? 12 : period === 'quarter' ? 3 : 1
  const trend = Array.from({ length: Math.max(months, 6) }, (_, i) => {
    const m = new Date().getMonth() + 1 - (Math.max(months, 6) - i)
    const label = m <= 0 ? `${m + 12}月` : `${m}月`
    return {
      label,
      target: Math.round(targetTotal / Math.max(months, 6)),
      actual: Math.round((targetTotal / Math.max(months, 6)) * (0.5 + Math.random() * 0.6)),
    }
  })

  return {
    targetTotal,
    actualTotal,
    achievementRate,
    gap,
    yoy,
    mom,
    underperformCount: Math.floor(Math.random() * 8) + 2,
    trend,
    period: period as PerformancePeriod,
    indicator: indicator as PerformanceIndicator,
  }
}

export function generatePerformanceList(
  tabType: string = 'team',
  period: string = 'month',
  indicator: string = 'revenue',
  keyword?: string,
): PerformanceListResult {
  const baseMultiplier = indicator === 'quantity' ? 1 : indicator === 'collection' ? 0.85 : 1
  const baseTarget =
    (period === 'year' ? 70000000 : period === 'quarter' ? 18000000 : 6000000) * baseMultiplier

  let source: PerformanceItem[] = []
  switch (tabType) {
    case 'team':
      source = teams.map((t) => buildItem(t.id, t.name, baseTarget, { ownerName: t.ownerName }))
      break
    case 'region':
      source = regions.map((r) => buildItem(r.code, r.name, baseTarget, { regionName: r.name }))
      break
    case 'product':
      source = products.map((p) =>
        buildItem(p.id, p.name, baseTarget, { productLine: p.productLine }),
      )
      break
    case 'channel':
      source = channels.map((c) =>
        buildItem(c.id, c.name, baseTarget, { regionName: c.regionName }),
      )
      break
    case 'my':
    default:
      source = [buildItem('my', '我的绩效', baseTarget, { ownerName: '本人' })]
      break
  }

  if (keyword) {
    source = source.filter((item) => item.name.includes(keyword))
  }

  source.sort((a, b) => a.achievementRate - b.achievementRate)
  source = source.map((item, index) => ({ ...item, rank: index + 1 }))

  return { list: source, total: source.length, page: 1, size: source.length, pages: 1 }
}
