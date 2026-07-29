/**
 * 应用配置常量
 */

/** API 基准路径 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 12

/** 分页大小选项 */
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96]

/** 移动端断点 */
export const MOBILE_BREAKPOINT = 768

/** Token 存储键 */
export const TOKEN_KEY = 'xinqu-token'

/** 主题存储键 */
export const THEME_KEY = 'xinqu-theme'

/** 应用名称 */
export const APP_NAME = '鑫渠 CRM'
export const APP_SHORT_NAME = '鑫渠'
