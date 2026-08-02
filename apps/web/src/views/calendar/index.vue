<script setup lang="ts">
/**
 * 日历主页
 * 左侧小月历 + 右侧日程面板，支持新建/编辑/详情弹窗、签到、完成。
 */
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { message } from 'ant-design-vue'
import type { CalendarEvent, CalendarEventForm } from './types'
import { CalendarEventType, CalendarEventStatus, eventTypeColors } from './types'
import {
  getCalendarEventList,
  getCalendarMonthDots,
  saveCalendarEvent,
  deleteCalendarEvent,
  checkInCalendarEvent,
  completeCalendarEvent,
} from './api'

dayjs.locale('zh-cn')

const currentDate = ref(dayjs())
const selectedDate = ref(dayjs())
const events = ref<CalendarEvent[]>([])
const monthDots = ref<Record<string, number[]>>({})
const loading = ref(false)

const formVisible = ref(false)
const detailVisible = ref(false)
const formData = ref<CalendarEventForm>({})
const detailEvent = ref<CalendarEvent | null>(null)
const isEdit = computed(() => !!formData.value.id)

const eventStatusMap: Record<number, { text: string; color: string }> = {
  [CalendarEventStatus.DRAFT]: { text: '草稿', color: 'gray' },
  [CalendarEventStatus.PENDING]: { text: '待进行', color: 'blue' },
  [CalendarEventStatus.COMPLETED]: { text: '已完成', color: 'green' },
  [CalendarEventStatus.CANCELLED]: { text: '已取消', color: 'red' },
}

const sourceTypeMap: Record<number, string> = {
  1: '手工创建',
  2: '意向管理',
  3: '任务系统',
  4: '售后工单',
  5: '学术活动',
}

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const selectedDateStr = computed(() => selectedDate.value.format('YYYY-MM-DD'))
const currentMonthStr = computed(() => currentDate.value.format('YYYY年M月'))

const calendarDays = computed(() => {
  const start = currentDate.value.startOf('month').startOf('week').add(1, 'day')
  const end = currentDate.value.endOf('month').endOf('week').add(1, 'day')
  const days: dayjs.Dayjs[] = []
  let d = start.clone()
  while (d.isBefore(end) || d.isSame(end, 'day')) {
    days.push(d.clone())
    d = d.add(1, 'day')
  }
  return days
})

const weekRange = computed(() => {
  const start = selectedDate.value.startOf('week').add(1, 'day')
  return Array.from({ length: 7 }, (_, i) => start.clone().add(i, 'day'))
})

const groupedEvents = computed(() => {
  const morning: CalendarEvent[] = []
  const afternoon: CalendarEvent[] = []
  const evening: CalendarEvent[] = []

  events.value.forEach((e) => {
    const hour = dayjs(e.startTime.replace(' ', 'T')).hour()
    if (hour < 12) morning.push(e)
    else if (hour < 18) afternoon.push(e)
    else evening.push(e)
  })

  return [
    { key: 'morning', label: '上午（08:00-12:00）', list: morning },
    { key: 'afternoon', label: '下午（12:00-18:00）', list: afternoon },
    { key: 'evening', label: '晚上（18:00 后）', list: evening },
  ]
})

function formatTime(startTime: string, endTime: string): string {
  const s = dayjs(startTime.replace(' ', 'T')).format('HH:mm')
  const e = dayjs(endTime.replace(' ', 'T')).format('HH:mm')
  return `${s}-${e}`
}

function isToday(date: dayjs.Dayjs): boolean {
  return date.isSame(dayjs(), 'day')
}

function isSelected(date: dayjs.Dayjs): boolean {
  return date.isSame(selectedDate.value, 'day')
}

function isCurrentMonth(date: dayjs.Dayjs): boolean {
  return date.isSame(currentDate.value, 'month')
}

function getDots(date: dayjs.Dayjs): number[] {
  return monthDots.value[date.format('YYYY-MM-DD')] || []
}

async function fetchEvents() {
  loading.value = true
  try {
    const res = await getCalendarEventList({
      queryDate: selectedDateStr.value,
      pageNum: 1,
      pageSize: 50,
    })
    events.value = res.list || []
  } finally {
    loading.value = false
  }
}

