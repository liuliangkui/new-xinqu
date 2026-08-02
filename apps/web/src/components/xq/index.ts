/**
 * Xq 组件库 — 全局注册
 * 所有 Xq* 组件自动注册，无需手动 import
 */
import type { App, Component } from 'vue'
import XqButton from './XqButton/index.vue'
import XqCardGrid from './XqCardGrid/index.vue'
import XqDataTable from './XqDataTable/index.vue'
import XqDrawer from './XqDrawer/index.vue'
import XqEmptyState from './XqEmptyState/index.vue'
import XqFilterBar from './XqFilterBar/index.vue'
import XqFormDrawer from './XqFormDrawer/index.vue'
import XqIcon from './XqIcon/index.vue'
import XqKpiCard from './XqKpiCard/index.vue'
import XqModal from './XqModal/index.vue'
import XqNavTabs from './XqNavTabs/index.vue'
import XqPageLayout from './XqPageLayout/index.vue'
import XqSearchBar from './XqSearchBar/index.vue'
import XqSidebar from './XqSidebar/index.vue'
import XqStatusBadge from './XqStatusBadge/index.vue'
import XqTimeline from './XqTimeline/index.vue'
import XqViewSwitch from './XqViewSwitch/index.vue'

export {
  XqButton,
  XqCardGrid,
  XqDataTable,
  XqDrawer,
  XqEmptyState,
  XqFilterBar,
  XqFormDrawer,
  XqIcon,
  XqKpiCard,
  XqModal,
  XqNavTabs,
  XqPageLayout,
  XqSearchBar,
  XqSidebar,
  XqStatusBadge,
  XqTimeline,
  XqViewSwitch,
}

const componentRegistry: Record<string, Component> = {
  XqButton,
  XqCardGrid,
  XqDataTable,
  XqDrawer,
  XqEmptyState,
  XqFilterBar,
  XqFormDrawer,
  XqIcon,
  XqKpiCard,
  XqModal,
  XqNavTabs,
  XqPageLayout,
  XqSearchBar,
  XqSidebar,
  XqStatusBadge,
  XqTimeline,
  XqViewSwitch,
}

export function installXqComponents(app: App): void {
  for (const [name, component] of Object.entries(componentRegistry)) {
    app.component(name, component)
  }
}

export default { install: installXqComponents }
