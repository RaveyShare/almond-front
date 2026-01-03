/**
 * 日期工具函数
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化相对时间
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间描述,如 "2小时前"
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * 格式化日期
 * @param date - 日期字符串或 Date 对象
 * @param format - 格式字符串,默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format);
}

/**
 * 判断日期是否是今天
 * @param date - 日期字符串或 Date 对象
 * @returns 是否是今天
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 判断日期是否是昨天
 * @param date - 日期字符串或 Date 对象
 * @returns 是否是昨天
 */
export function isYesterday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
}

/**
 * 智能格式化时间
 * - 今天:显示 "今天 HH:mm"
 * - 昨天:显示 "昨天 HH:mm"
 * - 本年:显示 "MM-DD HH:mm"
 * - 其他:显示 "YYYY-MM-DD"
 */
export function smartFormatTime(date: string | Date): string {
  const d = dayjs(date);
  const now = dayjs();

  if (d.isSame(now, 'day')) {
    return `今天 ${d.format('HH:mm')}`;
  }

  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return `昨天 ${d.format('HH:mm')}`;
  }

  if (d.isSame(now, 'year')) {
    return d.format('MM-DD HH:mm');
  }

  return d.format('YYYY-MM-DD');
}
