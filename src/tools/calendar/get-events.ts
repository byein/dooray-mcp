/**
 * Get Calendar Events Tool
 * Dooray 캘린더 일정 조회 (기간별)
 */

import { z } from 'zod';
import * as calendarApi from '../../api/calendar.js';
import { formatError } from '../../utils/errors.js';

export const getEventsSchema = z.object({
  calendarIds: z
    .array(z.string())
    .describe('조회할 캘린더 ID 배열. get-calendars로 먼저 캘린더 ID를 확인하세요.'),
  timeMin: z
    .string()
    .describe('조회 시작 시간 (ISO 8601 형식, inclusive). 예: 2025-04-11T00:00:00+09:00'),
  timeMax: z
    .string()
    .describe('조회 종료 시간 (ISO 8601 형식, exclusive). 예: 2025-04-18T00:00:00+09:00'),
});

export type GetEventsInput = z.infer<typeof getEventsSchema>;

export async function getEventsHandler(args: GetEventsInput) {
  try {
    const result = await calendarApi.getEvents({
      calendarIds: args.calendarIds,
      timeMin: args.timeMin,
      timeMax: args.timeMax,
    });
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

export const getEventsTool = {
  name: 'get-calendar-events',
  description: `Dooray 캘린더의 일정을 기간별로 조회합니다.

지정한 캘린더들의 일정을 시작/종료 시간 범위로 조회합니다.
캘린더 ID는 get-calendars 도구로 먼저 확인하세요.

**사용 예시**:
- 이번 주 일정 조회: { "calendarIds": ["cal-id-1"], "timeMin": "2025-04-07T00:00:00+09:00", "timeMax": "2025-04-14T00:00:00+09:00" }
- 여러 캘린더 동시 조회: { "calendarIds": ["cal-1", "cal-2"], "timeMin": "...", "timeMax": "..." }

Returns: 일정 목록 (id, subject, startedAt, endedAt, location, 참석자 등 포함)`,
  inputSchema: {
    type: 'object',
    properties: {
      calendarIds: {
        type: 'array',
        items: { type: 'string' },
        description: '조회할 캘린더 ID 배열',
      },
      timeMin: {
        type: 'string',
        description: '조회 시작 시간 (ISO 8601, inclusive)',
      },
      timeMax: {
        type: 'string',
        description: '조회 종료 시간 (ISO 8601, exclusive)',
      },
    },
    required: ['calendarIds', 'timeMin', 'timeMax'],
  },
};