async function fetchMonthDots() {
  const res = await getCalendarMonthDots(currentDate.value.format('YYYY-MM'))
  monthDots.value = res.dateDotMap || {}
}

function handleSelectDate(date: dayjs.Dayjs) {
  selectedDate.value = date.clone()
  if (!date.isSame(currentDate.value, 'month')) {
    currentDate.value = date.clone()
    fetchMonthDots()
  }
  fetchEvents()
}

function handlePrevMonth() {
  currentDate.value = currentDate.value.subtract(1, 'month')
  fetchMonthDots()
}

function handleNextMonth() {
  currentDate.value = currentDate.value.add(1, 'month')
  fetchMonthDots()
}

function openCreate() {
  formData.value = {
    eventType: CalendarEventType.CUSTOMER_VISIT,
    startTime: `${selectedDateStr.value} 09:00`,
    endTime: `${selectedDateStr.value} 10:00`,
    reminderFlag: true,
  }
  formVisible.value = true
}

function openEdit(event: CalendarEvent) {
  formData.value = {
    id: event.id,
    eventType: event.eventType,
    subject: event.subject,
    startTime: event.startTime,
    endTime: event.endTime,
    customerId: event.customerId,
    customerName: event.customerName,
    intentionId: event.intentionId,
    intentionName: event.intentionName,
    attendeeIds: event.attendeeIds,
    attendeeNames: event.attendeeNames,
    remark: event.remark,
    reminderFlag: event.reminderFlag,
  }
  detailVisible.value = false
  formVisible.value = true
}

function openDetail(event: CalendarEvent) {
  detailEvent.value = event
  detailVisible.value = true
}

async function handleSave() {
  if (
    !formData.value.eventType ||
    !formData.value.subject ||
    !formData.value.startTime ||
    !formData.value.endTime
  ) {
    message.error('请填写必填项')
    return
  }
  const start = dayjs(formData.value.startTime.replace(' ', 'T'))
  const end = dayjs(formData.value.endTime.replace(' ', 'T'))
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    message.error('结束时间不能早于开始时间')
    return
  }
  if (
    (formData.value.eventType === CalendarEventType.CUSTOMER_VISIT ||
      formData.value.eventType === CalendarEventType.INTENTION_FOLLOW ||
      formData.value.eventType === CalendarEventType.MEETING) &&
    !formData.value.customerId
  ) {
    message.error('请关联客户')
    return
  }

  await saveCalendarEvent(formData.value)
  message.success('日程保存成功')
  formVisible.value = false
  await fetchEvents()
  await fetchMonthDots()
}

async function handleDelete(event: CalendarEvent) {
  if (!confirm('确定删除该日程？')) return
  await deleteCalendarEvent(event.id)
  message.success('删除成功')
  detailVisible.value = false
  await fetchEvents()
  await fetchMonthDots()
}

async function handleCheckIn(event: CalendarEvent) {
  await checkInCalendarEvent(event.id, {
    signInTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    signInLocation: '客户现场',
  })
  message.success('签到成功')
  await fetchEvents()
}

async function handleComplete(event: CalendarEvent) {
  await completeCalendarEvent(event.id)
  message.success('已标记完成')
  await fetchEvents()
  await fetchMonthDots()
}

function showCheckIn(event: CalendarEvent): boolean {
  return (
    event.eventStatus === CalendarEventStatus.PENDING &&
    (event.eventType === CalendarEventType.CUSTOMER_VISIT ||
      event.eventType === CalendarEventType.TASK_DEADLINE)
  )
}

function showComplete(event: CalendarEvent): boolean {
  return event.eventStatus === CalendarEventStatus.PENDING
}

function showEdit(event: CalendarEvent): boolean {
  return event.sourceType === 1
}

function showDelete(event: CalendarEvent): boolean {
  return event.sourceType === 1
}

