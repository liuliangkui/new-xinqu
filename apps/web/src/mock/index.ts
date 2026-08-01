import Mock from 'mockjs'

// 仅在开发环境启用
if (import.meta.env.DEV) {
  Mock.setup({
    timeout: '200-600',
  })

  // 示例：首页 KPI 数据
  Mock.mock(/\/api\/dashboard\/kpi$/, 'get', {
    code: 200,
    success: true,
    message: 'success',
    data: {
      total: '@integer(100, 999)',
      pending: '@integer(10, 99)',
      inProgress: '@integer(20, 199)',
      completed: '@integer(30, 299)',
      conversionRate: '@float(10, 50, 1, 1)',
    },
  })

  // 示例：列表数据
  Mock.mock(/\/api\/intentions(\?.*)?$/, 'get', {
    code: 200,
    success: true,
    message: 'success',
    data: {
      total: 56,
      page: 1,
      size: 12,
      pages: 5,
      'list|12': [
        {
          'id|+1': 1,
          name: '@ctitle(5, 12)',
          customer: '@ctitle(8, 16)',
          amount: '@integer(10000, 999999)',
          stage: '@pick(["draft", "approving", "effective", "rejected", "closed"])',
          owner: '@cname',
          updateTime: '@datetime',
        },
      ],
    },
  })

  // 示例：用户菜单
  Mock.mock(/\/api\/user\/menus$/, 'get', {
    code: 200,
    success: true,
    message: 'success',
    data: [
      { key: 'home', label: '工作台', icon: 'home', path: '/' },
      { key: 'calendar', label: '日历', icon: 'calendar', path: '/calendar' },
      { key: 'tasks', label: '任务', icon: 'task', path: '/tasks' },
      { key: 'contacts', label: '通讯录', icon: 'contacts', path: '/contacts' },
      { key: 'apps', label: '应用中心', icon: 'apps', path: '/apps' },
      { key: 'favorites', label: '收藏', icon: 'star', path: '/favorites' },
    ],
  })
}
