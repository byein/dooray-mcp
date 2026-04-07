/**
 * Get Calendars Tool
 * Dooray 캘린더 목록 조회
 */

import { z } from 'zod';
import * as calendarApi from '../../api/calendar.js';
import { formatError } from '../../utils/errors.js';

export const getCalendarsSchema = z.object({});

export type GetCalendarsInput = z.infer<typeof getCalendarsSchema>;

export async function getCalendarsHandler(_args: GetCalendarsInput) {
  try {
    const result = await calendarApi.getCalendars();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${formatError(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export const getCalendarsTool = {
  name: 'get-calendars',
  description: `Dooray 캘린더 목록을 조회합니다.

나의 멤버가 접근 가능한 캘린더(개인, 프로젝트 등) 목록을 반환합니다.
캘린더 ID는 일정 조회나 일정 생성 시 필요합니다.

**사용 예시**:
- 캘린더 목록 조회: {} (파라미터 없음)

Returns: 캘린더 목록 (id, name, type 등 포함)`,
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};
