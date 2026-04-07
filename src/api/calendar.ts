/**
 * Dooray Calendar API
 * 캘린더 목록 조회, 일정 조회, 일정 생성
 */

import { getClient } from './client.js';

const CALENDAR_BASE = '/calendar/v1';

export interface Calendar {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  ownerOrganizationMemberId?: string;
  projectId?: string;
  me?: {
    default: boolean;
    color: string;
    listed: boolean;
    checked: boolean;
    role: string;
    order: number;
  };
}

export interface CalendarEvent {
  id: string;
  masterScheduleId?: string;
  calendar?: { id: string; name: string };
  subject: string;
  body?: { mimeType: string; content: string };
  startedAt: string;
  endedAt: string;
  wholeDayFlag?: boolean;
  location?: string;
  category?: string;
  recurrenceType?: string;
  createdAt?: string;
  updatedAt?: string;
  me?: {
    type: string;
    member?: {
      organizationMemberId: string;
      emailAddress?: string;
      name?: string;
    };
    status?: string;
    userType?: string;
  };
}

export interface GetEventsParams {
  calendarIds: string[];
  timeMin: string;
  timeMax: string;
}

export interface CreateEventParams {
  calendarId: string;
  subject: string;
  body?: { mimeType: 'text/html' | 'text/x-markdown'; content: string };
  startedAt: string;
  endedAt: string;
  wholeDayFlag?: boolean;
  location?: string;
  users?: {
    to?: Array<{ type: 'member'; member: { organizationMemberId: string } }>;
    cc?: Array<{ type: 'member'; member: { organizationMemberId: string } }>;
  };
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    until?: string;
    byday?: string;
    bymonth?: string;
    bymonthday?: string;
    timezoneName?: string;
  };
  personalSettings?: {
    alarms?: Array<{ action: string; trigger: string }>;
    busy?: boolean;
    class?: 'public' | 'private';
  };
}

/**
 * 캘린더 목록 조회
 */
export async function getCalendars(): Promise<Calendar[]> {
  const client = getClient();
  return client.get(`${CALENDAR_BASE}/calendars`);
}

/**
 * 일정 조회 (기간별)
 */
export async function getEvents(params: GetEventsParams): Promise<CalendarEvent[]> {
  const client = getClient();
  return client.get(`${CALENDAR_BASE}/calendars/*/events`, {
    calendars: params.calendarIds.join(','),
    timeMin: params.timeMin,
    timeMax: params.timeMax,
  });
}

/**
 * 일정 생성
 */
export async function createEvent(params: CreateEventParams): Promise<{ id: string }> {
  const client = getClient();
  const { calendarId, ...body } = params;
  return client.post(`${CALENDAR_BASE}/calendars/${calendarId}/events`, body);
}