const eventTypeOptions = [
  {
    value: CalendarEventType.CUSTOMER_VISIT,
    label: '客户拜访',
    color: eventTypeColors[CalendarEventType.CUSTOMER_VISIT],
  },
  {
    value: CalendarEventType.INTENTION_FOLLOW,
    label: '意向跟进',
    color: eventTypeColors[CalendarEventType.INTENTION_FOLLOW],
  },
  {
    value: CalendarEventType.MEETING,
    label: '会议/学术',
    color: eventTypeColors[CalendarEventType.MEETING],
  },
  {
    value: CalendarEventType.TASK_DEADLINE,
    label: '任务截止',
    color: eventTypeColors[CalendarEventType.TASK_DEADLINE],
  },
  {
    value: CalendarEventType.KEY_NODE,
    label: '关键节点',
    color: eventTypeColors[CalendarEventType.KEY_NODE],
  },
]

onMounted(() => {
  fetchEvents()
  fetchMonthDots()
})

watch(
  () => selectedDate.value,
  () => {
    // selectedDate 变化已在 handleSelectDate 中触发 fetchEvents
  },
)
</script>

<template>
  <XqPageLayout :show-stats="false" :show-filter="false" padding="16px">
    <template #title>
      <span class="section-title">日历</span>
    </template>

    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <span class="flex items-center gap-1">
          <XqIcon name="plus" size="14" />
          <span>新建日程</span>
        </span>
      </XqButton>
    </template>

    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        <!-- 左侧小月历 -->
        <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[var(--ink)]">{{ currentMonthStr }}</h3>
            <div class="flex items-center gap-1">
              <button class="p-1 rounded hover:bg-[var(--gray-bg)]" @click="handlePrevMonth">
                <XqIcon name="arrow-left" size="16" />
              </button>
              <button class="p-1 rounded hover:bg-[var(--gray-bg)]" @click="handleNextMonth">
                <XqIcon name="arrow-right" size="16" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 text-center text-sm text-[var(--sub)] mb-2">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>

          <div class="grid grid-cols-7 gap-1 text-center text-sm flex-1">
            <button
              v-for="date in calendarDays"
              :key="date.format('YYYY-MM-DD')"
              class="flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors min-h-[48px]"
              :class="{
                'bg-[var(--primary)] text-white': isSelected(date),
                'text-[var(--ink)] hover:bg-[var(--gray-bg)]':
                  !isSelected(date) && isCurrentMonth(date),
                'text-[var(--sub)] hover:bg-[var(--gray-bg)]':
                  !isSelected(date) && !isCurrentMonth(date),
              }"
              @click="handleSelectDate(date)"
            >
              <span class="leading-none">{{ date.date() }}</span>
              <span class="flex gap-0.5 mt-1 h-1">
                <span
                  v-for="dot in getDots(date)"
                  :key="dot"
                  class="w-1 h-1 rounded-full"
                  :style="{ backgroundColor: eventTypeColors[dot] }"
                />
              </span>
            </button>
          </div>

          <!-- 标签说明 -->
          <div class="mt-4 pt-4 border-t border-[var(--line)] space-y-2">
            <p class="text-xs font-medium text-[var(--sub)]">标签说明</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="opt in eventTypeOptions"
                :key="opt.value"
                class="flex items-center gap-1 text-xs text-[var(--ink)]"
              >
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: opt.color }" />
                <span>{{ opt.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧日程面板 -->
        <div
          class="lg:col-span-3 bg-[var(--card)] rounded-xl border border-[var(--line)] flex flex-col overflow-hidden"
        >
          <!-- 顶部日期条 -->
          <div class="grid grid-cols-8 border-b border-[var(--line)]">
            <button
              class="py-3 text-sm font-medium flex flex-col items-center justify-center transition-colors"
              :class="
                isToday(selectedDate)
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'
              "
              @click="handleSelectDate(dayjs())"
            >
              <span>今日</span>
            </button>
            <button
              v-for="date in weekRange"
              :key="date.format('YYYY-MM-DD')"
              class="py-3 text-sm flex flex-col items-center justify-center transition-colors border-l border-[var(--line)]"
              :class="
                isSelected(date)
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'
              "
              @click="handleSelectDate(date)"
            >
              <span class="text-xs opacity-80">{{ date.format('ddd') }}</span>
              <span>{{ date.format('MM/DD') }}</span>
            </button>
          </div>

          <!-- 日程标题 -->
          <div class="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
            <h3 class="font-semibold text-[var(--ink)]">
              {{ selectedDate.format('M月D日 dddd') }} 日程
            </h3>
            <span class="text-sm text-[var(--sub)]"> 共 {{ events.length }} 项 </span>
          </div>

          <!-- 日程列表 -->
          <div class="flex-1 overflow-y-auto p-5">
            <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>

            <template v-else-if="events.length > 0">
              <div v-for="group in groupedEvents" :key="group.key" class="mb-6">
                <h4 class="text-sm font-medium text-[var(--sub)] mb-3">{{ group.label }}</h4>
                <div class="space-y-3">
                  <div
                    v-for="event in group.list"
                    :key="event.id"
                    class="flex items-center gap-3 p-4 rounded-lg border border-[var(--line)] hover:shadow-sm transition-shadow bg-[var(--bg)]"
                  >
                    <div
                      class="w-1.5 h-12 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: eventTypeColors[event.eventType] }"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <XqStatusBadge
                          :status="event.eventType"
                          :status-map="
                            Object.fromEntries(
                              eventTypeOptions.map((o) => [
                                o.value,
                                { text: o.label, color: o.color },
                              ]),
                            )
                          "
                          size="small"
                        />
                        <XqStatusBadge
                          :status="event.eventStatus"
                          :status-map="eventStatusMap"
                          size="small"
                        />
                        <span class="text-sm text-[var(--ink)] font-medium truncate">
                          {{ event.subject }}
                        </span>
                      </div>
                      <div class="text-xs text-[var(--sub)] flex flex-wrap gap-x-4 gap-y-1">
                        <span>{{ formatTime(event.startTime, event.endTime) }}</span>
                        <span v-if="event.customerName">{{ event.customerName }}</span>
                        <span v-if="event.intentionName">{{ event.intentionName }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <button
                        v-if="showCheckIn(event)"
                        class="btn btn-ghost text-xs px-2 py-1"
                        @click.stop="handleCheckIn(event)"
                      >
                        签到
                      </button>
                      <button
                        v-if="showComplete(event)"
                        class="btn btn-ghost text-xs px-2 py-1 text-[var(--primary)]"
                        @click.stop="handleComplete(event)"
                      >
                        完成
                      </button>
                      <button
                        class="btn btn-ghost text-xs px-2 py-1"
                        @click.stop="openDetail(event)"
                      >
                        详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <XqEmptyState
              v-else
              type="empty"
              title="当天暂无日程"
              description="点击下方「新建日程」安排一次客户拜访或跟进"
              :action="{ text: '新建日程', onClick: openCreate }"
            />
          </div>
        </div>
      </div>
    </template>
  </XqPageLayout>

  <!-- 新建/编辑弹窗 -->
  <XqModal v-model:visible="formVisible" :title="isEdit ? '编辑日程' : '新建日程'" width="480px">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >日程类型 <span class="text-[var(--danger)]">*</span></label
        >
        <div class="flex flex-wrap gap-2 mt-1">
          <button
            v-for="opt in eventTypeOptions"
            :key="opt.value"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs border transition-colors"
            :class="
              formData.eventType === opt.value
                ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]'
                : 'border-[var(--line)] text-[var(--ink)] hover:border-[var(--primary)]'
            "
            @click="formData.eventType = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >日程主题 <span class="text-[var(--danger)]">*</span></label
        >
        <input
          v-model="formData.subject"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
          placeholder="请输入日程主题"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-[var(--ink)]"
            >开始时间 <span class="text-[var(--danger)]">*</span></label
          >
          <input
            v-model="formData.startTime"
            type="text"
            class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
            placeholder="yyyy-MM-dd HH:mm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-[var(--ink)]"
            >结束时间 <span class="text-[var(--danger)]">*</span></label
          >
          <input
            v-model="formData.endTime"
            type="text"
            class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
            placeholder="yyyy-MM-dd HH:mm"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">关联客户</label>
        <input
          v-model="formData.customerName"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
          placeholder="请输入客户名称"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">关联意向</label>
        <input
          v-model="formData.intentionName"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
          placeholder="请输入意向名称"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">参与人</label>
        <input
          v-model="formData.attendeeNames"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
          placeholder="请输入参与人姓名，多个用逗号分隔"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">备注</label>
        <textarea
          v-model="formData.remark"
          rows="3"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)] resize-none"
          placeholder="请输入备注"
        />
      </div>

      <div class="flex items-center gap-2">
        <input
          id="reminderFlag"
          v-model="formData.reminderFlag"
          type="checkbox"
          class="w-4 h-4 rounded border-[var(--line)] text-[var(--primary)]"
        />
        <label for="reminderFlag" class="text-sm text-[var(--ink)]">日程提醒</label>
      </div>
    </div>

    <template #footer>
      <XqButton @click="formVisible = false">取消</XqButton>
      <XqButton type="primary" @click="handleSave">保存</XqButton>
    </template>
  </XqModal>

  <!-- 详情弹窗 -->
  <XqModal v-model:visible="detailVisible" title="日程详情" width="520px">
    <div v-if="detailEvent" class="space-y-4">
      <div class="flex items-center gap-2">
        <XqStatusBadge
          :status="detailEvent.eventType"
          :status-map="
            Object.fromEntries(
              eventTypeOptions.map((o) => [o.value, { text: o.label, color: o.color }]),
            )
          "
        />
        <XqStatusBadge :status="detailEvent.eventStatus" :status-map="eventStatusMap" />
      </div>

      <h3 class="text-lg font-semibold text-[var(--ink)]">{{ detailEvent.subject }}</h3>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-[var(--sub)]">时间</span>
          <p class="text-[var(--ink)] mt-0.5">
            {{ formatTime(detailEvent.startTime, detailEvent.endTime) }}
          </p>
        </div>
        <div>
          <span class="text-[var(--sub)]">来源</span>
          <p class="text-[var(--ink)] mt-0.5">
            {{ sourceTypeMap[detailEvent.sourceType] || '未知' }}
          </p>
        </div>
        <div v-if="detailEvent.customerName">
          <span class="text-[var(--sub)]">关联客户</span>
          <p class="text-[var(--ink)] mt-0.5">{{ detailEvent.customerName }}</p>
        </div>
        <div v-if="detailEvent.intentionName">
          <span class="text-[var(--sub)]">关联意向</span>
          <p class="text-[var(--ink)] mt-0.5">{{ detailEvent.intentionName }}</p>
        </div>
        <div v-if="detailEvent.attendeeNames">
          <span class="text-[var(--sub)]">参与人</span>
          <p class="text-[var(--ink)] mt-0.5">{{ detailEvent.attendeeNames }}</p>
        </div>
        <div v-if="detailEvent.ownerName">
          <span class="text-[var(--sub)]">归属人</span>
          <p class="text-[var(--ink)] mt-0.5">{{ detailEvent.ownerName }}</p>
        </div>
      </div>

      <div v-if="detailEvent.signInTime" class="text-sm">
        <span class="text-[var(--sub)]">签到信息</span>
        <p class="text-[var(--ink)] mt-0.5">
          {{ detailEvent.signInTime }}
          <span v-if="detailEvent.signInLocation">· {{ detailEvent.signInLocation }}</span>
        </p>
      </div>

      <div v-if="detailEvent.completedTime" class="text-sm">
        <span class="text-[var(--sub)]">完成时间</span>
        <p class="text-[var(--ink)] mt-0.5">{{ detailEvent.completedTime }}</p>
      </div>

      <div v-if="detailEvent.remark" class="text-sm">
        <span class="text-[var(--sub)]">备注</span>
        <p class="text-[var(--ink)] mt-0.5 whitespace-pre-wrap">{{ detailEvent.remark }}</p>
      </div>
    </div>

    <template #footer>
      <XqButton @click="detailVisible = false">关闭</XqButton>
      <XqButton
        v-if="detailEvent && showDelete(detailEvent)"
        class="text-[var(--danger)] border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white"
        @click="handleDelete(detailEvent)"
      >
        删除
      </XqButton>
      <XqButton
        v-if="detailEvent && showComplete(detailEvent)"
        type="primary"
        @click="handleComplete(detailEvent)"
      >
        标记完成
      </XqButton>
      <XqButton
        v-if="detailEvent && showEdit(detailEvent)"
        type="primary"
        @click="openEdit(detailEvent)"
      >
        编辑
      </XqButton>
    </template>
  </XqModal>
</template>
