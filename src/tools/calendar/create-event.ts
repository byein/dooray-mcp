/**
 * Create Calendar Event Tool
 * Dooray 캘린더 일정 생성
 */

import { z } from 'zod';
import * as calendarApi from '../../api/calendar.js';
import { formatError } from '../../utils/errors.js';

export const createEventSchema = z.object({
  calendarId: z.string().describe('일정을 생성할 캘린더 ID'),
  subject: z.string().describe('일정 제목'),
  startedAt: z.string().describe('시작 시간 (ISO 8601 형식). 예: 2025-04-11T14:00:00+09:00'),
  endedAt: z.string().describe('종료 시간 (ISO 8601 형식). 예: 2025-04-11T15:00:00+09:00'),
  body: z
    .object({
      mimeType: z.enum(['text/html', 'text/x-markdown']).default('text/html'),
      content: z.string(),
    })
    .optional()
    .describe('일정 설명'),
  wholeDayFlag: z.boolean().optional().describe('종일 일정 여부 (기본값: false)'),
  location: z.string().optional().describe('장소'),
  toMemberIds: z
    .array(z.string())
    .optional()
    .describe('참석자 organizationMemberId 배열'),
  ccMemberIds: z
    .array(z.string())
    .optional()
    .describe('참조자 organizationMemberId 배열'),
  recurrenceRule: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
      interval: z.number().optional(),
      until: z.string().optional(),
      byday: z.string().optional(),
      bymonth: z.string().optional(),
      bymonthday: z.string().optional(),
      timezoneName: z.string().optional().default('Asia/Seoul'),
    })
    .optional()
    .describe('반복 규칙'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export async function createEventHandler(args: CreateEventInput) {
  try {
    const users: calendarApi.CreateEventParams['users'] = {};
    if (args.toMemberIds?.length) {
      users.to = args.toMemberIds.map((id) => ({
        type: 'member' as const,
        member: { organizationMemberId: id },
      }));
    }
    if (args.ccMemberIds?.length) {
      users.cc = args.ccMemberIds.map((id) => ({
        type: 'member' as const,
        member: { organizationMemberId: id },
      }));
    }

    const result = await calendarApi.createEvent({
      calendarId: args.calendarId,
      subject: args.subject,
      startedAt: args.startedAt,
      endedAt: args.endedAt,
      body: args.body,
      wholeDayFlag: args.wholeDayFlag,
      location: args.location,
      users: args.toMemberIds?.length || args.ccMemberIds?.length ? users : undefined,
      recurrenceRule: args.recurrenceRule,
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

export const createEventTool = {
  name: 'create-calendar-event',
  description: `Dooray 캘린더에 새 일정을 생성합니다.

캘린더 ID는 get-calendars 도구로 먼저 확인하세요.
참석자를 추가하려면 search-members 도구로 organizationMemberId를 확인하세요.

**사용 예시**:
- 기본 일정: { "calendarId": "cal-id", "subject": "회의", "startedAt": "2025-04-11T14:00:00+09:00", "endedAt": "2025-04-11T15:00:00+09:00" }
- 종일 일정: { "calendarId": "cal-id", "subject": "휴가", "startedAt": "2025-04-11T00:00:00+09:00", "endedAt": "2025-04-12T00:00:00+09:00", "wholeDayFlag": true }
- 참석자 포함: { ..., "toMemberIds": ["member-id-1", "member-id-2"] }
- 반복 일정: { ..., "recurrenceRule": { "frequency": "weekly", "byday": "MO,WE,FR" } }

Returns: 생성된 일정 정보 (id 포함)`,
  inputSchema: {
    type: 'object',
    properties: {
      calendarId: { type: 'string', description: '캘린더 ID' },
      subject: { type: 'string', description: '일정 제목' },
      startedAt: { type: 'string', description: '시작 시간 (ISO 8601)' },
      endedAt: { type: 'string', description: '종료 시간 (ISO 8601)' },
      body: {
        type: 'object',
        properties: {
          mimeType: { type: 'string', enum: ['text/html', 'text/x-markdown'] },
          content: { type: 'string' },
        },
        description: '일정 설명',
      },
      wholeDayFlag: { type: 'boolean', description: '종일 일정 여부' },
      location: { type: 'string', description: '장소' },
      toMemberIds: {
        type: 'array',
        items: { type: 'string' },
        description: '참석자 organizationMemberId 배열',
      },
      ccMemberIds: {
        type: 'array',
        items: { type: 'string' },
        description: '참조자 organizationMemberId 배열',
      },
      recurrenceRule: {
        type: 'object',
        properties: {
          frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
          interval: { type: 'number' },
          until: { type: 'string' },
          byday: { type: 'string' },
          bymonth: { type: 'string' },
          bymonthday: { type: 'string' },
          timezoneName: { type: 'string' },
        },
        required: ['frequency'],
        description: '반복 규칙',
      },
    },
    required: ['calendarId', 'subject', 'startedAt', 'endedAt'],
  },
};
